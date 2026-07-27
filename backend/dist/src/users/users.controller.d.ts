import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private usersService;
    private prisma;
    constructor(usersService: UsersService, prisma: PrismaService);
    getAdvisors(): Promise<{
        name: string;
        id: string;
        email: string;
        advisorProfile: {
            id: string;
            orcidId: string;
        };
    }[]>;
    getMyStudentProfile(req: any): Promise<{
        advisor: {
            user: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            userId: string;
            orcidId: string | null;
            orcidAccessToken: string | null;
            orcidRefreshToken: string | null;
        };
    } & {
        id: string;
        userId: string;
        advisorId: string | null;
    }>;
    assignAdvisor(req: any, advisorId: string): Promise<{
        id: string;
        userId: string;
        advisorId: string | null;
    }>;
}
