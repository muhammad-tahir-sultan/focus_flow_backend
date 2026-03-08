import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LifeSystem } from './schemas/life-system.schema';
import { UpdateLifeSystemDto } from './dto/update-life-system.dto';

@Injectable()
export class LifeSystemService {
  constructor(
    @InjectModel(LifeSystem.name) private lifeSystemModel: Model<LifeSystem>,
  ) {}

  async getByDate(userId: string, date: string): Promise<LifeSystem> {
    let entry = await this.lifeSystemModel.findOne({ userId, date });
    if (!entry) {
      entry = new this.lifeSystemModel({ userId, date });
      await entry.save();
    }
    return entry;
  }

  async getHistory(userId: string, startDate?: string, endDate?: string): Promise<LifeSystem[]> {
    const query: any = { userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    return this.lifeSystemModel.find(query).sort({ date: 1 }).exec();
  }

  async updateByDate(userId: string, date: string, dto: UpdateLifeSystemDto): Promise<LifeSystem> {
    let entry = await this.lifeSystemModel.findOne({ userId, date });
    if (!entry) {
      entry = new this.lifeSystemModel({ userId, date, ...dto });
      return entry.save();
    }
    Object.assign(entry, dto);
    return entry.save();
  }
}
