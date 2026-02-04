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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
let CustomersController = class CustomersController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(q) {
        const where = q
            ? { name: { contains: q, mode: 'insensitive' } }
            : undefined;
        return this.prisma.customer.findMany({
            where,
            orderBy: { name: 'asc' },
            take: 50,
        });
    }
    async create(body) {
        if (!body?.name?.trim()) {
            throw new Error('name is required');
        }
        return this.prisma.customer.create({
            data: {
                name: body.name.trim(),
                vat: body.vat,
                address: body.address,
                email: body.email,
                phone: body.phone,
            },
        });
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('api/customers'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map