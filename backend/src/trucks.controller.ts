import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';

@Controller()
export class TrucksController {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTruckExists(id: string) {
    const truck = await this.prisma.truck.findUnique({ where: { id } });
    if (!truck) throw new NotFoundException(`Truck not found: ${id}`);
    return truck;
  }

  // ✅ GET ALL (legacy)
  @Get('trucks')
  findAllLegacy() {
    return this.prisma.truck.findMany();
  }

  // ✅ GET ALL (api)
  @Get('api/trucks')
  findAllApi() {
    return this.prisma.truck.findMany();
  }

  // ✅ GET BY ID (legacy)
  @Get('trucks/:id')
  async findOneLegacy(@Param('id') id: string) {
    return this.ensureTruckExists(id);
  }

  // ✅ GET BY ID (api)
  @Get('api/trucks/:id')
  async findOneApi(@Param('id') id: string) {
    return this.ensureTruckExists(id);
  }

  // ✅ POST CREATE
    @Post('api/trucks')
  create(@Body() dto: CreateTruckDto) {
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

  // ✅ PATCH UPDATE
  @Patch('api/trucks/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTruckDto) {
    await this.ensureTruckExists(id);

    return this.prisma.truck.update({
      where: { id },
      data: {
        ...(dto.plate ? { plate: dto.plate } : {}),
      },
    });
  }

  // ✅ DELETE
  @Delete('api/trucks/:id')
  async remove(@Param('id') id: string) {
    await this.ensureTruckExists(id);

    await this.prisma.truck.delete({ where: { id } });

    return { ok: true };
  }
}
