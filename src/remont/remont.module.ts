import { Module } from '@nestjs/common';
import { RemontService } from './remont.service';
import { RemontController } from './remont.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RemontController],
  providers: [RemontService],
})
export class RemontModule {}
