import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTripShipmentDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  palletsAllocated?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  palletsLoaded?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  palletsDelivered?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dropStopId?: string | null;
}
