import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DriversModule } from './drivers/drivers.module';

import { WarehousesController } from './warehouses.controller';
import { CustomersController } from './customers.controller';
import { ShipmentsController } from './shipments.controller';
import { TripsController } from './trips.controller';
import { TripShipmentsController } from './trip-shipments.controller';
import { TrucksController } from './trucks.controller';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [PrismaModule, DriversModule],
  controllers: [
    WarehousesController,
    CustomersController,
    ShipmentsController,
    TripsController,
    TripShipmentsController,
    TrucksController,
    DashboardController,
  ],
})
export class AppModule {}
