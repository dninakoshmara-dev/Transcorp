"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const ALLOWED = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
let TripsController = class TripsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.trip.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(body) {
        if (!body?.truckId)
            throw new common_1.BadRequestException('truckId is required');
        if (!body?.startWarehouseId)
            throw new common_1.BadRequestException('startWarehouseId is required');
        const truck = await this.prisma.truck.findUnique({
            where: { id: body.truckId },
        });
        if (!truck)
            throw new common_1.BadRequestException('Truck not found');
        if (body.driverId) {
            const driver = await this.prisma.driver.findUnique({
                where: { id: body.driverId },
            });
            if (!driver)
                throw new common_1.BadRequestException('Driver not found');
        }
        return this.prisma.trip.create({
            data: {
                truckId: body.truckId,
                startWarehouseId: body.startWarehouseId,
                status: 'PLANNED',
                ...(body.driverId ? { driverId: body.driverId } : {}),
            },
        });
    }
    async setStatus(body) {
        if (!body || typeof body !== 'object') {
            throw new common_1.BadRequestException('Body is required');
        }
        const tripId = body.tripId;
        const status = body.status;
        const driverId = body.driverId;
        if (!tripId)
            throw new common_1.BadRequestException('tripId is required');
        if (!status)
            throw new common_1.BadRequestException('status is required');
        if (!ALLOWED.includes(status)) {
            throw new common_1.BadRequestException(`Invalid status. Allowed: ${ALLOWED.join(', ')}`);
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
        });
        if (!trip)
            throw new common_1.BadRequestException('Trip not found');
        if (trip.status === 'COMPLETED' && status !== 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot change status of a COMPLETED trip');
        }
        if (trip.status === 'CANCELLED' && status !== 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot change status of a CANCELLED trip');
        }
        if (status === 'COMPLETED') {
            const tripWithShipments = await this.prisma.trip.findUnique({
                where: { id: tripId },
                include: {
                    shipments: {
                        select: {
                            shipmentId: true,
                            palletsAllocated: true,
                            palletsDelivered: true,
                        },
                    },
                },
            });
            if (!tripWithShipments) {
                throw new common_1.BadRequestException('Trip not found');
            }
            const notDelivered = tripWithShipments.shipments.filter((ts) => (ts.palletsDelivered ?? 0) < (ts.palletsAllocated ?? 0));
            if (notDelivered.length > 0) {
                const details = notDelivered
                    .slice(0, 5)
                    .map((x) => `${x.shipmentId}:${x.palletsDelivered}/${x.palletsAllocated}`)
                    .join(', ');
                throw new common_1.BadRequestException(`Cannot complete trip: undelivered pallets exist (${details})`);
            }
        }
        const data = { status };
        if (driverId) {
            const driver = await this.prisma.driver.findUnique({
                where: { id: driverId },
            });
            if (!driver)
                throw new common_1.BadRequestException('Driver not found');
            data.driverId = driverId;
        }
        if (status === 'IN_PROGRESS' && !trip.startedAt) {
            data.startedAt = new Date();
        }
        if (status === 'COMPLETED' && !trip.completedAt) {
            data.completedAt = new Date();
        }
        return this.prisma.trip.update({
            where: { id: tripId },
            data,
        });
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "setStatus", null);
exports.TripsController = TripsController = __decorate([
    (0, common_1.Controller)('api/trips'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsController);
//# sourceMappingURL=trips.controller.js.map