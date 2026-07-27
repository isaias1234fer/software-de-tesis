import { Controller, Post, Body, Res, HttpStatus, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('generate-article')
  @ApiOperation({ summary: 'Generate article content in JSON format' })
  async generateArticle(@Body() articleData: any) {
    return this.articlesService.generateArticleContent(articleData);
  }

  @Post('generate-article-pdf')
  // @UseGuards(JwtAuthGuard) // Temporalmente deshabilitado para pruebas
  // @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Generate article in PDF format' })
  async generateArticlePdf(
    @UploadedFile() file: any,
    @Body('data') data: string,
    @Body('sendEmail') sendEmail: string,
    @Res() res: Response,
    @Req() req: any,
    @Body() body: any
  ) {
    try {
      console.log('-> Recibida solicitud PDF de artículo en controlador');
      console.log('-> Body completo:', JSON.stringify(body, null, 2));

      // Manejar ambos casos: con archivo (FormData) y sin archivo (JSON directo)
      let articleData;
      if (file) {
        // Caso con archivo: datos vienen en el campo 'data' como string
        articleData = data ? JSON.parse(data) : {};
      } else {
        // Caso sin archivo: datos vienen directamente en el body
        articleData = body;
        sendEmail = body.sendEmail;
      }

      console.log('-> Datos del artículo:', articleData);
      console.log('-> Archivo de plantilla:', file ? file.originalname : 'No proporcionado');
      console.log('-> Enviar por correo:', sendEmail === 'true');

      const user = req.user;
      const userEmail = user?.email;
      const userName = user?.name || articleData.authorFirstName + ' ' + articleData.authorLastName;
      console.log('-> Usuario autenticado:', user);
      console.log('-> Email del usuario:', userEmail);

      const pdfBuffer = await this.articlesService.generateArticlePdf(articleData, userEmail, file);

      // Enviar por correo si se solicita
      if (sendEmail === 'true' && userEmail) {
        await this.articlesService.sendArticleByEmail(
          userEmail,
          articleData.title,
          pdfBuffer,
          'pdf',
          userName,
        );
      }

      res.setHeader('Content-Type', 'application/pdf');
      const safeTitle = (articleData.title || 'articulo').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      res.setHeader('Content-Disposition', `attachment; filename="articulo-${safeTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('-> ERROR CRÍTICO EN CONTROLADOR PDF ARTÍCULO:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating article PDF',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  @Post('generate-article-word')
  // @UseGuards(JwtAuthGuard) // Temporalmente deshabilitado para pruebas
  // @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Generate article in Word format' })
  async generateArticleWord(
    @UploadedFile() file: any,
    @Body('data') data: string,
    @Body('sendEmail') sendEmail: string,
    @Res() res: Response,
    @Req() req: any,
    @Body() body: any
  ) {
    try {
      console.log('-> Recibida solicitud Word de artículo en controlador');
      console.log('-> Body completo:', JSON.stringify(body, null, 2));

      // Manejar ambos casos: con archivo (FormData) y sin archivo (JSON directo)
      let articleData;
      if (file) {
        // Caso con archivo: datos vienen en el campo 'data' como string
        articleData = data ? JSON.parse(data) : {};
      } else {
        // Caso sin archivo: datos vienen directamente en el body
        articleData = body;
        sendEmail = body.sendEmail;
      }

      console.log('-> Datos del artículo:', articleData);
      console.log('-> Archivo de plantilla:', file ? file.originalname : 'No proporcionado');
      console.log('-> Enviar por correo:', sendEmail === 'true');

      const user = req.user;
      const userEmail = user?.email;
      const userName = user?.name || articleData.authorFirstName + ' ' + articleData.authorLastName;

      const docBuffer = await this.articlesService.generateArticleWord(articleData, userEmail, file);

      // Enviar por correo si se solicita
      if (sendEmail === 'true' && userEmail) {
        await this.articlesService.sendArticleByEmail(
          userEmail,
          articleData.title,
          docBuffer,
          'docx',
          userName,
        );
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const safeTitle = (articleData.title || 'articulo').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
      res.setHeader('Content-Disposition', `attachment; filename="articulo-${safeTitle}.docx"`);
      res.setHeader('Content-Length', docBuffer.length);

      res.send(docBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating article Word document',
        error: error.message,
      });
    }
  }
}