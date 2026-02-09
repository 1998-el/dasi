# Cahier des Charges Technique - Backend Multi-tenant

## Application : Maat School (Édition EduFlow Pro)

**Version :** 1.0  
**Date :** 2026-02-08  
**Architecture :** Multi-tenant avec isolation par tenant  
**Framework recommandé :** Node.js + Express / NestJS ou Python + FastAPI

---

## 1. Architecture Multi-tenant

### 1.1 Stratégie d'Isolation

| Niveau | Approche | Implémentation |
|--------|----------|----------------|
| **Base de données** | Row-level isolation | Colonne `tenant_id` sur toutes les tables |
| **Authentification** | JWT avec tenant context | Token contient `tenant_id` et `user_id` |
| **API** | Middleware de filtrage | Injection automatique du `tenant_id` |
| **Fichier** | Préfixe par tenant | `s3://maatschool/{tenant_id}/...` |

### 1.2 Modèle de Données par Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN TABLE                        │
├─────────────────────────────────────────────────────────────┤
│ • tenants (id, name, slug, plan, status, created_at)       │
│ • subscription_plans (name, features, limits, pricing)     │
│ • global_settings (key, value)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TENANT DATA                              │
├─────────────────────────────────────────────────────────────┤
│ • users (id, tenant_id, email, password_hash, role, ...)    │
│ • students (id, tenant_id, user_id, ...)                   │
│ • teachers (id, tenant_id, user_id, ...)                   │
│ • courses (id, tenant_id, ...)                              │
│ • enrollments (id, tenant_id, ...)                          │
│ • attendances (id, tenant_id, ...)                          │
│ • payments (id, tenant_id, ...)                            │
│ • settings (id, tenant_id, key, value)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Modèles de Données Détaillés

### 2.1 Tenant (Organisation)

```typescript
interface Tenant {
  id: UUID;
  name: string;                    // "Centre de Formation Maat"
  slug: string;                    // "maat-school" (URL unique)
  domain?: string;                 // Optional custom domain
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  settings: TenantSettings;
  limits: {
    maxUsers: number;
    maxStudents: number;
    maxStorage: number;           // en GB
  };
  subscription: {
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TenantSettings {
  locale: string;                 // "fr-FR", "en-US", etc.
  timezone: string;              // "Europe/Paris"
  dateFormat: string;            // "DD/MM/YYYY"
  currency: string;             // "EUR"
  primaryColor: string;          // "#0A2463"
  theme: 'light' | 'dark' | 'system';
  features: {
    attendance: boolean;
    payments: boolean;
    reports: boolean;
  };
}
```

### 2.2 User (Utilisateur par Tenant)

```typescript
interface User {
  id: UUID;
  tenantId: UUID;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'locked';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    title?: string;              // Poste (Administrateur, etc.)
  };
  preferences: {
    language: string;           // Langue de l'interface utilisateur
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      reminders: boolean;
    };
  };
  permissions: string[];        // Permissions granulaires
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 
  | 'super_admin'      // Accès total (platform)
  | 'tenant_admin'     // Admin du tenant
  | 'secretary'        // Secrétariat
  | 'teacher'          // Enseignant
  | 'student';         // Étudiant
```

### 2.3 Système de Rôles et Permissions

```typescript
interface Role {
  id: UUID;
  tenantId: UUID;
  name: string;
  description: string;
  isSystem: boolean;            // Rôles par défaut non supprimables
  permissions: Permission[];
  createdAt: Date;
}

interface Permission {
  module: string;               // 'students', 'teachers', 'courses', etc.
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Matrice des permissions par défaut
const DEFAULT_ROLES: Record<UserRole, Permission[]> = {
  tenant_admin: [
    { module: '*', actions: ['create', 'read', 'update', 'delete'] }
  ],
  secretary: [
    { module: 'students', actions: ['create', 'read', 'update'] },
    { module: 'teachers', actions: ['read'] },
    { module: 'courses', actions: ['read'] },
    { module: 'payments', actions: ['create', 'read', 'update'] },
    { module: 'attendance', actions: ['create', 'read'] },
  ],
  teacher: [
    { module: 'students', actions: ['read'] },
    { module: 'courses', actions: ['read', 'update'] },
    { module: 'attendance', actions: ['create', 'read', 'update'] },
    { module: 'grades', actions: ['create', 'read', 'update'] },
  ],
  student: [
    { module: 'courses', actions: ['read'] },
    { module: 'attendance', actions: ['read'] },
    { module: 'grades', actions: ['read'] },
    { module: 'payments', actions: ['read'] },
  ]
};
```

### 2.4 Student (Étudiant)

```typescript
interface Student {
  id: UUID;
  tenantId: UUID;
  userId?: UUID;                // Lien optionnel vers compte utilisateur
  registrationNumber: string;    // Numéro d'inscription unique par tenant
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    address?: Address;
    emergencyContact?: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  academic: {
    enrollmentDate: Date;
    programId: UUID;
    status: 'active' | 'graduated' | 'inactive' | 'suspended';
    level?: string;
    avatar?: string;
  };
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.5 Teacher (Enseignant)

```typescript
interface Teacher {
  id: UUID;
  tenantId: UUID;
  userId?: UUID;
  employeeNumber: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string[];
    qualifications?: string[];
    avatar?: string;
  };
  contract: {
    type: 'full_time' | 'part_time' | 'contractor';
    hourlyRate?: number;
    startDate: Date;
    endDate?: Date;
  };
  availability: DaySchedule[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6 Course (Cours/Module)

```typescript
interface Course {
  id: UUID;
  tenantId: UUID;
  code: string;                 // Code unique dans le tenant
  name: string;
  description?: string;
  credits: number;
  teacherId?: UUID;
  programId?: UUID;
  modules: Module[];
  schedule: CourseSession[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

interface Module {
  id: UUID;
  courseId: UUID;
  name: string;
  description?: string;
  duration: number;            // en heures
  order: number;
}

interface CourseSession {
  id: UUID;
  courseId: UUID;
  dayOfWeek: number;           // 0-6 (Dimanche-Samedi)
  startTime: string;           // "09:00"
  endTime: string;             // "10:30"
  room?: string;
  startDate: Date;
  endDate?: Date;
}
```

### 2.7 Attendance (Présence)

```typescript
interface Attendance {
  id: UUID;
  tenantId: UUID;
  sessionId: UUID;
  studentId: UUID;
  status: 'present' | 'absent' | 'late' | 'excused';
  date: Date;
  checkInTime?: Date;
  notes?: string;
  recordedById: UUID;
  createdAt: Date;
}
```

### 2.8 Payment (Scolarité)

```typescript
interface Payment {
  id: UUID;
  tenantId: UUID;
  studentId: UUID;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  type: 'tuition' | 'fee' | 'other';
  dueDate: Date;
  paidDate?: Date;
  method?: 'cash' | 'bank_transfer' | 'card' | 'other';
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 3. API REST - Points d'Entrée

### 3.1 Authentication

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/register` | Créer un nouveau tenant + admin |
| POST | `/api/v1/auth/login` | Connexion (renvoie JWT) |
| POST | `/api/v1/auth/refresh` | Rafraîchir le token |
| POST | `/api/v1/auth/logout` | Déconnexion |
| GET | `/api/v1/auth/me` | Profil utilisateur courant |
| PUT | `/api/v1/auth/password` | Changer le mot de passe |

### 3.2 Utilisateurs & Équipe

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/users` | Liste des utilisateurs du tenant |
| POST | `/api/v1/users` | Créer un nouvel utilisateur |
| GET | `/api/v1/users/:id` | Détails d'un utilisateur |
| PUT | `/api/v1/users/:id` | Modifier un utilisateur |
| DELETE | `/api/v1/users/:id` | Supprimer un utilisateur |
| PUT | `/api/v1/users/:id/role` | Changer le rôle d'un utilisateur |
| PUT | `/api/v1/users/:id/status` | Activer/désactiver un utilisateur |

### 3.3 Gestion des Rôles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/roles` | Liste des rôles du tenant |
| POST | `/api/v1/roles` | Créer un nouveau rôle |
| GET | `/api/v1/roles/:id` | Détails d'un rôle |
| PUT | `/api/v1/roles/:id` | Modifier un rôle |
| DELETE | `/api/v1/roles/:id` | Supprimer un rôle |
| PUT | `/api/v1/roles/:id/permissions` | Mettre à jour les permissions |

### 3.4 Étudiants

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/students` | Liste des étudiants (avec filtres) |
| POST | `/api/v1/students` | Créer un étudiant |
| GET | `/api/v1/students/:id` | Détails d'un étudiant |
| PUT | `/api/v1/students/:id` | Modifier un étudiant |
| DELETE | `/api/v1/students/:id` | Supprimer un étudiant |
| GET | `/api/v1/students/:id/payments` | Paiements d'un étudiant |
| POST | `/api/v1/students/:id/enroll` | Inscrire à un cours |

### 3.5 Enseignants

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/teachers` | Liste des enseignants |
| POST | `/api/v1/teachers` | Créer un enseignant |
| GET | `/api/v1/teachers/:id` | Détails d'un enseignant |
| PUT | `/api/v1/teachers/:id` | Modifier un enseignant |
| DELETE | `/api/v1/teachers/:id` | Supprimer un enseignant |
| GET | `/api/v1/teachers/:id/courses` | Cours d'un enseignant |

### 3.6 Cours

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/courses` | Liste des cours |
| POST | `/api/v1/courses` | Créer un cours |
| GET | `/api/v1/courses/:id` | Détails d'un cours |
| PUT | `/api/v1/courses/:id` | Modifier un cours |
| DELETE | `/api/v1/courses/:id` | Supprimer un cours |
| POST | `/api/v1/courses/:id/modules` | Ajouter un module |
| PUT | `/api/v1/courses/:id/schedule` | Modifier l'emploi du temps |

### 3.7 Présences

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/attendance` | Liste des présences (avec filtres) |
| POST | `/api/v1/attendance` | Enregistrer une présence |
| POST | `/api/v1/attendance/bulk` | Enregistrer plusieurs présences |
| GET | `/api/v1/attendance/session/:sessionId` | Présences d'une session |
| PUT | `/api/v1/attendance/:id` | Modifier une présence |

### 3.8 Paiements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/payments` | Liste des paiements |
| POST | `/api/v1/payments` | Créer un paiement |
| GET | `/api/v1/payments/:id` | Détails d'un paiement |
| PUT | `/api/v1/payments/:id` | Modifier un paiement |
| POST | `/api/v1/payments/:id/receipt` | Générer un reçu |
| GET | `/api/v1/payments/export` | Exporter les paiements |

### 3.9 Paramètres (Settings)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/settings` | Récupérer tous les paramètres |
| PUT | `/api/v1/settings` | Mettre à jour plusieurs paramètres |
| GET | `/api/v1/settings/profile` | Paramètres du profil |
| PUT | `/api/v1/settings/profile` | Modifier le profil |
| GET | `/api/v1/settings/appearance` | Paramètres d'apparence |
| PUT | `/api/v1/settings/appearance` | Modifier l'apparence |
| GET | `/api/v1/settings/language` | Paramètres de langue |
| PUT | `/api/v1/settings/language` | Modifier la langue |
| GET | `/api/v1/settings/notifications` | Paramètres de notifications |
| PUT | `/api/v1/settings/notifications` | Modifier les notifications |
| GET | `/api/v1/settings/security` | Paramètres de sécurité |
| PUT | `/api/v1/settings/security` | Modifier la sécurité |

---

## 4. Internationalisation (i18n)

### 4.1 Structure des Traductions

```
locales/
├── fr-FR/
│   ├── common.json
│   ├── students.json
│   ├── teachers.json
│   ├── courses.json
│   └── settings.json
├── en-US/
│   ├── common.json
│   ├── students.json
│   ├── teachers.json
│   ├── courses.json
│   └── settings.json
└── ar-AR/
    └── ...
```

### 4.2 Gestion des Langues Backend

```typescript
interface LanguageSettings {
  defaultLocale: string;        // Langue par défaut du tenant
  supportedLocales: string[];   // Langues supportées
  allowUserPreference: boolean; // Autoriser le choix utilisateur
}

interface Translation {
  key: string;
  locale: string;
  value: string;
  module: string;
}

// Endpoints pour les traductions
GET    /api/v1/i18n/:locale/:module  // Récupérer les traductions
POST   /api/v1/i18n/:locale/:module  // Ajouter une traduction
PUT    /api/v1/i18n/:locale/:module  // Modifier des traductions
```

---

## 5. Authentification et Sécurité

### 5.1 JWT Token Structure

```typescript
interface JWTPayload {
  sub: string;              // user_id
  email: string;
  tenant_id: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}
```

### 5.2 Middleware d'Authentification

```typescript
// AuthMiddleware
async function authMiddleware(req, res, next) {
  const token = extractToken(req);
  const decoded = verifyToken(token);
  
  // Vérifier que l'utilisateur appartient au tenant
  const user = await UserService.findById(decoded.sub);
  if (!user || user.tenant_id !== decoded.tenant_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  req.user = decoded;
  req.tenantId = decoded.tenant_id;
  next();
}

// PermissionMiddleware
function requirePermission(permission: string) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}
```

---

## 6. Base de Données

### 6.1 Schéma PostgreSQL (Simplifié)

```sql
-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'starter',
    status VARCHAR(20) DEFAULT 'trial',
    settings JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    subscription JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (avec tenant isolation)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    profile JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    permissions TEXT[] DEFAULT '{}',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    registration_number VARCHAR(50) NOT NULL,
    profile JSONB NOT NULL,
    academic JSONB NOT NULL,
    documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, registration_number)
);

-- Teachers
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    employee_number VARCHAR(50) NOT NULL,
    profile JSONB NOT NULL,
    contract JSONB NOT NULL,
    availability JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, employee_number)
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 0,
    teacher_id UUID REFERENCES teachers(id),
    program_id UUID,
    modules JSONB DEFAULT '[]',
    schedule JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Attendances
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP,
    notes TEXT,
    recorded_by_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending',
    type VARCHAR(50),
    due_date DATE NOT NULL,
    paid_date DATE,
    method VARCHAR(50),
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number)
);

-- Index pour performance
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_teachers_tenant ON teachers(tenant_id);
CREATE INDEX idx_courses_tenant ON courses(tenant_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_payments_student ON payments(student_id);
```

---

## 7. Services Backend

### 7.1 TenantService

```typescript
class TenantService {
  async create(data: CreateTenantDTO): Promise<Tenant>
  async findById(id: UUID): Promise<Tenant>
  async findBySlug(slug: string): Promise<Tenant>
  async update(id: UUID, data: UpdateTenantDTO): Promise<Tenant>
  async delete(id: UUID): Promise<void>
  async getSettings(tenantId: UUID): Promise<TenantSettings>
  async updateSettings(tenantId: UUID, settings: Partial<TenantSettings>): Promise<Tenant>
}
```

### 7.2 UserService

```typescript
class UserService {
  async create(tenantId: UUID, data: CreateUserDTO): Promise<User>
  async findById(id: UUID, tenantId: UUID): Promise<User>
  async findByEmail(email: string, tenantId: UUID): Promise<User>
  async findAll(tenantId: UUID, filters?: UserFilters): Promise<User[]>
  async update(id: UUID, tenantId: UUID, data: UpdateUserDTO): Promise<User>
  async delete(id: UUID, tenantId: UUID): Promise<void>
  async changeRole(id: UUID, tenantId: UUID, role: UserRole): Promise<User>
  async changeStatus(id: UUID, tenantId: UUID, status: UserStatus): Promise<User>
  async addUserToTenant(tenantId: UUID, inviterId: UUID, data: InviteUserDTO): Promise<void>
}
```

### 7.3 RoleService

```typescript
class RoleService {
  async create(tenantId: UUID, data: CreateRoleDTO): Promise<Role>
  async findById(id: UUID, tenantId: UUID): Promise<Role>
  async findAll(tenantId: UUID): Promise<Role[]>
  async update(id: UUID, tenantId: UUID, data: UpdateRoleDTO): Promise<Role>
  async delete(id: UUID, tenantId: UUID): Promise<void>
  async assignPermissions(id: UUID, tenantId: UUID, permissions: Permission[]): Promise<Role>
}
```

---

## 8. Workflows Métier

### 8.1 Ajout d'un Membre à un Tenant

```
1. Admin clique sur "Ajouter un membre"
2. Formulaire: Nom, Email, Rôle
3. Backend:
   ├── Vérifier que l'admin a la permission 'users:create'
   ├── Vérifier les limites du tenant
   ├── Créer l'utilisateur avec statut 'pending'
   ├── Générer token d'invitation
   └── Envoyer email d'invitation
4. Utilisateur reçoit email avec lien d'activation
5. Utilisateur complète son profil et définit son mot de passe
6. Statut passe à 'active'
7. Accès aux ressources du tenant
```

### 8.2 Gestion des Permissions

```
Rôles par défaut (système):
├── tenant_admin: Accès total au tenant
├── secretary: Gestion administrative
├── teacher: Enseignement et présence
└── student: Accès limité à son parcours

Permissions granulaires:
├── Module: students
│   ├── create: Créer des étudiants
│   ├── read: Voir les étudiants
│   ├── update: Modifier les étudiants
│   └── delete: Supprimer des étudiants
├── Module: payments
│   ├── create: Enregistrer des paiements
│   ├── read: Voir les paiements
│   └── ...
```

---

## 9. Considérations de Sécurité

### 9.1 Protection CSRF

```typescript
// Double Cookie Submit pattern
csrfToken = generateCSRFToken();
res.cookie('csrf_token', csrfToken, { httpOnly: false, secure: true });
// Inclure le token dans les headers de chaque requête
```

### 9.2 Rate Limiting

```typescript
const rateLimiter = {
  auth: { windowMs: 15*60*1000, max: 5 },     // 5 tentatives login/15min
  api: { windowMs: 60*1000, max: 100 },       // 100 requêtes/min
  upload: { windowMs: 60*1000, max: 10 }      // 10 uploads/min
};
```

### 9.3 Chiffrement des Données Sensibles

```typescript
// Chiffrement des données personnelles
encryptedData = encryptAES256(data, ENCRYPTION_KEY);

// Hachage des mots de passe
passwordHash = bcrypt.hash(password, 12);
```

---

## 10. Monitoring et Logs

### 10.1 Structure de Logs

```json
{
  "timestamp": "2026-02-08T22:00:00Z",
  "level": "INFO",
  "tenant_id": "uuid",
  "user_id": "uuid",
  "action": "user.create",
  "resource": "users",
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": { ... },
  "duration_ms": 45
}
```

### 10.2 Métriques

- Nombre d'utilisateurs par tenant
- Requêtes par tenant
- Temps de réponse moyen
- Taux d'erreur
- Utilisation du stockage

---

## 11. Plan de Migration

### Phase 1: Infrastructure
- [ ] Configurer PostgreSQL avec partitionnement par tenant
- [ ] Mettre en place le cluster Redis pour les sessions
- [ ] Configurer S3 pour le stockage des fichiers

### Phase 2: Core Backend
- [ ] Implémenter TenantService
- [ ] Implémenter AuthService avec JWT
- [ ] Implémenter UserService
- [ ] Implémenter RoleService

### Phase 3: Modules Fonctionnels
- [ ] CRUD Students
- [ ] CRUD Teachers
- [ ] CRUD Courses
- [ ] Module Attendance
- [ ] Module Payments

### Phase 4: Settings & i18n
- [ ] Service de settings par tenant
- [ ] Système d'internationalisation
- [ ] API de préférences utilisateur

---

*Document généré le 2026-02-08*
