# 06 - Modèle de Données

## Objectif

Définir les entités principales de BudgetApp afin de guider la structure locale initiale et la future migration vers PostgreSQL.

Le modèle doit être pensé pour un backend Node.js et PostgreSQL, même si l'application démarre avec un stockage local ou mocké.

---

# Principes

- Une seule vue financière globale par budget.
- Pas de multi-comptes financiers en V1.
- Multi-devise supporté dès le départ.
- Budget individuel ou partagé.
- Structure extensible vers connexion bancaire future.

---

# Entité User

## Champs

- id: string
- name: string
- email: string
- passwordHash: string
- defaultCurrency: string
- theme: light | dark | system
- createdAt: datetime
- updatedAt: datetime

## Relations

- Un utilisateur peut appartenir à plusieurs budgets.
- Un utilisateur peut créer plusieurs invitations.

---

# Entité Budget

## Champs

- id: string
- name: string
- type: personal | shared
- monthlyLimit: number
- defaultCurrency: string
- ownerId: string
- createdAt: datetime
- updatedAt: datetime

## Relations

- Un budget contient des transactions.
- Un budget contient des catégories.
- Un budget contient des objectifs.
- Un budget peut avoir plusieurs membres.

---

# Entité BudgetMember

## Champs

- id: string
- budgetId: string
- userId: string
- role: owner | member
- joinedAt: datetime

## Règle MVP

Les rôles existent pour extensibilité, mais les permissions sont simples en V1.

---

# Entité Invitation

## Champs

- id: string
- budgetId: string
- email: string
- status: pending | accepted | expired
- token: string
- createdBy: string
- createdAt: datetime
- expiresAt: datetime

---

# Entité Transaction

## Champs

- id: string
- budgetId: string
- userId: string
- type: income | expense
- amount: number
- currency: string
- date: date
- description: string
- categoryId: string
- subcategoryId: string | null
- notes: string | null
- isRecurring: boolean
- recurringRuleId: string | null
- createdAt: datetime
- updatedAt: datetime

## Règles

- amount doit être positif.
- type détermine si la transaction est un revenu ou une dépense.
- currency doit respecter le format ISO, ex: CAD, USD, EUR.

---

# Entité Category

## Champs

- id: string
- budgetId: string | null
- name: string
- type: income | expense | both
- color: string
- icon: string
- isDefault: boolean
- createdAt: datetime
- updatedAt: datetime

## Règles

- Les catégories par défaut peuvent avoir budgetId null.
- Les catégories personnalisées sont liées à un budget.

---

# Entité Subcategory

## Champs

- id: string
- categoryId: string
- name: string
- createdAt: datetime
- updatedAt: datetime

---

# Entité RecurringRule

## Champs

- id: string
- budgetId: string
- userId: string
- transactionTemplateId: string | null
- frequency: weekly | monthly | yearly
- startDate: date
- endDate: date | null
- nextOccurrenceDate: date
- isActive: boolean
- createdAt: datetime
- updatedAt: datetime

---

# Entité Goal

## Champs

- id: string
- budgetId: string
- name: string
- description: string | null
- targetAmount: number
- currentAmount: number
- currency: string
- targetDate: date | null
- status: active | completed | archived
- createdAt: datetime
- updatedAt: datetime

---

# Entité DashboardWidgetPreference

## Champs

- id: string
- userId: string
- budgetId: string
- widgetKey: string
- isEnabled: boolean
- position: number
- config: json
- createdAt: datetime
- updatedAt: datetime

---

# Entité FinancialIndicatorPreference

## Champs

- id: string
- userId: string
- budgetId: string
- indicatorKey: string
- isEnabled: boolean
- config: json
- createdAt: datetime
- updatedAt: datetime

---

# Entité ImportBatch

## Champs

- id: string
- budgetId: string
- userId: string
- filename: string
- status: pending | imported | failed
- rowCount: number
- errorCount: number
- createdAt: datetime

---

# Devises

## Règle MVP

L'application supporte plusieurs devises au niveau des transactions et objectifs.

## Champs requis

Chaque montant financier doit être accompagné d'une devise.

## Conversion

La conversion automatique entre devises n'est pas obligatoire en V1. Si aucun taux de change n'est disponible, les totaux multi-devises doivent être affichés avec prudence ou regroupés par devise.
