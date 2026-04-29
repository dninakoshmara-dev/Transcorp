import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { CurrentUser } from './auth/current-user.decorator';
import { Roles } from './auth/roles.decorator';

import { TripExpensesService } from './trip-expenses.service';
import { CreateTripExpenseDto, UpdateTripExpenseDto } from './trip-expenses.dto';

@ApiTags('Trip Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trip-expenses')
export class TripExpensesController {
  constructor(private readonly service: TripExpensesService) {}

  // GET /api/trip-expenses?tripId=...
  @ApiOkResponse({ description: 'List trip expenses' })
  @ApiQuery({ name: 'tripId', required: true })
  @ApiBadRequestResponse({ description: 'tripId is required' })
  @Get()
  findAll(@Query('tripId') tripId?: string) {
    return this.service.findAll(tripId);
  }

  // GET /api/trip-expenses/summary?tripId=...
  @ApiOkResponse({ description: 'Grouped summary by type/currency' })
  @ApiQuery({ name: 'tripId', required: true })
  @ApiBadRequestResponse({ description: 'tripId is required' })
  @Get('summary')
  summary(@Query('tripId') tripId?: string) {
    return this.service.summary(tripId);
  }

  // GET /api/trip-expenses/:id
  @ApiOkResponse({ description: 'Get single trip expense' })
  @ApiParam({ name: 'id' })
  @ApiNotFoundResponse({ description: 'Trip expense not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // POST /api/trip-expenses (ADMIN)
  @ApiOkResponse({ description: 'Create trip expense' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @Roles('ADMIN')
  @Post()
  create(@Body() body: CreateTripExpenseDto, @CurrentUser() user: any) {
    return this.service.create(body, user?.id);
  }

  // PATCH /api/trip-expenses/:id (ADMIN)
  @ApiOkResponse({ description: 'Update trip expense' })
  @ApiParam({ name: 'id' })
  @ApiNotFoundResponse({ description: 'Trip expense not found' })
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTripExpenseDto) {
    return this.service.update(id, body);
  }

  // DELETE /api/trip-expenses/:id (ADMIN)
  @ApiOkResponse({ description: 'Delete trip expense' })
  @ApiParam({ name: 'id' })
  @ApiNotFoundResponse({ description: 'Trip expense not found' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
