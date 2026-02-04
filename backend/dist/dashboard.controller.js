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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
let DashboardController = class DashboardController {
    getDashboard() {
        return {
            ok: true,
            message: 'Dashboard root endpoint is working',
            endpoints: ['/api/dashboard/progress', '/api/dashboard/progress/trips'],
        };
    }
    getProgress() {
        return {
            status: 'ok',
            progress: {
                shipmentsTotal: 0,
                shipmentsDone: 0,
                tripsTotal: 0,
                tripsInProgress: 0,
            },
        };
    }
    getProgressTrips() {
        return {
            status: 'ok',
            trips: [],
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Get)('progress/trips'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProgressTrips", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('api/dashboard')
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map