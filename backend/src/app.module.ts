import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AccountingModule } from './accounting/accounting.module';

@Module({
  imports: [PrismaModule, AccountingModule],
})
export class AppModule {}
