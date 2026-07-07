import { Controller, Get, UseGuards, Query, Headers } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// Rôles autorisés sur la comptabilité. À centraliser dans auth/access-control si besoin.
const ACCOUNTING_ROLES = ['ADMIN', 'MANAGER', 'ACCOUNTANT'];

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  /**
   * GET /accounting/balance?endDate=YYYY-MM-DD&startDate=YYYY-MM-DD
   * Balance générale OHADA à date.
   */
  @Get('balance')
  @Roles(...ACCOUNTING_ROLES)
  getBalance(
    @Headers('x-tenant-id') headerTenantId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('endDate') endDate?: string,
    @Query('startDate') startDate?: string,
  ) {
    const activeTenantId = headerTenantId || tenantId;
    return this.accountingService.getBalance(activeTenantId, endDate, startDate);
  }

  /**
   * GET /accounting/pnl?period=YYYY-MM
   * Compte de résultat du mois.
   */
  @Get('pnl')
  @Roles(...ACCOUNTING_ROLES)
  getPnl(
    @Headers('x-tenant-id') headerTenantId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const activeTenantId = headerTenantId || tenantId;
    return this.accountingService.getPnl(activeTenantId, startDate || endDate);
  }

  /**
   * GET /accounting/journal?start=ISO&end=ISO
   * Journal (écritures) OHADA, pour l'onglet "Journal" du front.
   */
  @Get('journal')
  @Roles(...ACCOUNTING_ROLES)
  getJournal(
    @Headers('x-tenant-id') headerTenantId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const activeTenantId = headerTenantId || tenantId;
    return this.accountingService.getJournal(activeTenantId, start, end);
  }
}
