import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getKpis(role?: string, userId?: string): Promise<{
        totalDrafts: number;
        reviewedDrafts: number;
        pendingDrafts: number;
        avgScore: number;
        iaHumanAgreement: number;
    }>;
    getActivityTimeline(role?: string, userId?: string): Promise<({
        student: {
            user: {
                name: string;
            };
        } & {
            id: string;
            userId: string;
            advisorId: string | null;
        };
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
}
