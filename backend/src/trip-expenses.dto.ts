import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateTripExpenseDto {
  @ApiProperty({ example: 'cmlbey3ui0008lmvm4scxha8o', description: 'Trip ID (cuid string)' })
  @IsString()
  tripId!: string;

  @ApiProperty({ enum: ExpenseType, example: 'FUEL' })
  @IsEnum(ExpenseType)
  type!: ExpenseType;

  @ApiProperty({ example: 123.45, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'EUR', description: '3-letter ISO currency code' })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code (e.g. EUR, BGN)' })
  currency!: string;

  @ApiPropertyOptional({ example: 'Diesel' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'https://example.com/receipt.jpg' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class UpdateTripExpenseDto {
  @ApiPropertyOptional({ enum: ExpenseType, example: 'TOLL' })
  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;

  @ApiPropertyOptional({ example: 10.5, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ example: 'BGN' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter ISO code (e.g. EUR, BGN)' })
  currency?: string;

  @ApiPropertyOptional({ example: 'Updated note', nullable: true })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  receiptUrl?: string | null;
}
