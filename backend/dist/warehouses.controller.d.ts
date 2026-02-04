import { PrismaService } from './prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class WarehousesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.WarehouseCode;
        country: string;
        address: string | null;
    }[]>;
    create(body: {
        code: string;
        name: string;
        country: string;
        address?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: import("@prisma/client").$Enums.WarehouseCode;
        country: string;
        address: string | null;
    }>;
}
