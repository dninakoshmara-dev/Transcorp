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
exports.TripShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let TripShipmentsController = class TripShipmentsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.tripShipment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                trip: true,
                shipment: true,
            },
        });
    }
    async allocate(body) {
        if (!body.tripId)
            throw new common_1.BadRequestException('tripId required');
        if (!body.shipmentId)
            throw new common_1.BadRequestException('shipmentId required');
        if (!Number.isInteger(body.palletsAllocated) || body.palletsAllocated <= 0) {
            throw new common_1.BadRequestException('palletsAllocated must be positive integer');
        }
        const shipment = await this.prisma.shipment.findUnique({ where: { id: body.shipmentId } });
        if (!shipment)
            throw new common_1.BadRequestException('Shipment not found');
        const agg = await this.prisma.tripShipment.aggregate({
            where: { shipmentId: body.shipmentId },
            _sum: { palletsAllocated: true },
        });
        const currentlyAllocated = agg._sum.palletsAllocated ?? 0;
        const availableNow = shipment.palletsTotal - currentlyAllocated;
        if (body.palletsAllocated > availableNow) {
            throw new common_1.BadRequestException(`Not enough available pallets. Available=${availableNow}`);
        }
        const existing = await this.prisma.tripShipment.findFirst({
            where: { tripId: body.tripId, shipmentId: body.shipmentId },
        });
        if (existing) {
            return this.prisma.tripShipment.update({
                where: { id: existing.id },
                data: { palletsAllocated: existing.palletsAllocated + body.palletsAllocated },
            });
        }
        return this.prisma.tripShipment.create({
            data: {
                tripId: body.tripId,
                shipmentId: body.shipmentId,
                palletsAllocated: body.palletsAllocated,
            },
        });
    }
    async load(body) {
        if (!body.tripShipmentId)
            throw new common_1.BadRequestException('tripShipmentId required');
        if (!Number.isInteger(body.palletsLoaded) || body.palletsLoaded <= 0) {
            throw new common_1.BadRequestException('palletsLoaded must be positive integer');
        }
        const ts = await this.prisma.tripShipment.findUnique({
            where: { id: body.tripShipmentId },
            include: { trip: true },
        });
        if (!ts)
            throw new common_1.BadRequestException('TripShipment not found');
        if (ts.trip?.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Can load only when trip is IN_PROGRESS');
        }
        const newLoaded = ts.palletsLoaded + body.palletsLoaded;
        if (newLoaded > ts.palletsAllocated) {
            throw new common_1.BadRequestException('Cannot load more than allocated pallets');
        }
        return this.prisma.tripShipment.update({
            where: { id: ts.id },
            data: { palletsLoaded: newLoaded },
        });
    }
    async deliver(body) {
        if (!body.tripShipmentId)
            throw new common_1.BadRequestException('tripShipmentId required');
        if (!Number.isInteger(body.palletsDelivered) || body.palletsDelivered <= 0) {
            throw new common_1.BadRequestException('palletsDelivered must be positive integer');
        }
        const ts = await this.prisma.tripShipment.findUnique({
            where: { id: body.tripShipmentId },
            include: { trip: true },
        });
        if (!ts)
            throw new common_1.BadRequestException('TripShipment not found');
        if (ts.trip?.status !== 'IN_PROGRESS') {
            throw new common_1.BadRequestException('Can deliver only when trip is IN_PROGRESS');
        }
        const newDelivered = ts.palletsDelivered + body.palletsDelivered;
        if (newDelivered > ts.palletsLoaded) {
            throw new common_1.BadRequestException('Cannot deliver more than loaded pallets');
        }
        return this.prisma.tripShipment.update({
            where: { id: ts.id },
            data: { palletsDelivered: newDelivered },
        });
    }
};
exports.TripShipmentsController = TripShipmentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TripShipmentsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripShipmentsController.prototype, "allocate", null);
__decorate([
    (0, common_1.Post)('load'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripShipmentsController.prototype, "load", null);
__decorate([
    (0, common_1.Post)('deliver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripShipmentsController.prototype, "deliver", null);
exports.TripShipmentsController = TripShipmentsController = __decorate([
    (0, common_1.Controller)('api/trip-shipments'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripShipmentsController);
//# sourceMappingURL=trip-shipments.controller.js.map