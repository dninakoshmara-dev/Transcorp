import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Prisma, TripShipmentStatus } from '@prisma/client';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

type CreateTripShipmentBody = {
  tripId?: string;
  shipmentId?: string;

  palletsAllocated?: number | string;
  palletsLoaded?: number | string;
  palletsDelivered?: number | string;

  dropStopId?: string | null;

  status?: string | null;
};

type UpdateTripShipmentBody = Partial<CreateTripShipmentBody>;

function mustString(name: string, v: unknown): string {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new BadRequestException(`${name} is required and must be a non-empty string`);
  }
  return v.trim();
}

function mustInt(name: string, v: unknown): number {
  if (v === null || v === undefined || v === '') {
    throw new BadRequestException(`${name} is required`);
  }
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new BadRequestException(`${name} must be an integer`);
  }
  return n;
}

function optInt(name: string, v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new BadRequestException(`${name} must be an integer`);
  }
  return n;
}

function parseTripShipmentStatus(v: unknown): TripShipmentStatus | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;

  const s = String(v).trim().toUpperCase();
  if (s.length === 0) return undefined;

  const allowed = Object.values(TripShipmentStatus) as string[];
  if (!allowed.includes(s)) {
    throw new BadRequestException(`Invalid status. Allowed: ${allowed.join(', ')}`);
  }
  return s as TripShipmentStatus;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trip-shipments')
export class TripShipmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.tripShipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { trip: true, shipment: true, dropStop: true },
    });
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: CreateTripShipmentBody) {
    const tripId = mustString('tripId', body.tripId);
    const shipmentId = mustString('shipmentId', body.shipmentId);

    const palletsAllocated = mustInt('palletsAllocated', body.palletsAllocated);
    if (palletsAllocated < 0) throw new BadRequestException('palletsAllocated must be >= 0');

    const palletsLoaded = optInt('palletsLoaded', body.palletsLoaded);
    if (palletsLoaded !== undefined && palletsLoaded < 0) {
      throw new BadRequestException('palletsLoaded must be >= 0');
    }

    const palletsDelivered = optInt('palletsDelivered', body.palletsDelivered);
    if (palletsDelivered !== undefined && palletsDelivered < 0) {
      throw new BadRequestException('palletsDelivered must be >= 0');
    }

    const status = parseTripShipmentStatus(body.status);

    const data: Prisma.TripShipmentCreateInput = {
      trip: { connect: { id: tripId } },
      shipment: { connect: { id: shipmentId } },
      palletsAllocated,
      ...(palletsLoaded !== undefined ? { palletsLoaded } : {}),
      ...(palletsDelivered !== undefined ? { palletsDelivered } : {}),
      ...(status !== undefined ? { status } : {}),
    };

    if (typeof body.dropStopId === 'string' && body.dropStopId.trim().length > 0) {
      data.dropStop = { connect: { id: body.dropStopId.trim() } };
    }

    return this.prisma.tripShipment.create({
      data,
      include: { trip: true, shipment: true, dropStop: true },
    });
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateTripShipmentBody) {
    const safeId = mustString('id', id);

    const data: Prisma.TripShipmentUpdateInput = {};

    if (body.tripId !== undefined) {
      data.trip = { connect: { id: mustString('tripId', body.tripId) } };
    }

    if (body.shipmentId !== undefined) {
      data.shipment = { connect: { id: mustString('shipmentId', body.shipmentId) } };
    }

    if (body.palletsAllocated !== undefined) {
      const n = mustInt('palletsAllocated', body.palletsAllocated);
      if (n < 0) throw new BadRequestException('palletsAllocated must be >= 0');
      data.palletsAllocated = n;
    }

    if (body.palletsLoaded !== undefined) {
      const n = mustInt('palletsLoaded', body.palletsLoaded);
      if (n < 0) throw new BadRequestException('palletsLoaded must be >= 0');
      data.palletsLoaded = n;
    }

    if (body.palletsDelivered !== undefined) {
      const n = mustInt('palletsDelivered', body.palletsDelivered);
      if (n < 0) throw new BadRequestException('palletsDelivered must be >= 0');
      data.palletsDelivered = n;
    }

    if (body.status !== undefined) {
      const st = parseTripShipmentStatus(body.status);
      data.status = st as any;
    }

    if (body.dropStopId !== undefined) {
      if (body.dropStopId === null) {
        data.dropStop = { disconnect: true };
      } else {
        const stopId = mustString('dropStopId', body.dropStopId);
        data.dropStop = { connect: { id: stopId } };
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'Nothing to update. Provide at least one field (tripId, shipmentId, palletsAllocated, palletsLoaded, palletsDelivered, dropStopId, status).',
      );
    }

    return this.prisma.tripShipment.update({
      where: { id: safeId },
      data,
      include: { trip: true, shipment: true, dropStop: true },
    });
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const safeId = mustString('id', id);
    return this.prisma.tripShipment.delete({ where: { id: safeId } });
  }
}
