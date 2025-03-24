import { Injectable } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

interface ErrorMessage {
  path: string;
  message: string;
}

@Injectable()
export class PrismaExceptionFormatter {
  formatPrismaError(exception: PrismaClientKnownRequestError): ErrorMessage[] {
    const errorMessages: ErrorMessage[] = [];

    switch (exception.code) {
      case 'P2002':
        errorMessages.push({
          path: exception.meta?.target?.[0] || 'unknown_field',
          message: `A record with this ${exception.meta?.target?.[0]} already exists.`,
        });
        break;
      case 'P2003':
        errorMessages.push({
          path: (exception.meta?.field_name as string) || 'unknown_relation',
          message: `Invalid reference: ${exception.meta?.field_name as string}.`,
        });
        break;
      case 'P2005': // Invalid value
      case 'P2006': // Invalid format
        errorMessages.push({
          path: (exception.meta?.field_name as string) || 'unknown_field',
          message: `Invalid value for ${exception.meta?.field_name as string}.`,
        });
        break;
      case 'P2025': // Record not found
        errorMessages.push({
          path: (exception.meta?.model_name as string) || 'resource',
          message: `The requested ${exception.meta?.model_name as string} does not exist.`,
        });
        break;
      default:
        errorMessages.push({
          path: 'unknown_error',
          message: exception.message || 'An unknown Prisma error occurred.',
        });
    }

    return errorMessages;
  }

  formatQueryError(
    exception: PrismaClientValidationError | PrismaClientRustPanicError,
  ): ErrorMessage[] {
    return [
      {
        path: 'query',
        message: exception.message || 'Invalid query or database error.',
      },
    ];
  }

  formatInitializationError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exception: PrismaClientInitializationError,
  ): ErrorMessage[] {
    return [
      {
        path: 'database',
        message: 'Failed to connect to the database.',
      },
    ];
  }

  formatUnknownError(exception: any): ErrorMessage[] {
    return [
      {
        path: 'unknown',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message: exception?.message || 'An unexpected Prisma error occurred.',
      },
    ];
  }

  formatError(exception: any): ErrorMessage[] {
    if (exception instanceof PrismaClientKnownRequestError) {
      return this.formatPrismaError(exception);
    } else if (
      exception instanceof PrismaClientValidationError ||
      exception instanceof PrismaClientRustPanicError
    ) {
      return this.formatQueryError(exception);
    } else if (exception instanceof PrismaClientInitializationError) {
      return this.formatInitializationError(exception);
    } else {
      return this.formatUnknownError(exception);
    }
  }
}
