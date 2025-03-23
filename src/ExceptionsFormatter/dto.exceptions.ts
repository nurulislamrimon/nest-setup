/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, Injectable } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { IErrorMessage } from 'src/interceptors/exception.interceptor';

@Injectable()
export class DtoValidationFormatter {
  formatDtoValidationException(exception: HttpException): IErrorMessage[] {
    const responseBody: any = exception.getResponse();
    if (
      Array.isArray(responseBody?.message) &&
      responseBody?.message[0] instanceof ValidationError
    ) {
      if (typeof responseBody.message === 'string') {
        return [{ path: 'validation_error', message: responseBody.message }];
      }

      return responseBody.message.map((error: ValidationError) => ({
        path: error.property,
        message: error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Validation error',
      }));
    }

    return [
      {
        path: 'http_error',
        message: responseBody?.message || 'An HTTP error occurred',
      },
    ];
  }
}
