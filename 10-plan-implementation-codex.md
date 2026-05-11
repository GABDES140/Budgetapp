# 10 - Plan d'Implémentation Codex

## Objectif

Fournir à Codex un plan d'exécution détaillé pour développer BudgetApp par étapes cohérentes.

Codex doit suivre ce plan dans l'ordre afin d'éviter les dépendances manquantes, les duplications et les décisions incohérentes.

---

# Règles générales pour Codex

Avant de coder, Codex doit :

1. Lire tous les fichiers `.md` du dossier de documentation.
2. Respecter la vision produit.
3. Respecter la portée MVP.
4. Utiliser TypeScript.
5. Maintenir une architecture modulaire.
6. Éviter de mélanger logique métier et composants UI.
7. Préparer la persistence pour une future migration PostgreSQL.
8. Implémenter le dark mode dès le départ.
9. Produire une interface visuelle, claire et premium.

---

# Phase 1 - Initialisation du projet

## Objectif

Créer la base technique de l'application.

## Tâches

- Initialiser un projet Next.js avec TypeScript.
- Configurer Tailwind CSS.
- Installer shadcn/ui.
- Installer Recharts.
- Installer Framer Motion.
- Configurer la structure de dossiers.
- Configurer le dark mode.
- Créer les types de base.

## Résultat attendu

Un projet fonctionnel avec layout de base, thème et architecture initiale.

---

# Phase 2 - Layout principal

## Objectif

Créer l'ossature SaaS de l'application.

## Tâches

- Créer AppLayout.
- Créer Sidebar.
- Créer Header contextuel.
- Créer navigation active.
- Créer pages vides principales.
- Ajouter support responsive.

## Pages

- Dashboard
- Transactions
- Analytics
- Objectifs
- Catégories
- Import / Export
- Budget partagé
- Paramètres

---

# Phase 3 - Données et types

## Objectif

Créer le modèle de données local.

## Tâches

- Créer les interfaces TypeScript.
- Créer données mockées.
- Créer repositories locaux.
- Créer services de lecture/écriture.
- Préparer abstraction future PostgreSQL.

## Types prioritaires

- User
- Budget
- Transaction
- Category
- Subcategory
- Goal
- RecurringRule
- DashboardWidgetPreference

---

# Phase 4 - Authentification MVP

## Objectif

Implémenter un flux d'authentification simple.

## Tâches

- Page login.
- Page register.
- Gestion session locale ou mock auth.
- Protection des routes.
- Déconnexion.
- Préparer remplacement futur par backend réel.

---

# Phase 5 - Transactions

## Objectif

Implémenter la gestion complète des transactions.

## Tâches

- Liste des transactions.
- Formulaire création rapide.
- Champs avancés optionnels.
- Modification.
- Suppression.
- Recherche.
- Filtres.
- Tri.
- Support multi-devise.

---

# Phase 6 - Catégories

## Objectif

Implémenter les catégories et sous-catégories.

## Tâches

- Catégories par défaut.
- Liste des catégories.
- Création personnalisée.
- Modification.
- Suppression.
- Couleur/icône.
- Sous-catégories.

---

# Phase 7 - Budget global

## Objectif

Implémenter le budget mensuel global.

## Tâches

- Configuration du budget mensuel.
- Calcul du budget utilisé.
- Calcul du budget restant.
- Indicateur de dépassement.
- Affichage sur dashboard.

---

# Phase 8 - Dashboard

## Objectif

Créer le cockpit financier principal.

## Tâches

- Cartes KPI.
- Revenus totaux.
- Dépenses totales.
- Solde mensuel.
- Budget restant.
- Graphiques principaux.
- Transactions récentes.
- Objectifs.
- Santé financière.
- Widgets activables/désactivables.
- Widgets déplaçables.

---

# Phase 9 - Analytics

## Objectif

Créer les analyses financières avancées.

## Tâches

- Revenus vs dépenses.
- Dépenses par catégorie.
- Tendances mensuelles.
- Comparaison mois/mois.
- Comparaison année/mois.
- Filtres analytiques.
- Graphiques interactifs.

---

# Phase 10 - Santé financière

## Objectif

Créer un module de statut financier configurable.

## Tâches

- Calcul des indicateurs.
- Statut global.
- Configuration des indicateurs visibles.
- Cartes et graphiques dédiés.

---

# Phase 11 - Objectifs financiers

## Objectif

Créer la gestion d'objectifs personnalisés.

## Tâches

- Liste des objectifs.
- Création.
- Modification.
- Suppression.
- Progression.
- Affichage dashboard.

---

# Phase 12 - Import / Export

## Objectif

Implémenter la gestion de fichiers.

## Tâches

- Template CSV/Excel.
- Upload fichier.
- Validation colonnes.
- Prévisualisation.
- Confirmation import.
- Export CSV.
- Export Excel si possible.

---

# Phase 13 - Budget partagé

## Objectif

Implémenter le partage simple.

## Tâches

- Page budget partagé.
- Invitation par courriel simulée ou préparée.
- Gestion des membres.
- Accès commun aux données.
- Modèle extensible vers permissions avancées.

---

# Phase 14 - Polissage UX

## Objectif

Raffiner l'expérience visuelle.

## Tâches

- Empty states.
- Loading states.
- Error states.
- Animations Framer Motion.
- Responsive.
- Accessibilité.
- Cohérence dark/light mode.
- Micro-interactions.

---

# Phase 15 - Tests et stabilisation

## Objectif

Valider le MVP.

## Tâches

- Tester calculs financiers.
- Tester formulaires.
- Tester import.
- Tester filtres.
- Tester widgets.
- Tester dark mode.
- Tester navigation.
- Tester états vides.

---

# Prompt maître recommandé pour Codex

Utilise les fichiers de documentation du dossier `/docs` comme source de vérité. Développe BudgetApp en suivant strictement le plan d'implémentation. Priorise une architecture propre, modulaire, TypeScript, avec une UI Next.js / React / Tailwind / shadcn/ui / Recharts / Framer Motion. L'application doit fonctionner localement au départ avec une couche de données abstraite, mais être prête pour une future migration vers Node.js et PostgreSQL. Respecte le dark mode, la navigation SaaS avec sidebar gauche, la personnalisation du dashboard et les règles métier définies.
