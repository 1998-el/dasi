export type BusinessType = 'RESTAURANT' | 'RETAIL' | 'PHARMACY';

export interface BusinessConfig {
  type: BusinessType;
  labels: {
    dashboard: string;
    orders: string;
    products: string;
    inventory: string;
    customers: string;
    pointOfSale: string;
    unit: string; // Table vs Rayon vs Comptoir
  };
  features: {
    hasTables: boolean;
    hasKitchen: boolean;
    hasInventory: boolean;
    hasPrescriptions: boolean;
    hasBatches: boolean; // FEFO management
    hasBarcodes: boolean;
  };
  theme: {
    primary: string;
    accent: string;
  };
}

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  RESTAURANT: {
    type: 'RESTAURANT',
    labels: {
      dashboard: "Tableau de bord Restaurant",
      orders: "Commandes",
      products: "Carte & Menu",
      inventory: "Stocks Ingrédients",
      customers: "Clients / Tables",
      pointOfSale: "Prise de commande",
      unit: "Table",
    },
    features: { hasTables: true, hasKitchen: true, hasInventory: true, hasPrescriptions: false, hasBatches: false, hasBarcodes: false },
    theme: { primary: "orange-600", accent: "orange-50" }
  },
  RETAIL: {
    type: 'RETAIL',
    labels: {
      dashboard: "Suivi des Ventes",
      orders: "Ventes",
      products: "Articles & Catalogue",
      inventory: "Entrepôt & Stocks",
      customers: "Fidélité Clients",
      pointOfSale: "Caisse (POS)",
      unit: "Rayon",
    },
    features: { hasTables: false, hasKitchen: false, hasInventory: true, hasPrescriptions: false, hasBatches: false, hasBarcodes: true },
    theme: { primary: "blue-600", accent: "blue-50" }
  },
  PHARMACY: {
    type: 'PHARMACY',
    labels: {
      dashboard: "Suivi Officine",
      orders: "Dispensations",
      products: "Médicaments",
      inventory: "Stocks & Lots (FEFO)",
      customers: "Dossiers Patients",
      pointOfSale: "Comptoir",
      unit: "Comptoir",
    },
    features: { hasTables: false, hasKitchen: false, hasInventory: true, hasPrescriptions: true, hasBatches: true, hasBarcodes: true },
    theme: { primary: "emerald-600", accent: "emerald-50" }
  }
};