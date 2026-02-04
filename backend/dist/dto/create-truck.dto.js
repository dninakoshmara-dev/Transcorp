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
exports.CreateTruckDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTruckDto {
    plate;
    capacityPallet;
    homeWarehouseId;
}
exports.CreateTruckDto = CreateTruckDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(5, 20),
    (0, class_validator_1.Matches)(/^[A-Z0-9-]+$/i, {
        message: 'plate must contain only letters, numbers or hyphen',
    }),
    __metadata("design:type", String)
], CreateTruckDto.prototype, "plate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateTruckDto.prototype, "capacityPallet", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTruckDto.prototype, "homeWarehouseId", void 0);
//# sourceMappingURL=create-truck.dto.js.map