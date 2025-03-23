import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';
import { DtoValidationFormatter } from 'src/ExceptionsFormatter/dto.exceptions';
import { OtherExceptionFormatter } from 'src/ExceptionsFormatter/other.exceptions';
import { PrismaExceptionFormatter } from 'src/ExceptionsFormatter/prisma.exceptions';

export interface IErrorMessage {
  path: string;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly prismaExceptionFormatter: PrismaExceptionFormatter,
    private readonly dtoValidationFormatter: DtoValidationFormatter,
    private readonly otherValidationFormatter: OtherExceptionFormatter,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessages: IErrorMessage[] = [
      { path: 'unknown', message: 'Internal server error' },
    ];

    if (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientRustPanicError ||
      exception instanceof PrismaClientUnknownRequestError ||
      exception instanceof PrismaClientInitializationError
    ) {
      console.log('prisma');
      errorMessages = this.prismaExceptionFormatter.formatError(exception);
    } else if (exception instanceof HttpException) {
      console.log('dto');
      errorMessages =
        this.dtoValidationFormatter.formatDtoValidationException(exception);
    } else {
      console.log('other');
      errorMessages = this.otherValidationFormatter.formatOtherError(exception);
    }

    // Send the response with a proper error structure
    response.status(status).json({
      success: false,
      message: 'Validation error',
      errorMessages,
    });
  }
}
