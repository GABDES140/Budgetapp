# 07 - Architecture Technique

## Objectif

Définir l'architecture technique cible de BudgetApp pour guider Codex dans la génération d'un projet cohérent, maintenable et extensible.

---

# Stack recommandée

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion

## Backend cible

- Node.js
- API REST ou server actions selon l'approche retenue
- PostgreSQL à terme

## Développement initial

L'application peut débuter en local avec :

- données mockées ;
- stockage local ;
- fichiers JSON ;
- services abstraits préparés pour PostgreSQL.

Le code doit être conçu pour remplacer facilement la couche de persistence.

---

# Structure de projet recommandée

```txt
/src
  /app
    /(auth)
    /(dashboard)
    /api
  /components
    /ui
    /layout
    /dashboard
    /transactions
    /analytics
    /goals
    /categories
    /import-export
  /features
    /auth
    /transactions
    /categories
    /budgets
    /analytics
    /goals
    /shared-budget
    /settings
  /lib
    /utils
    /formatters
    /validators
    /constants
  /services
    transaction-service.ts
    budget-service.ts
    analytics-service.ts
    goal-service.ts
    category-service.ts
    import-service.ts
  /data
    mock-data.ts
    local-store.ts
  /types
    index.ts
  /hooks
  /styles
```

---

# Principes d'architecture

## Séparation des responsabilités

- Les composants UI ne doivent pas contenir de logique métier complexe.
- Les calculs financiers doivent être centralisés dans des services.
- Les types doivent être partagés et explicites.
- Les fonctions de persistence doivent être abstraites.

## Extensibilité

Le système doit pouvoir évoluer vers :

- PostgreSQL ;
- connexion bancaire ;
- IA ;
- permissions avancées ;
- application mobile future.

---

# Couche UI

## Responsabilités

- Afficher les pages.
- Présenter les composants.
- Gérer les interactions utilisateur.
- Appeler les hooks ou services.
- Respecter le design system.

## Contraintes

- TypeScript strict.
- Composants modulaires.
- Réutilisation maximale.
- Dark mode supporté.

---

# Couche services

## Responsabilités

- Calculs financiers.
- Agrégations.
- Filtres.
- Tri.
- Simulation des données.
- Préparation future pour backend.

## Exemples

- calculateMonthlyBalance()
- calculateExpenseByCategory()
- calculateSavingsRate()
- getFinancialHealthStatus()
- filterTransactions()
- importTransactionsFromTemplate()

---

# Couche persistence

## Phase initiale

Utiliser une abstraction locale.

Exemple :

```ts
interface TransactionRepository {
  findAll(): Promise<Transaction[]>;
  create(input: CreateTransactionInput): Promise<Transaction>;
  update(id: string, input: UpdateTransactionInput): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
```

## Phase PostgreSQL

Remplacer l'implémentation locale par une implémentation connectée à PostgreSQL.

---

# API cible

## Endpoints éventuels

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/categories
POST   /api/categories
GET    /api/goals
POST   /api/goals
GET    /api/analytics/summary
POST   /api/import
GET    /api/export
POST   /api/budgets/:id/invitations
```

---

# Gestion du thème

Le thème doit supporter :

- light ;
- dark ;
- system optionnel.

La préférence doit être persistée localement puis éventuellement dans le profil utilisateur.

---

# Gestion des devises

Chaque montant doit être stocké avec une devise.

## Important

Ne pas additionner automatiquement des montants de devises différentes sans conversion explicite.

Pour le MVP, lorsque plusieurs devises existent :

- afficher les totaux par devise ;
- ou utiliser la devise par défaut seulement pour les agrégations principales ;
- signaler clairement les limites de conversion.

---

# Qualité attendue du code

Codex doit générer :

- code TypeScript propre ;
- composants réutilisables ;
- fonctions pures pour les calculs ;
- validations explicites ;
- structure claire ;
- noms de fichiers cohérents ;
- pas de logique métier dispersée dans les composants.
