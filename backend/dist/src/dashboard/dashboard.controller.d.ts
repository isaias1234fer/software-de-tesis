import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getKpis(req: any): Promise<{
        totalDrafts: number;
        reviewedDrafts: number;
        pendingDrafts: number;
        avgScore: number;
        iaHumanAgreement: number;
    }>;
    getTimeline(req: any): Promise<({
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
