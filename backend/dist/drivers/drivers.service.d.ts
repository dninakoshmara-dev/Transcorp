import { PrismaService } from '../prisma/prisma.service';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(data: {
        name: string;
        phone?: string;
        isActive?: boolean;
    }): import("@prisma/client").Prisma.Prisma__DriverClient<{
        id: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
