import { Controller, Get, Request } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
