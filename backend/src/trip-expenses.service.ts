import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { CreateTripExpenseDto, UpdateTripExpenseDto } from './trip-expenses.dto';

@Injectable()
export class TripExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertTripExists(tripId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true },
    });
    if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);
  }

  async findAll(tripId?: string) {
    if (!tripId) throw new BadRequestException('tripId is required');
    await this.assertTripExists(tripId);

    return this.prisma.tripExpense.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
      include: { trip: true },
    });
  }

  async summary(tripId?: string) {
    if (!tripId) throw new BadRequestException('tripId is required');
    await this.assertTripExists(tripId);

    const rows = await this.prisma.tripExpense.groupBy({
      by: ['type', 'currency'],
      where: { tripId },
      _sum: { amount: true },
    });

    return rows.map((r) => ({
      type: r.type,
      currency: r.currency,
      totalAmount: r._sum.amount ?? 0,
    }));
  }

  async findOne(id: string) {
    const row = await this.prisma.tripExpense.findUnique({
      where: { id },
      include: { trip: true },
    });

    if (!row) throw new NotFoundException(`Trip expense ${id} not found`);
    return row;
  }

  async create(body: CreateTripExpenseDto, createdById?: string) {
    if (!body.tripId) throw new BadRequestException('tripId is required');
    await this.assertTripExists(body.tripId);

    return this.prisma.tripExpense.create({
      data: {
        tripId: body.tripId,
        type: body.type,
        amount: body.amount,
        currency: body.currency,
        note: body.note ?? null,
        receiptUrl: body.receiptUrl ?? null,
        createdById: createdById ?? null,
      },
      include: { trip: true },
    });
  }

  async update(id: string, body: UpdateTripExpenseDto) {
    const data: Prisma.TripExpenseUpdateInput = {};

    if (body.type !== undefined) data.type = body.type;
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.note !== undefined) data.note = body.note;
    if (body.receiptUrl !== undefined) data.receiptUrl = body.receiptUrl;
    if (body.amount !== undefined) data.amount = body.amount;

    try {
      return await this.prisma.tripExpense.update({
        where: { id },
        data,
        include: { trip: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Trip expense ${id} not found`);
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.tripExpense.delete({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException(`Trip expense ${id} not found`);
      }
      throw e;
    }
  }
}

