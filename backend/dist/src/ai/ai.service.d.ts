import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    analyzeDraft(text: string, templateStructure: any): Promise<any>;
    compareWithOrcid(thesisTitle: string, publications: any[]): Promise<any>;
    generateThesisContent(thesisData: any): Promise<any>;
    generateThesisPdf(thesisData: any, userEmail?: string): Promise<Buffer>;
    generateThesisWord(thesisData: any, userEmail?: string): Promise<Buffer>;
    private sendThesisEmail;
    chatWithThesisAgent(message: string, sessionId: string): Promise<string>;
}
