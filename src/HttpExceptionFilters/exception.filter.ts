/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ErrorMessage {
  path: string;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Determine the status code based on exception type
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessages: ErrorMessage[] = [];

    // Handle BadRequestException with validation errors
    if (exception.response?.message) {
      // Handle the case where validation error messages are provided
      if (Array.isArray(exception.response.message)) {
        // Loop over the array to capture the field and message
        errorMessages = exception.response.message.map((error) => {
          const [field] = error.split(' '); // Split based on space
          return {
            path: field,
            message: exception.response.message.join(' '),
          };
        });
      }
    }

    // If no validation-specific message found, default to error path
    if (!errorMessages.length) {
      const fieldMatch = exception?.message?.match(/Field '(\w+)'/);
      const apiPath = request.url; // Captures the request URL

      const field = fieldMatch ? fieldMatch[1] : apiPath;

      errorMessages = [
        {
          path: field,
          message: exception?.message || 'Unknown error',
        },
      ];
    }

    // Send the response
    response.status(status).json({
      success: false,
      message: exception.message || 'Internal Server Error',
      errorMessages,
    });
  }
}
