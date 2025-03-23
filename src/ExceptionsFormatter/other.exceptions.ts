/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IErrorMessage } from 'src/interceptors/exception.interceptor';

export class OtherExceptionFormatter {
  formatOtherError(exception: any): IErrorMessage[] {
    const errorMessages: IErrorMessage[] = [];

    if (exception?.path && exception?.message) {
      errorMessages.push({
        path: exception.path || 'unknown_field',
        message: exception.message || 'An unexpected error occurred',
      });
    } else {
      errorMessages.push({
        path: 'unknown',
        message: exception.message || 'An unexpected error occurred',
      });
    }

    return errorMessages;
  }
}
