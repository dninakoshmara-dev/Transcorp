import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  plate: string;

  @IsInt()
  @Min(1)
  capacityPallet: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityKg?: number;

  @IsString()
  homeWarehouseId: string;
}
