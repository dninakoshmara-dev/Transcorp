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
exports.TrucksController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const create_truck_dto_1 = require("./dto/create-truck.dto");
const update_truck_dto_1 = require("./dto/update-truck.dto");
let TrucksController = class TrucksController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureTruckExists(id) {
        const truck = await this.prisma.truck.findUnique({ where: { id } });
        if (!truck)
            throw new common_1.NotFoundException(`Truck not found: ${id}`);
        return truck;
    }
    findAllLegacy() {
        return this.prisma.truck.findMany();
    }
    findAllApi() {
        return this.prisma.truck.findMany();
    }
    async findOneLegacy(id) {
        return this.ensureTruckExists(id);
    }
    async findOneApi(id) {
        return this.ensureTruckExists(id);
    }
    create(dto) {
        return this.prisma.truck.create({
            data: {
                plate: dto.plate,
                capacityPallet: dto.capacityPallet,
                homeWarehouse: {
                    connect: { id: dto.homeWarehouseId },
                },
            },
        });
    }
    async update(id, dto) {
        await this.ensureTruckExists(id);
        return this.prisma.truck.update({
            where: { id },
            data: {
                ...(dto.plate ? { plate: dto.plate } : {}),
            },
        });
    }
    async remove(id) {
        await this.ensureTruckExists(id);
        await this.prisma.truck.delete({ where: { id } });
        return { ok: true };
    }
};
exports.TrucksController = TrucksController;
__decorate([
    (0, common_1.Get)('trucks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "findAllLegacy", null);
__decorate([
    (0, common_1.Get)('api/trucks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "findAllApi", null);
__decorate([
    (0, common_1.Get)('trucks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrucksController.prototype, "findOneLegacy", null);
__decorate([
    (0, common_1.Get)('api/trucks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrucksController.prototype, "findOneApi", null);
__decorate([
    (0, common_1.Post)('api/trucks'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_truck_dto_1.CreateTruckDto]),
    __metadata("design:returntype", void 0)
], TrucksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('api/trucks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_truck_dto_1.UpdateTruckDto]),
    __metadata("design:returntype", Promise)
], TrucksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('api/trucks/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrucksController.prototype, "remove", null);
exports.TrucksController = TrucksController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrucksController);
//# sourceMappingURL=trucks.controller.js.map