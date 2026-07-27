import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private templatesService;
    constructor(templatesService: TemplatesService);
    create(body: any): Promise<{
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
