import { Controller, Get, Post, Body, Param, UseGuards, Req, Put, Query } from '@nestjs/common';
import { LifeSystemService } from './life-system.service';
import { UpdateLifeSystemDto } from './dto/update-life-system.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('life-system')
@UseGuards(AuthGuard('jwt'))
export class LifeSystemController {
  constructor(private readonly lifeSystemService: LifeSystemService) {}

  @Get('history')
  getHistory(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lifeSystemService.getHistory(req.user.userId, startDate, endDate);
  }

  @Get(':date')
  getByDate(@Param('date') date: string, @Req() req: any) {
    return this.lifeSystemService.getByDate(req.user.userId, date);
  }

  @Put(':date')
  updateByDate(
    @Param('date') date: string,
    @Body() dto: UpdateLifeSystemDto,
    @Req() req: any,
  ) {
    return this.lifeSystemService.updateByDate(req.user.userId, date, dto);
  }
}
