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
import { UpdateTripShipmentDto } from './dto/update-trip-shipment.dto';

@Controller()
export class TripShipmentsController {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureExists(id: string) {
    const item = await this.prisma.tripShipment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`TripShipment not found: ${id}`);
    return item;
  }

  // ✅ GET ALL
  @Get('api/trip-shipments')
  findAll() {
    return this.prisma.tripShipment.findMany({
      include: {
        trip: { include: { truck: true } },
        shipment: true,
      },
    });
  }

  // ✅ POST CREATE
  // Body expected:
  // { tripId, shipmentId, palletsAllocated, palletsLoaded?, palletsDelivered?, dropStopId?, status? }
  @Post('api/trip-shipments')
  create(@Body() dto: any) {
    return this.prisma.tripShipment.create({
      data: {
        trip: { connect: { id: dto.tripId } },
        shipment: { connect: { id: dto.shipmentId } },

        palletsAllocated: Number(dto.palletsAllocated),
        palletsLoaded:
          dto.palletsLoaded !== undefined ? Number(dto.palletsLoaded) : 0,
        palletsDelivered:
          dto.palletsDelivered !== undefined ? Number(dto.palletsDelivered) : 0,

        dropStopId: dto.dropStopId ?? null,
        status: dto.status ?? null,
      },
      include: {
        trip: { include: { truck: true } },
        shipment: true,
      },
    });
  }

  // ✅ PATCH UPDATE
  @Patch('api/trip-shipments/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTripShipmentDto) {
    await this.ensureExists(id);

    return this.prisma.tripShipment.update({
      where: { id },
      data: {
        ...(dto.palletsAllocated !== undefined
          ? { palletsAllocated: dto.palletsAllocated }
          : {}),
        ...(dto.palletsLoaded !== undefined
          ? { palletsLoaded: dto.palletsLoaded }
          : {}),
        ...(dto.palletsDelivered !== undefined
          ? { palletsDelivered: dto.palletsDelivered }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.dropStopId !== undefined ? { dropStopId: dto.dropStopId } : {}),
      },
      include: {
        trip: { include: { truck: true } },
        shipment: true,
      },
    });
  }

  // ✅ DELETE
  @Delete('api/trip-shipments/:id')
  async remove(@Param('id') id: string) {
    await this.ensureExists(id);
    await this.prisma.tripShipment.delete({ where: { id } });
    return { ok: true };
  }
}
