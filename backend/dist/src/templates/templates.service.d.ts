import { PrismaService } from '../prisma/prisma.service';
export declare class TemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        description: string | null;
        name: string;
        id: string;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        structure: import("@prisma/client/runtime/library").JsonValue;
        rubric: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }>;
    private extractStructure;
    findAll(): Promise<{
        description: string | null;
        name: string;
        id: string;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        structure: import("@prisma/client/runtime/library").JsonValue;
        rubric: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        structure: import("@prisma/client/runtime/library").JsonValue;
        rubric: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }>;
}
