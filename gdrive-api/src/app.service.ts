import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): any {
    const dbHost = this.configService.get<string>('DATABASE_HOST');
    const appPort = this.configService.get<number>('PORT');
    const nodeEnv = process.env.NODE_ENV || 'local';

    return {
      environment: nodeEnv,
      port: appPort,
      databaseHost: dbHost,
    };
  }
}
