# Intégration Frontend pilotée par `businessType` (RETAIL / PHARMACY / RESTAURANT)

## 1) Objectif du livrable
Ce document décrit :
1. **L’intégration frontend** (pages / workflows) pilotée uniquement par **`BusinessType`** via `AuthContext`.
2. **Les fonctionnalités backend exploitables** côté frontend, listées **par modules**.
3. Un **contrat d’API attendu** pour le **Cash closing / Z-report**, afin de rendre le frontend “front-ready”.

> **Source de vérité (frontend)** : `src/context/AuthContext.tsx` via `profile?.tenant?.businessType || profile?.businessType || 'RESTAURANT'`.
> **Configuration UI / features** : `src/context/business.ts` (`BUSINESS_CONFIGS`).

---

## 2) Source de vérité & gating UI

### 2.1 `AuthContext` (BusinessType)
- `AuthContext` calcule `businessType` à partir du profil.
- Il expose `businessConfig = BUSINESS_CONFIGS[businessType]`.

### 2.2 `BUSINESS_CONFIGS` (type → labels/features/theme)
Fait dans `src/context/business.ts` :
- `RESTAURANT`
  - `features.hasTables = true`
  - `features.hasInventory = true`
  - `features.hasKitchen = true`
  - `features.hasPrescriptions = false`
  - `features.hasBatches = false`
  - `features.hasBarcodes = false`
- `RETAIL`
  - pas de tables, POS/caisses
  - `features.hasInventory = true`
  - `features.hasBarcodes = true`
- `PHARMACY`
  - pas de tables
  - ordonnances + gestion lots/FEFO
  - `features.hasPrescriptions = true`
  - `features.hasBatches = true`
  - `features.hasBarcodes = true`

---

## 3) Pages / workflows frontend déjà intégrés

### 3.1 Client (RESTAURANT uniquement)

#### A) Menu
- Route : **`/menu`**
- Comportement attendu : affichage du menu par catégories.

#### B) Scan table
- Route : **`/scan/:tenantId/:tableCode`**
- Endpoints attendus :
  - `GET /products?status=AVAILABLE`
  - `GET /tables/scan/:tenantId/:tableCode`
  - `GET /tables/:id` (selon affichage/lookup)

#### C) Checkout commande
- Route/flow : commande depuis le client restaurant
- Endpoint : `POST /orders`

#### D) Ticket PDF
- Génération téléchargement via endpoints **tickets** : **déjà câblé** par le front.

---

### 3.2 Admin / Manager / Backoffice (unifié)

#### A) `OrdersPage.tsx` = hub “unified workflow”
`OrdersPage.tsx` agit comme orchestrateur unique selon `businessConfig.type`.

##### RESTAURANT
- Liste : `GET /orders`
- Création/cumul : `POST /orders` et/ou cumul items via `POST /sales/order/:orderId/items` (cumul table occupée côté backend)
- Flux de statut (chaîne typique) :
  - `validate` → `prepare` → `ready` → `serve` → `bill`
  - Cancel : action dédiée
- Facturation :
  - `POST /sales/from-order/:orderId`

##### RETAIL
- Liste basée sur `GET /sales`
- Checkout vente caisse POS :
  - `POST /retail/checkout`
  - payload : `RetailCheckoutDto`

##### PHARMACY
- Liste basée sur `GET /sales` (dispensations proxyisées)
- Checkout dispensation :
  - `POST /pharmacy/checkout`
  - payload : `PharmacyCheckoutDto`

---

## 4) Contrats DTO checkout (payload integration)

### 4.1 RetailCheckoutDto
Chemin (backend) : `src/auth/dto/retail-checkout.dto.ts`

**Payload attendu :**
```ts
{
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod
  customerId?: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
}
```

### 4.2 PharmacyCheckoutDto
Chemin (backend) : `src/auth/dto/pharmacy-checkout.dto.ts`

**Payload attendu :**
```ts
{
  prescriptionId?: string
  totalAmount: number
  paymentMethod: PaymentMethod
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
}
```

---

## 5) Paiements, finances & reporting (front-ready)

### 5.1 Paiements (déjà exploités)
La page `PaymentsPage.tsx` consomme des endpoints déjà câblés via `src/pages/auth.service.ts` :
- Liste : `GET /payments`
- Ventes en attente : `GET /sales?status=PENDING` (via `getSales({status:'PENDING'})`)
- Encaissement : `POST /payments`
- Verify mobile payment : `POST /payments/:id/verify`
- Force validate : `POST /payments/:id/force-validate`
- Refund : `POST /payments/:id/refund`
- Report par période (générique) : `GET /payments/report?startDate&endDate`

### 5.2 Cash closing / Z-report (à prévoir)
Le backend annonce :
- `ReportsService.generateZReport(tenantId, date, format)`
- `ZReportPdfService.generateZReportPdf` → PDF

#### Page front attendue
Créer une page dédiée : **“Cash closing / Z-report”** ou un onglet sur Accounting.

#### Contrat d’API attendu (à aligner)
Comme les routes exactes côté frontend ne sont pas encore câblées dans `auth.service.ts`, le contrat attendu est :

1) Génération “report data” (optionnel si PDF uniquement)
- `POST /reports/z-report` **ou** `GET /reports/z-report` (à confirmer côté backend)
- Query/Body attendu :
  - `tenantId`
  - `date`
  - `format` (par ex: `PDF`, `HTML`, `CSV`)

2) Génération PDF
- Endpoint attendu :
  - `GET /reports/z-report/pdf?tenantId=...&date=...`
  - ou `POST /reports/z-report/pdf` avec body tenantId/date

#### UX recommandée
- Sélecteur date (par défaut : aujourd’hui)
- Choix format (PDF obligatoire au minimum)
- Bouton “Générer” → téléchargement PDF

---

## 6) Accounting & OHADA (backend expose, frontend à brancher)
Accounting backend annoncé : écritures OHADA via `AccountingService` :
- JournalEntry + JournalLine
- VENTES / ACHATS
- Paiements ventilés selon `PaymentMethod` (caisse vs banque)

### Front à brancher
- Remplacer `AccountingPage.tsx` (actuellement mock) par :
  - Balance (si disponible via `AccountingController`)
  - P&L (Profit & Loss)
  - Génération Z-report

---

## 7) Checklist : fonctionnalités backend exploitables (par module)

### 7.1 Auth
- `login/register/onboarding/verify otp`
- `GET /auth/profile` (resynchronisation tenantId + businessType)

### 7.2 Catalogue produits
- `GET /products` (filtres)
- `GET /products/:id`
- `GET /products/stats`
- `GET /products/low-stock`
- `GET /retail/product/:barcode` (douchette)

### 7.3 Restaurant
- `GET /tables/scan/:tenantId/:tableCode`
- `GET /tables/:id`
- `GET /orders`
- `POST /orders`
- `PUT /orders/:id/...` (validate/prepare/ready/serve/cancel)
- `POST /sales/from-order/:orderId` (facturation)
- Ticket PDF via endpoints tables/tickets (déjà câblé)

### 7.4 Retail
- `GET /sales` (liste)
- `POST /retail/checkout` (RetailCheckoutDto)

### 7.5 Pharmacy
- `POST /pharmacy/checkout` (PharmacyCheckoutDto)
- Dispensation basée sur modèle PharmacyDispense (lots/FEFO côté backend)
- Liste basée sur `GET /sales` (dispensations proxyisées)

### 7.6 Paiements & Finances
- `GET /payments`
- `POST /payments`
- `verify mobile payment` : `POST /payments/:id/verify`
- `force validate` : `POST /payments/:id/force-validate`
- `refund` : `POST /payments/:id/refund`
- Report : `GET /payments/report?startDate&endDate`

### 7.7 Reporting
- `ReportsService.generateZReport(tenantId, date, format)`
- `ZReportPdfService.generateZReportPdf` (PDF)

### 7.8 HR (backoffice)
- `GET /hr/...` (membres)
- shifts, attendance, leave, payroll, tips
- (déjà câblé partiellement via `auth.service.ts`)

### 7.9 Comptabilité (OHADA)
- `AccountingService` : création JournalEntry/JournalLine
- VENTES → journal vente
- ACHATS → journal achat
- Paiements : ventilation selon caisse/banque
- Balance / P&L via endpoints `AccountingController` (si utilisées)

---

## 8) Résumé architectural (à respecter pendant l’implémentation)
1. **Le frontend décide “quoi montrer”** via `businessType` + `businessConfig.features`.
2. **Le frontend décide “quels endpoints appeler”** via `businessConfig.type`.
3. **Les DTO checkout** (Retail/Pharmacy) sont respectés pour l’intégration.
4. Les pages non spécifiques (ex: OrdersPage hub) doivent rester **unifiées**.
5. Accounting/Z-report : remplacer les mocks par appels backend + gérer génération/export PDF.

---

## 9) Notes de conformité intégration
- Les endpoints “Z-report” et/ou “generateZReportPdf” doivent être **confirmés** côté routes exposées (HTTP method + path).
- Le front-ready doit prévoir :
  - le parsing tenantId côté authService
  - le téléchargement PDF (Blob → download)

---

> Fin du document.

