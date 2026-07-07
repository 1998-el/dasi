import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalType, PaymentMethod } from '@prisma/client';

// Libellés OHADA par code de compte (utilisés pour l'affichage front-end)
export const ACCOUNT_LABELS: Record<string, string> = {
  '701100': 'Ventes de marchandises',
  '521100': 'Banques & Institutions financières',
  '571100': 'Caisse',
  '601100': 'Achats de marchandises',
  '401100': 'Fournisseurs',
};

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée une écriture de vente conforme OHADA
   * Débit: 521 (Banque) ou 571 (Caisse)
   * Crédit: 701 (Vente de marchandises)
   */
  async createEntryFromSale(tx: any, saleId: string) {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { payments: true, tenant: true },
    });

    const entry = await tx.journalEntry.create({
      data: {
        tenantId: sale.tenantId,
        reference: `VENTE-${sale.saleNumber}`,
        description: `Enregistrement vente ${sale.saleNumber}`,
        journal: JournalType.VENTES,
      },
    });

    // Ligne de Revenu (Crédit)
    await tx.journalLine.create({
      data: {
        journalEntryId: entry.id,
        tenantId: sale.tenantId,
        accountCode: '701100', // Ventes Retail/Resto
        credit: sale.totalAmount,
      },
    });

    // Intelligence : Ventilation de la trésorerie selon le mode de paiement
    for (const payment of sale.payments) {
      const isElectronic = [
        PaymentMethod.ORANGE_MONEY,
        PaymentMethod.MTN_MONEY,
        PaymentMethod.CARD,
        PaymentMethod.BANK_TRANSFER,
      ].includes(payment.method);

      await tx.journalLine.create({
        data: {
          journalEntryId: entry.id,
          tenantId: sale.tenantId,
          // OHADA: 571 = Caisse, 521 = Banques & Institutions financières
          accountCode: isElectronic ? '521100' : '571100',
          debit: payment.amount,
          description: `Paiement ${payment.method} - ${sale.saleNumber}`,
        },
      });
    }
  }

  /**
   * Crée une écriture d'achat conforme OHADA
   * Débit: 601 (Achats de marchandises)
   * Crédit: 401 (Fournisseurs)
   */
  async createEntryFromPurchase(tx: any, purchaseId: string) {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { supplier: true },
    });

    const entry = await tx.journalEntry.create({
      data: {
        tenantId: purchase.tenantId,
        reference: `ACHAT-${purchase.purchaseNumber}`,
        description: `Enregistrement achat ${purchase.purchaseNumber} - ${purchase.supplier?.name || 'Inconnu'}`,
        journal: JournalType.ACHATS,
      },
    });

    await tx.journalLine.createMany({
      data: [
        {
          journalEntryId: entry.id,
          tenantId: purchase.tenantId,
          accountCode: '601100', // Achats
          debit: purchase.totalAmount,
        },
        {
          journalEntryId: entry.id,
          tenantId: purchase.tenantId,
          accountCode: '401100', // Fournisseurs
          credit: purchase.totalAmount,
        },
      ],
    });
  }

  /**
   * Crée une écriture de vente pharmacie conforme OHADA
   */
  async createEntryFromPharmacyDispense(tx: any, dispenseId: string, paymentMethod: PaymentMethod) {
    const dispense = await tx.pharmacyDispense.findUnique({
      where: { id: dispenseId },
    });

    if (!dispense) return;

    const entry = await tx.journalEntry.create({
      data: {
        tenantId: dispense.tenantId,
        reference: `VENTE-PHA-${dispense.dispenseNumber}`,
        description: `Vente pharmacie ${dispense.dispenseNumber}`,
        journal: JournalType.VENTES,
      },
    });

    // Crédit: 701 (Ventes de marchandises)
    await tx.journalLine.create({
      data: {
        journalEntryId: entry.id,
        tenantId: dispense.tenantId,
        accountCode: '701100',
        credit: dispense.totalAmount,
      },
    });

    // Débit: Trésorerie (Caisse 571 ou Banque 521)
    const isElectronic = [
      PaymentMethod.ORANGE_MONEY,
      PaymentMethod.MTN_MONEY,
      PaymentMethod.CARD,
      PaymentMethod.BANK_TRANSFER,
      PaymentMethod.CASH,
      PaymentMethod.MIXED,
    ].includes(paymentMethod);

    await tx.journalLine.create({
      data: {
        journalEntryId: entry.id,
        tenantId: dispense.tenantId,
        accountCode: isElectronic ? '521100' : '571100',
        debit: dispense.totalAmount,
      },
    });
  }

  /**
   * Balance générale des comptes (OHADA) à une date.
   * Agrège tous les journaux jusqu'à `endDate` (défaut: maintenant).
   */
  async getBalance(tenantId: string, endDate?: string, startDate?: string) {
    const end = endDate ? this.endOfDay(new Date(endDate)) : new Date();
    const start = startDate ? this.startOfDay(new Date(startDate)) : new Date(0);

    const lines = await this.prisma.journalLine.findMany({
      where: {
        tenantId,
        journalEntry: { createdAt: { gte: start, lte: end } },
      },
      select: { accountCode: true, label: true, debit: true, credit: true },
    });

    const map = new Map<string, { label: string | null; debit: number; credit: number }>();
    for (const l of lines) {
      const cur = map.get(l.accountCode) ?? { label: l.label, debit: 0, credit: 0 };
      cur.debit += Number(l.debit ?? 0);
      cur.credit += Number(l.credit ?? 0);
      if (!cur.label && l.label) cur.label = l.label;
      map.set(l.accountCode, cur);
    }

    const accounts = [...map.entries()]
      .map(([code, v]) => ({
        code,
        label: v.label ?? ACCOUNT_LABELS[code] ?? code,
        debit: v.debit,
        credit: v.credit,
        balance: v.debit - v.credit,
      }))
      .sort((a, b) => a.code.localeCompare(b.code));

    return { asOf: end.toISOString(), accounts };
  }

  /**
   * Compte de résultat (P&L) pour un mois donné (`period` = YYYY-MM ou YYYY-MM-DD).
   * Renvoie le shape attendu par le front: { monthlyData, expenseBreakdown }.
   */
  async getPnl(tenantId: string, period?: string) {
    const ref = period ? new Date(period) : new Date();
    const start = this.startOfMonth(ref);
    const end = this.endOfMonth(ref);

    const lines = await this.prisma.journalLine.findMany({
      where: {
        tenantId,
        journalEntry: { createdAt: { gte: start, lte: end } },
      },
      select: { accountCode: true, debit: true, credit: true },
    });

    let revenue = 0;
    let expenses = 0;
    let tax = 0;
    const expenseByAccount = new Map<string, number>();

    for (const l of lines) {
      const code = l.accountCode;
      const deb = Number(l.debit ?? 0);
      const cred = Number(l.credit ?? 0);

      if (code.startsWith('70')) {
        revenue += cred; // Produits en crédit
      } else if (code.startsWith('60')) {
        expenses += deb; // Charges d'exploitation en débit
        expenseByAccount.set(code, (expenseByAccount.get(code) ?? 0) + deb);
      } else if (code.startsWith('44') || code.startsWith('21')) {
        tax += deb; // TVA / impôts (simplifié)
      }
    }

    const totalExpense = expenses || 1;
    const expenseBreakdown = [...expenseByAccount.entries()]
      .map(([code, val]) => ({
        label: ACCOUNT_LABELS[code] ?? code,
        value: Math.round((val / totalExpense) * 100),
      }))
      .sort((a, b) => b.value - a.value);

    const monthLabel = start.toLocaleDateString('fr-FR', { month: 'short' });

    return {
      monthlyData: [{ month: monthLabel, revenue, expenses, tax }],
      expenseBreakdown,
    };
  }

  async findAllEntries(tenantId: string, start?: Date, end?: Date) {
    return this.prisma.journalEntry.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: { lines: true },
    });
  }

  /** Wrapper orienté contrôleur (string en entrée). */
  getJournal(tenantId: string, start?: string, end?: string) {
    return this.findAllEntries(
      tenantId,
      start ? new Date(start) : undefined,
      end ? new Date(end) : undefined,
    );
  }

  // ---- Helpers de dates ----
  private startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
  private endOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }
  private startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
  private endOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  }
}
