import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTruckDto {
  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityPallet?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityKg?: number;

  @IsOptional()
  @IsString()
  homeWarehouseId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
