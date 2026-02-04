"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const drivers_module_1 = require("./drivers/drivers.module");
const warehouses_controller_1 = require("./warehouses.controller");
const customers_controller_1 = require("./customers.controller");
const shipments_controller_1 = require("./shipments.controller");
const trips_controller_1 = require("./trips.controller");
const trip_shipments_controller_1 = require("./trip-shipments.controller");
const trucks_controller_1 = require("./trucks.controller");
const dashboard_controller_1 = require("./dashboard.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, drivers_module_1.DriversModule],
        controllers: [
            warehouses_controller_1.WarehousesController,
            customers_controller_1.CustomersController,
            shipments_controller_1.ShipmentsController,
            trips_controller_1.TripsController,
            trip_shipments_controller_1.TripShipmentsController,
            trucks_controller_1.TrucksController,
            dashboard_controller_1.DashboardController,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map