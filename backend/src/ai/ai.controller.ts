import { Controller, Post, Body, Get, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-thesis')
  async generateThesis(@Body() thesisData: any) {
    return this.aiService.generateThesisContent(thesisData);
  }

  @Post('generate-thesis-pdf')
  @UseGuards(JwtAuthGuard)
  async generateThesisPdf(@Body() thesisData: any, @Res() res: Response, @Req() req: any) {
    try {
      console.log('-> Recibida solicitud PDF en controlador');
      console.log('-> Datos de tesis:', thesisData);
      const user = req.user;
      const userEmail = user?.email;
      console.log('-> Usuario autenticado:', user);
      console.log('-> Email del usuario:', userEmail);
      
      const pdfBuffer = await this.aiService.generateThesisPdf(thesisData, userEmail);
      
      res.setHeader('Content-Type', 'application/pdf');
      const safeTitle = thesisData.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      res.setHeader('Content-Disposition', `attachment; filename="tesis-${safeTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('-> ERROR CRÍTICO EN CONTROLADOR PDF:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating PDF',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  @Post('generate-thesis-word')
  @UseGuards(JwtAuthGuard)
  async generateThesisWord(@Body() thesisData: any, @Res() res: Response, @Req() req: any) {
    try {
      const user = req.user;
      const userEmail = user?.email;
      
      const docBuffer = await this.aiService.generateThesisWord(thesisData, userEmail);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const safeTitle = thesisData.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      res.setHeader('Content-Disposition', `attachment; filename="tesis-${safeTitle}.docx"`);
      res.setHeader('Content-Length', docBuffer.length);
      
      res.send(docBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating Word document',
        error: error.message,
      });
    }
  }

  @Post('chat-thesis')
  @UseGuards(JwtAuthGuard)
  async chatThesis(@Body() body: any, @Req() req: any) {
    const { message, sessionId } = body;
    const session = sessionId || req.user?.email || 'default-session';
    const response = await this.aiService.chatWithThesisAgent(message, session);
    return { sessionId: session, response, timestamp: new Date().toISOString() };
  }
}
