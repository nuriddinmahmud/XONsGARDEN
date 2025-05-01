import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrainageModule } from './drainage/drainage.module';
import { EnergyModule } from './energy/energy.module';
import { FertilizerModule } from './fertilizer/fertilizer.module';
import { FoodModule } from './food/food.module';
import { OilModule } from './oil/oil.module';
import { RemontModule } from './remont/remont.module';
import { TaxModule } from './tax/tax.module';
import { TransportModule } from './transport/transport.module';
import { WorkerModule } from './worker/worker.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DrainageModule, EnergyModule, FertilizerModule, FoodModule, OilModule, RemontModule, TaxModule, TransportModule, WorkerModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
