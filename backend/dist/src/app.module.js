"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const orcid_module_1 = require("./orcid/orcid.module");
const templates_module_1 = require("./templates/templates.module");
const drafts_module_1 = require("./drafts/drafts.module");
const storage_module_1 = require("./storage/storage.module");
const ai_module_1 = require("./ai/ai.module");
const bullmq_1 = require("@nestjs/bullmq");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const email_module_1 = require("./email/email.module");
const articles_module_1 = require("./articles/articles.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
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
                        }
                        catch (e) {
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
                inject: [config_1.ConfigService],
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            orcid_module_1.OrcidModule,
            templates_module_1.TemplatesModule,
            drafts_module_1.DraftsModule,
            storage_module_1.StorageModule,
            ai_module_1.AiModule,
            dashboard_module_1.DashboardModule,
            email_module_1.EmailModule,
            articles_module_1.ArticlesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map