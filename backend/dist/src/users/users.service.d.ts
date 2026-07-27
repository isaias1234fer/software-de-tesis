import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
    findByEmail(email: string): Promise<{
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
    findOne(id: string): Promise<{
        studentProfile: {
            id: string;
            userId: string;
            advisorId: string | null;
        };
        advisorProfile: {
            id: string;
            userId: string;
            orcidId: string | null;
            orcidAccessToken: string | null;
            orcidRefreshToken: string | null;
        };
        coordinatorProfile: {
            id: string;
            userId: string;
        };
        adminProfile: {
            id: string;
            userId: string;
        };
    } & {
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
    }>;
}
