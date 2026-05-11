# 03 - Fonctionnalités

## Objectif

Décrire de façon structurée les modules fonctionnels de BudgetApp afin que Codex puisse développer l'application par domaines cohérents.

---

# Modules fonctionnels

## 1. Authentification

### Fonctionnalités

- Inscription.
- Connexion.
- Déconnexion.
- Récupération de mot de passe.
- Session utilisateur persistante.

### Comportements attendus

- Un utilisateur non connecté est redirigé vers la page de connexion.
- Un utilisateur connecté accède à son espace privé.
- Les données affichées doivent être associées à l'utilisateur actif.

---

## 2. Transactions

### Fonctionnalités

- Créer une transaction.
- Modifier une transaction.
- Supprimer une transaction.
- Rechercher une transaction.
- Filtrer les transactions.
- Trier les transactions.

### Champs d'une transaction

- id
- type : income ou expense
- amount
- currency
- date
- description
- categoryId
- subcategoryId optionnel
- notes optionnelles
- isRecurring
- recurringRuleId optionnel
- createdAt
- updatedAt

### UX attendue

- Formulaire rapide par défaut.
- Champs avancés accessibles sans surcharger l'écran.
- Validation claire des erreurs.
- Feedback visuel après création, modification ou suppression.

---

## 3. Catégories et sous-catégories

### Fonctionnalités

- Liste de catégories par défaut.
- Création de catégorie personnalisée.
- Modification.
- Suppression.
- Association couleur/icône.
- Création de sous-catégories.

### Catégories par défaut suggérées

- Logement
- Transport
- Alimentation
- Restaurants
- Divertissement
- Santé
- Épargne
- Revenus
- Abonnements
- Autres

---

## 4. Budget mensuel global

### Fonctionnalités

- Définir un montant de budget mensuel global.
- Calculer les dépenses du mois.
- Calculer le budget restant.
- Afficher la progression.
- Identifier un dépassement.

### Formules

- Budget restant = budget mensuel global - dépenses mensuelles totales.
- Pourcentage utilisé = dépenses mensuelles totales / budget mensuel global * 100.

---

## 5. Transactions récurrentes

### Fonctionnalités

- Créer une transaction récurrente.
- Modifier une règle de récurrence.
- Désactiver une récurrence.
- Générer ou simuler les occurrences.

### Fréquences MVP

- Hebdomadaire.
- Mensuelle.
- Annuelle.

---

## 6. Dashboard

### Fonctionnalités

- Afficher des widgets financiers.
- Activer/désactiver les widgets.
- Déplacer les widgets.
- Sauvegarder la configuration.

### Widgets MVP

- Solde du mois.
- Revenus totaux.
- Dépenses totales.
- Budget restant.
- Dépenses vs revenus.
- Dépenses par catégorie.
- Tendances mensuelles.
- Transactions récentes.
- Objectifs.
- Santé financière.

---

## 7. Analytics

### Fonctionnalités

- Graphique revenus vs dépenses.
- Dépenses par catégorie.
- Tendance mensuelle.
- Comparaison mois/mois.
- Comparaison année/mois.
- Filtres analytiques.

### Types de graphiques

- Line chart.
- Bar chart.
- Pie chart.
- KPI cards.

---

## 8. Santé financière

### Fonctionnalités

- Afficher un statut global.
- Afficher des indicateurs configurables.
- Permettre à l'utilisateur de choisir les indicateurs visibles.

### Statuts suggérés

- Excellent.
- Stable.
- À surveiller.
- Critique.

### Indicateurs MVP

- Solde net mensuel.
- Taux d'épargne.
- Ratio dépenses/revenus.
- Budget utilisé.
- Variation mensuelle des dépenses.

---

## 9. Objectifs financiers

### Fonctionnalités

- Créer un objectif personnalisé.
- Modifier un objectif.
- Supprimer un objectif.
- Mettre à jour le montant actuel.
- Afficher la progression.

### Champs

- id
- name
- targetAmount
- currentAmount
- currency
- targetDate optionnelle
- description optionnelle
- status

---

## 10. Import CSV / Excel

### Fonctionnalités

- Télécharger un template.
- Importer un fichier.
- Valider les colonnes.
- Prévisualiser les lignes.
- Confirmer l'import.

### Colonnes template

- date
- type
- amount
- currency
- category
- subcategory
- description
- notes

---

## 11. Export

### Fonctionnalités

- Exporter les transactions en CSV.
- Exporter les transactions en Excel si la librairie choisie le permet.
- Respecter les filtres actifs lors de l'export si applicable.

---

## 12. Budget partagé

### Fonctionnalités

- Créer un budget partagé.
- Inviter par courriel.
- Accepter une invitation.
- Voir les membres du budget.
- Partager transactions, dashboard, objectifs et analytics.

### Règles simples

- Tous les membres ont les mêmes droits dans le MVP.
- Pas de permissions granulaires en V1.

---

## 13. Paramètres

### Fonctionnalités

- Modifier le profil utilisateur.
- Choisir le thème : light ou dark.
- Gérer les préférences de devise.
- Gérer les widgets du dashboard.
- Accéder aux options d'import/export.
