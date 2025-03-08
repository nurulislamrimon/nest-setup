import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from './interceptors/response.interceptor';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.CREATED)
  getHello(): ApiResponse<string> {
    const res = this.appService.getHello();
    return {
      data: res,
      message: 'Welcome to central support service!',
    };
  }
}
