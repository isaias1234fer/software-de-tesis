import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
export declare class DraftsService {
    private prisma;
    private storageService;
    private draftQueue;
    constructor(prisma: PrismaService, storageService: StorageService, draftQueue: Queue);
    create(studentId: string, title: string, file: any, recipientEmail?: string): Promise<{
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
    findByStudent(studentId: string): Promise<{
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
