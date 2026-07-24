"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor(configService) {
        this.configService = configService;
        const host = this.configService.get('SMTP_HOST') || 'smtp.gmail.com';
        const port = parseInt(this.configService.get('SMTP_PORT'), 10) || 587;
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        if (user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                    user,
                    pass,
                },
            });
            console.log(`SMTP Mailer initialized successfully. Host: ${host}:${port}`);
        }
        else {
            console.warn('SMTP credentials not configured in .env. Email service will run in sandbox/simulation mode.');
        }
    }
    async sendReport(to, draftTitle, score, pdfBuffer, studentName) {
        const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@thesis-ia.com';
        const scoreText = score !== null ? `${score.toFixed(1)}/100` : 'Pendiente';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #4f46e5; padding-bottom: 15px;">
          <span style="font-size: 32px;">🎓</span>
          <h2 style="color: #4f46e5; margin: 5px 0 0 0; font-weight: 800;">Tesis-IA</h2>
          <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0; font-weight: 600; uppercase; tracking-wider;">Reporte de Evaluación de Borrador</p>
        </div>
        
        <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">
          Estimado/a <strong>${studentName}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Tu borrador de tesis titulado <strong style="color: #1e293b;">"${draftTitle}"</strong> ha sido analizado exitosamente por nuestro motor de inteligencia académica.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 25px 0; text-align: center;">
          <span style="display: block; font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Puntaje IA Obtenido</span>
          <span style="font-size: 32px; font-weight: 900; color: ${score !== null && score >= 70 ? '#10b981' : '#f59e0b'};">${scoreText}</span>
        </div>
        
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Adjunto a este correo encontrarás el reporte formal detallado en formato <strong>PDF</strong> con todas las observaciones de originalidad, análisis de referencias y recomendaciones de mejora estructural.
        </p>
        
        <div style="margin: 25px 0; padding: 12px 16px; background-color: #eef2ff; border-left: 4px solid #4f46e5; border-radius: 4px;">
          <p style="color: #4338ca; font-size: 12px; margin: 0; line-height: 1.5; font-weight: 600;">
            📱 ¡Optimizado para Móviles! Puedes visualizar el PDF adjunto directamente desde tu aplicación de Gmail o lector de archivos PDF en tu teléfono celular.
          </p>
        </div>
        
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;">
          Este es un correo automático generado por el Sistema de Revisión de Tesis IA.<br/>
          Por favor, no respondas a este mensaje.
        </p>
      </div>
    `;
        const cleanTitle = draftTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const pdfFilename = `reporte_tesis_${cleanTitle}.pdf`;
        if (!this.transporter) {
            console.log(`[SIMULACIÓN DE CORREO]
      Para: ${to}
      Asunto: 📋 Reporte de Tesis: ${draftTitle} (${scoreText})
      Adjunto: ${pdfFilename} (${pdfBuffer.length} bytes)
      Detalle: Configura SMTP_USER y SMTP_PASS en tu archivo .env para enviar correos reales.`);
            return true;
        }
        try {
            await this.transporter.sendMail({
                from: `"Tesis-IA" <${from}>`,
                to,
                subject: `📋 Reporte de Tesis: "${draftTitle}" (${scoreText})`,
                html: htmlContent,
                attachments: [
                    {
                        filename: pdfFilename,
                        content: pdfBuffer,
                        contentType: 'application/pdf',
                    },
                ],
            });
            console.log(`Report successfully emailed to ${to}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to send email to ${to}:`, error.message);
            return false;
        }
    }
    async sendArticle(to, articleTitle, fileBuffer, fileType, authorName) {
        const from = this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@thesis-ia.com';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
          <span style="font-size: 32px;">📄</span>
          <h2 style="color: #10b981; margin: 5px 0 0 0; font-weight: 800;">Tesis-IA</h2>
          <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0; font-weight: 600; uppercase; tracking-wider;">Artículo Académico Generado</p>
        </div>

        <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 12px;">
          Estimado/a <strong>${authorName}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Tu artículo académico titulado <strong style="color: #1e293b;">"${articleTitle}"</strong> ha sido generado exitosamente por nuestro sistema de inteligencia artificial.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 25px 0; text-align: center;">
          <span style="display: block; font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Formato del Archivo</span>
          <span style="font-size: 32px; font-weight: 900; color: #10b981;">${fileType.toUpperCase()}</span>
        </div>

        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
          Adjunto a este correo encontrarás el artículo completo en formato <strong>${fileType.toUpperCase()}</strong> con todas las secciones generadas según los estándares académicos.
        </p>

        <div style="margin: 25px 0; padding: 12px 16px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px;">
          <p style="color: #166534; font-size: 12px; margin: 0; line-height: 1.5; font-weight: 600;">
            💡 Recuerda revisar y editar el contenido antes de someterlo a una revista científica.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin-top: 35px; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center;">
          Este es un correo automático generado por el Sistema de Generación de Artículos IA.<br/>
          Por favor, no respondas a este mensaje.
        </p>
      </div>
    `;
        const cleanTitle = articleTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const filename = `articulo_${cleanTitle}.${fileType}`;
        const contentType = fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (!this.transporter) {
            console.log(`[SIMULACIÓN DE CORREO]
      Para: ${to}
      Asunto: 📄 Artículo Generado: ${articleTitle}
      Adjunto: ${filename} (${fileBuffer.length} bytes)
      Detalle: Configura SMTP_USER y SMTP_PASS en tu archivo .env para enviar correos reales.`);
            return true;
        }
        try {
            await this.transporter.sendMail({
                from: `"Tesis-IA" <${from}>`,
                to,
                subject: `📄 Artículo Generado: "${articleTitle}"`,
                html: htmlContent,
                attachments: [
                    {
                        filename,
                        content: fileBuffer,
                        contentType,
                    },
                ],
            });
            console.log(`Article successfully emailed to ${to}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to send email to ${to}:`, error.message);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map