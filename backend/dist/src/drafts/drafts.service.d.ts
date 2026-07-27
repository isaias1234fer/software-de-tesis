import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { Queue } from 'bullmq';
export declare class DraftsService {
    private prisma;
    private storageService;
    private draftQueue;
    constructor(prisma: PrismaService, storageService: StorageService, draftQueue: Queue);
    create(studentId: string, title: string, file: any, recipientEmail?: string): Promise<{
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
    findByStudent(studentId: string): Promise<{
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
