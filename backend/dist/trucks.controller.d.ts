import { PrismaService } from './prisma/prisma.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
export declare class TrucksController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureTruckExists;
    findAllLegacy(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }[]>;
    findAllApi(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }[]>;
    findOneLegacy(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }>;
    findOneApi(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }>;
    create(dto: CreateTruckDto): import("@prisma/client").Prisma.Prisma__TruckClient<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateTruckDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        capacityPallet: number;
        capacityKg: number | null;
        homeWarehouseId: string;
    }>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
