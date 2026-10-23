import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

type ErrorBody = {
  success: false;
  message: string;
  errors?: string[];
  data: null;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = {
      success: false,
      message: 'Internal server error',
      data: null,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const r = (typeof res === 'object' && res !== null ? res : {}) as {
        message?: string | string[];
      };

      if (Array.isArray(r.message)) {
        // error dari class-validator
        body = {
          success: false,
          message: 'Validation error',
          errors: r.message,
          data: null,
        };
      } else if (typeof r.message === 'string') {
        body = { success: false, message: r.message, data: null };
      } else if (typeof res === 'string') {
        body = { success: false, message: res, data: null };
      } else {
        body = { success: false, message: exception.message, data: null };
      }
    } else {
      // error tidak terduga: catat lengkap di log, jangan bocorkan ke client
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    httpAdapter.reply(ctx.getResponse(), body, status);
  }
}
