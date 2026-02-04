import { Body, Controller, Get, Post } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Controller('api/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }
}
