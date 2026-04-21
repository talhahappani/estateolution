import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthCheck(): string {
    return 'estateolution API is running smoothly!';
  }
}
