import { DraftsService } from './drafts.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from '../reports/reports.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { Response } from 'express';
export declare class DraftsController {
    private draftsService;
    private prisma;
    private reportsService;
    private aiService;
    private emailService;
    constructor(draftsService: DraftsService, prisma: PrismaService, reportsService: ReportsService, aiService: AiService, emailService: EmailService);
    downloadReport(id: string, res: Response, req: any): Promise<void>;
    upload(file: any, title: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string;
        fileName: string;
        version: number;
        fileType: string;
        status: string;
        score: number | null;
        recipientEmail: string | null;
        studentId: string;
    }>;
    getAdvisorPendingDrafts(req: any): Promise<({
        student: {
            user: {
                email: string;
                name: string;
            };
        } & {
            id: string;
            userId: string;
            advisorId: string | null;
        };
        aiReviews: {
            id: string;
            createdAt: Date;
            summary: string;
            embedding: import("@prisma/client/runtime/library").JsonValue | null;
            score: number;
            findings: import("@prisma/client/runtime/library").JsonValue;
            draftId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string;
        fileName: string;
        version: number;
        fileType: string;
        status: string;
        score: number | null;
        recipientEmail: string | null;
        studentId: string;
    })[]>;
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string;
        fileName: string;
        version: number;
        fileType: string;
        status: string;
        score: number | null;
        recipientEmail: string | null;
        studentId: string;
    }[]>;
    getOrcidMatch(id: string): Promise<any>;
    submitReview(id: string, comments: any, status: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        advisorId: string;
        status: string;
        draftId: string;
        comments: import("@prisma/client/runtime/library").JsonValue;
    }>;
    uploadBatch(files: any[], titles: any, emails: any, req: any): Promise<any[]>;
    downloadReportsZip(ids: string[], res: Response): Promise<void>;
    findOne(id: string): Promise<{
        aiReviews: {
            id: string;
            createdAt: Date;
            summary: string;
            embedding: import("@prisma/client/runtime/library").JsonValue | null;
            score: number;
            findings: import("@prisma/client/runtime/library").JsonValue;
            draftId: string;
        }[];
        humanReviews: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            advisorId: string;
            status: string;
            draftId: string;
            comments: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string;
        fileName: string;
        version: number;
        fileType: string;
        status: string;
        score: number | null;
        recipientEmail: string | null;
        studentId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        fileUrl: string;
        fileName: string;
        version: number;
        fileType: string;
        status: string;
        score: number | null;
        recipientEmail: string | null;
        studentId: string;
    }>;
}
