import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsModule } from './modules/agents/agents.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CommissionsModule } from './modules/commissions/commissions.module';

@Module({
  imports: [
    // Load environment variables from .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Setup Mongoose (MongoDB Atlas) connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Domain Modules
    AgentsModule,
    TransactionsModule,
    CommissionsModule,
  ],
})
export class AppModule {}
