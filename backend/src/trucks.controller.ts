import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

function mustNumber(name: string, v: unknown): number {
  if (v === null || v === undefined || v === '') {
    throw new BadRequestException(`${name} is required`);
  }
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) throw new BadRequestException(`${name} must be a number`);
  return n;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TrucksController {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTruckExists(id: string) {
    const truck = await this.prisma.truck.findUnique({ where: { id } });
    if (!truck) throw new NotFoundException(`Truck not found: ${id}`);
    return truck;
  }

  // GET ALL -> /api/trucks
  @Get('trucks')
  findAll() {
    return this.prisma.truck.findMany();
  }

  // GET BY ID -> /api/trucks/:id
  @Get('trucks/:id')
  async findOne(@Param('id') id: string) {
    return this.ensureTruckExists(id);
  }

  // POST CREATE -> /api/trucks (ADMIN)
  @Roles('ADMIN')
  @Post('trucks')
  create(@Body() dto: CreateTruckDto) {
    const capacityKg = mustNumber('capacityKg', (dto as any).capacityKg);

    return this.prisma.truck.create({
      data: {
        plate: dto.plate,
        capacityPallet: dto.capacityPallet,
        capacityKg,
        homeWarehouse: { connect: { id: dto.homeWarehouseId } },
        isActive: true,
      },
    });
  }

  // PATCH UPDATE -> /api/trucks/:id (ADMIN)
  @Roles('ADMIN')
  @Patch('trucks/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTruckDto) {
    await this.ensureTruckExists(id);

    return this.prisma.truck.update({
      where: { id },
      data: {
        ...(dto.plate !== undefined ? { plate: dto.plate } : {}),
        ...(dto.capacityPallet !== undefined ? { capacityPallet: dto.capacityPallet } : {}),
        ...(dto.capacityKg !== undefined ? { capacityKg: dto.capacityKg } : {}),
        ...(dto.homeWarehouseId !== undefined
          ? { homeWarehouse: { connect: { id: dto.homeWarehouseId } } }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  // DELETE -> /api/trucks/:id (ADMIN)
  @Roles('ADMIN')
  @Delete('trucks/:id')
  async remove(@Param('id') id: string) {
    await this.ensureTruckExists(id);
    await this.prisma.truck.delete({ where: { id } });
    return { ok: true };
  }
}
