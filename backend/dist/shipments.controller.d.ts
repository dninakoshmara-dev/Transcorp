import { PrismaService } from './prisma/prisma.service';
export declare class ShipmentsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        refNo: string;
        description: string | null;
        palletsTotal: number;
        weightKg: number | null;
        notes: string | null;
        statusCalc: string | null;
        customerId: string;
        warehouseId: string;
    }[]>;
    create(body: {
        refNo: string;
        description?: string;
        palletsTotal: number;
        weightKg?: number;
        notes?: string;
        customerId: string;
        warehouseId: string;
    }): import("@prisma/client").Prisma.Prisma__ShipmentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        refNo: string;
        description: string | null;
        palletsTotal: number;
        weightKg: number | null;
        notes: string | null;
        statusCalc: string | null;
        customerId: string;
        warehouseId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
