import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { TripExpensesModule } from './trip-expenses.module';

import { WarehousesController } from './warehouses.controller';
import { CustomersController } from './customers.controller';
import { ShipmentsController } from './shipments.controller';
import { TripsController } from './trips.controller';
import { TripShipmentsController } from './trip-shipments.controller';
import { TrucksController } from './trucks.controller';
import { DashboardController } from './dashboard.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, DriversModule, AuthModule, TripExpensesModule],
  controllers: [
    WarehousesController,
    CustomersController,
    ShipmentsController,
    TripsController,
    TripShipmentsController,
    TrucksController,
    DashboardController,
    HealthController,
  ],
})
export class AppModule {}
