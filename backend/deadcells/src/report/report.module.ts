import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { User } from 'src/entities/user.entity';
import { Status } from 'src/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Status])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
    