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
        title: string;
        score: number | null;
        version: number;
        id: string;
        studentId: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        status: string;
        recipientEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAdvisorPendingDrafts(req: any): Promise<({
        student: {
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            advisorId: string | null;
        };
        aiReviews: {
            summary: string;
            score: number;
            id: string;
            createdAt: Date;
            draftId: string;
            findings: import("@prisma/client/runtime/library").JsonValue;
            embedding: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        title: string;
        score: number | null;
        version: number;
        id: string;
        studentId: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        status: string;
        recipientEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findAll(req: any): Promise<{
        title: string;
        score: number | null;
        version: number;
        id: string;
        studentId: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        status: string;
        recipientEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getOrcidMatch(id: string): Promise<any>;
    submitReview(id: string, comments: any, status: string, req: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        advisorId: string;
        draftId: string;
        comments: import("@prisma/client/runtime/library").JsonValue;
    }>;
    uploadBatch(files: any[], titles: any, emails: any, req: any): Promise<any[]>;
    downloadReportsZip(ids: string[], res: Response): Promise<void>;
    findOne(id: string): Promise<{
        aiReviews: {
            summary: string;
            score: number;
            id: string;
            createdAt: Date;
            draftId: string;
            findings: import("@prisma/client/runtime/library").JsonValue;
            embedding: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        humanReviews: {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            advisorId: string;
            draftId: string;
            comments: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        title: string;
        score: number | null;
        version: number;
        id: string;
        studentId: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        status: string;
        recipientEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        title: string;
        score: number | null;
        version: number;
        id: string;
        studentId: string;
        fileUrl: string;
        fileName: string;
        fileType: string;
        status: string;
        recipientEmail: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
