import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateDriverDto): import("@prisma/client").Prisma.Prisma__DriverClient<{
        id: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
