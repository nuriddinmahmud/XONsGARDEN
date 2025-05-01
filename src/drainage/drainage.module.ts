import { Module } from '@nestjs/common';
import { DrainageService } from './drainage.service';
import { DrainageController } from './drainage.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DrainageController],
  providers: [DrainageService],
})
export class DrainageModule {}
