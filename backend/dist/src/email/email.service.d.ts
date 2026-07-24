import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendReport(to: string, draftTitle: string, score: number | null, pdfBuffer: Buffer, studentName: string): Promise<boolean>;
    sendArticle(to: string, articleTitle: string, fileBuffer: Buffer, fileType: 'pdf' | 'docx', authorName: string): Promise<boolean>;
}
