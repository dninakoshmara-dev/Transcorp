import { PrismaService } from './prisma/prisma.service';
export declare class TripsController {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        status: import("@prisma/client").$Enums.TripStatus;
        plannedStartAt: Date | null;
        plannedEndAt: Date | null;
        revenueAmount: number | null;
        revenueCurrency: string | null;
        truckId: string;
        driverId: string | null;
        startWarehouseId: string;
        startedAt: Date | null;
        completedAt: Date | null;
    }[]>;
    create(body: {
        truckId: string;
        startWarehouseId: string;
        driverId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        status: import("@prisma/client").$Enums.TripStatus;
        plannedStartAt: Date | null;
        plannedEndAt: Date | null;
        revenueAmount: number | null;
        revenueCurrency: string | null;
        truckId: string;
        driverId: string | null;
        startWarehouseId: string;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    setStatus(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        status: import("@prisma/client").$Enums.TripStatus;
        plannedStartAt: Date | null;
        plannedEndAt: Date | null;
        revenueAmount: number | null;
        revenueCurrency: string | null;
        truckId: string;
        driverId: string | null;
        startWarehouseId: string;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
}
