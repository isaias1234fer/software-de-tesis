import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrcidModule } from './orcid/orcid.module';
import { TemplatesModule } from './templates/templates.module';
import { DraftsModule } from './drafts/drafts.module';
import { StorageModule } from './storage/storage.module';
import { AiModule } from './ai/ai.module';
import { BullModule } from '@nestjs/bullmq';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmailModule } from './email/email.module';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          try {
            const parsed = new URL(redisUrl);
            return {
              connection: {
                host: parsed.hostname,
                port: parseInt(parsed.port, 10) || 6379,
                username: parsed.username || undefined,
                password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
                tls: parsed.protocol === 'rediss:' ? {} : undefined,
              },
            };
          } catch (e) {
            console.error('Error parsing REDIS_URL, falling back to REDIS_HOST/REDIS_PORT:', e);
          }
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: configService.get('REDIS_PORT') || 6379,
          },
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrcidModule,
    TemplatesModule,
    DraftsModule,
    StorageModule,
    AiModule,
    DashboardModule,
    EmailModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
