import { PrismaService } from './prisma/prisma.service';
export declare class CustomersController {
    private prisma;
    constructor(prisma: PrismaService);
    list(q?: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        vat: string | null;
        email: string | null;
    }[]>;
    create(body: {
        name: string;
        vat?: string;
        address?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        id: string;
        name: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        vat: string | null;
        email: string | null;
    }>;
}
