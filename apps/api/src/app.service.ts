import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      service: 'ltm-api',
      status: 'online',
      message: 'Welcome to the LTM monorepo API',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'ltm-api',
      database: 'postgresql',
      timestamp: new Date().toISOString(),
    };
  }
}
