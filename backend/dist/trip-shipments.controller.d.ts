import { PrismaService } from './prisma/prisma.service';
export declare class TripShipmentsController {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<({
        shipment: {
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
        };
        trip: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        tripId: string;
        shipmentId: string;
        palletsAllocated: number;
        palletsLoaded: number;
        palletsDelivered: number;
        dropStopId: string | null;
    })[]>;
    allocate(body: {
        tripId: string;
        shipmentId: string;
        palletsAllocated: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        tripId: string;
        shipmentId: string;
        palletsAllocated: number;
        palletsLoaded: number;
        palletsDelivered: number;
        dropStopId: string | null;
    }>;
    load(body: {
        tripShipmentId: string;
        palletsLoaded: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        tripId: string;
        shipmentId: string;
        palletsAllocated: number;
        palletsLoaded: number;
        palletsDelivered: number;
        dropStopId: string | null;
    }>;
    deliver(body: {
        tripShipmentId: string;
        palletsDelivered: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string | null;
        tripId: string;
        shipmentId: string;
        palletsAllocated: number;
        palletsLoaded: number;
        palletsDelivered: number;
        dropStopId: string | null;
    }>;
}
