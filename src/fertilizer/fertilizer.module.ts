import { Module } from '@nestjs/common';
import { FertilizerService } from './fertilizer.service';
import { FertilizerController } from './fertilizer.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FertilizerController],
  providers: [FertilizerService],
})
export class FertilizerModule {}
