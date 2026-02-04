import { IsString, Length, Matches, IsInt, Min } from 'class-validator';

export class CreateTruckDto {
  @IsString()
  @Length(5, 20)
  @Matches(/^[A-Z0-9-]+$/i, {
    message: 'plate must contain only letters, numbers or hyphen',
  })
  plate!: string;

  @IsInt()
  @Min(1)
  capacityPallet!: number;

  @IsString()
  homeWarehouseId!: string;
}
