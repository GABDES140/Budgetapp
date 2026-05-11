# 08 - Règles Métier

## Objectif

Définir les règles fonctionnelles et financières que BudgetApp doit appliquer de manière cohérente.

---

# Transactions

## Règles générales

- Une transaction doit avoir un montant positif.
- Une transaction doit être de type revenu ou dépense.
- Une transaction doit avoir une devise.
- Une transaction doit avoir une date.
- Une transaction doit être associée à un budget.
- Une dépense devrait être associée à une catégorie.
- Une sous-catégorie est optionnelle.

## Revenus

- Les revenus augmentent le solde mensuel.
- Les revenus peuvent être récurrents.

## Dépenses

- Les dépenses diminuent le solde mensuel.
- Les dépenses sont utilisées pour calculer le budget restant.
- Les dépenses peuvent être récurrentes.

---

# Budget mensuel

## Calculs

- Total revenus mensuels = somme des revenus du mois.
- Total dépenses mensuelles = somme des dépenses du mois.
- Solde mensuel = total revenus - total dépenses.
- Budget restant = budget mensuel global - total dépenses.
- Pourcentage du budget utilisé = total dépenses / budget mensuel global * 100.

## Dépassement

Si total dépenses > budget mensuel global, le budget est dépassé.

---

# Santé financière

## Statut global

Le statut financier peut être calculé à partir d'indicateurs configurables.

## Statuts suggérés

- Excellent
- Stable
- À surveiller
- Critique

## Indicateurs possibles

- Solde mensuel.
- Taux d'épargne.
- Ratio dépenses/revenus.
- Budget utilisé.
- Variation des dépenses.

## Exemple de logique simple

- Excellent : solde positif, budget respecté, taux d'épargne élevé.
- Stable : solde positif et budget presque respecté.
- À surveiller : solde faible ou budget presque dépassé.
- Critique : solde négatif ou budget dépassé.

Cette logique doit rester configurable à terme.

---

# Objectifs financiers

## Calculs

- Progression = currentAmount / targetAmount * 100.
- Un objectif est complété lorsque currentAmount >= targetAmount.

## Règles

- Le montant cible doit être positif.
- Le montant actuel ne doit pas être négatif.
- La devise est obligatoire.
- La date cible est optionnelle.

---

# Catégories

## Règles

- Une catégorie par défaut ne doit pas être supprimée globalement.
- Une catégorie personnalisée peut être supprimée si elle n'est pas utilisée ou si les transactions sont réassignées.
- Une sous-catégorie appartient toujours à une catégorie.

---

# Transactions récurrentes

## Règles

- Une transaction récurrente doit avoir une fréquence.
- Une transaction récurrente doit avoir une date de début.
- Une date de fin est optionnelle.
- Une transaction récurrente peut être désactivée.

## Fréquences MVP

- Hebdomadaire.
- Mensuelle.
- Annuelle.

---

# Multi-devise

## Règles

- Chaque montant doit inclure une devise.
- Les totaux multi-devises ne doivent pas être additionnés sans taux de conversion.
- Les graphiques peuvent être filtrés par devise.
- La devise par défaut de l'utilisateur doit être utilisée comme préférence d'affichage.

---

# Import

## Colonnes requises

- date
- type
- amount
- currency
- category

## Colonnes optionnelles

- subcategory
- description
- notes

## Validation

- Les lignes invalides doivent être signalées avant import.
- L'utilisateur doit pouvoir prévisualiser les données.
- L'import ne doit pas être confirmé automatiquement sans validation utilisateur.

---

# Budget partagé

## Règles MVP

- Le propriétaire peut inviter un autre utilisateur.
- Les membres voient les mêmes données du budget partagé.
- Les permissions sont simples et équivalentes en V1.
- Le système doit garder la notion de owner pour extensions futures.
