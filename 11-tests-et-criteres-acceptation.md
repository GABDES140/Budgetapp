# 11 - Tests et Critères d'Acceptation

## Objectif

Définir les critères de qualité permettant de valider que BudgetApp fonctionne conformément à la vision produit et à la portée MVP.

---

# Critères globaux

L'application doit :

- fonctionner localement ;
- offrir une navigation fluide ;
- supporter le dark mode ;
- afficher des données financières cohérentes ;
- permettre la gestion complète des transactions ;
- permettre la personnalisation du dashboard ;
- rester visuellement claire ;
- éviter la surcharge cognitive.

---

# Authentification

## Critères d'acceptation

- Un utilisateur peut créer un compte.
- Un utilisateur peut se connecter.
- Un utilisateur peut se déconnecter.
- Les pages privées ne sont pas accessibles sans connexion.
- La session est gérée de manière cohérente.

---

# Transactions

## Critères d'acceptation

- L'utilisateur peut créer un revenu.
- L'utilisateur peut créer une dépense.
- L'utilisateur peut modifier une transaction.
- L'utilisateur peut supprimer une transaction.
- Les montants invalides sont rejetés.
- Les transactions apparaissent dans la liste.
- Les transactions alimentent les calculs du dashboard.
- Les devises sont affichées correctement.

---

# Catégories

## Critères d'acceptation

- Les catégories par défaut sont disponibles.
- L'utilisateur peut créer une catégorie personnalisée.
- L'utilisateur peut créer une sous-catégorie.
- Une transaction peut être liée à une catégorie.
- Les graphiques par catégorie utilisent les bonnes données.

---

# Budget mensuel

## Critères d'acceptation

- L'utilisateur peut définir un budget mensuel global.
- Le budget restant est calculé correctement.
- Le dépassement de budget est détecté.
- Le pourcentage utilisé est affiché correctement.

---

# Dashboard

## Critères d'acceptation

- Les KPI principaux s'affichent.
- Les revenus totaux sont exacts.
- Les dépenses totales sont exactes.
- Le solde mensuel est exact.
- Les graphiques s'affichent correctement.
- Les transactions récentes sont visibles.
- Les widgets peuvent être activés/désactivés.
- Les widgets peuvent être déplacés.
- La configuration est sauvegardée.

---

# Analytics

## Critères d'acceptation

- L'utilisateur peut voir les tendances mensuelles.
- L'utilisateur peut comparer mois/mois.
- L'utilisateur peut comparer année/mois.
- L'utilisateur peut filtrer par période.
- L'utilisateur peut filtrer par catégorie.
- Les graphiques reflètent les filtres actifs.

---

# Santé financière

## Critères d'acceptation

- Un statut global est affiché.
- Les indicateurs configurés sont visibles.
- Les indicateurs sont calculés correctement.
- L'utilisateur peut choisir les indicateurs visibles.

---

# Objectifs

## Critères d'acceptation

- L'utilisateur peut créer un objectif.
- L'utilisateur peut modifier un objectif.
- L'utilisateur peut supprimer un objectif.
- La progression est calculée correctement.
- Un objectif complété est identifié.

---

# Import

## Critères d'acceptation

- L'utilisateur peut télécharger ou consulter le template.
- L'utilisateur peut importer un CSV ou Excel.
- Les colonnes requises sont validées.
- Les erreurs sont affichées avant import.
- L'utilisateur peut prévisualiser les transactions.
- Les transactions valides sont ajoutées après confirmation.

---

# Export

## Critères d'acceptation

- L'utilisateur peut exporter ses transactions.
- Le fichier exporté contient les bons champs.
- Les filtres actifs peuvent être respectés si implémenté.

---

# Budget partagé

## Critères d'acceptation

- L'utilisateur peut créer une invitation.
- Une invitation est liée à un budget.
- Un membre invité peut accéder au budget partagé.
- Les données partagées sont visibles par les membres.

---

# UI / UX

## Critères d'acceptation

- L'interface est cohérente entre les pages.
- La sidebar indique la page active.
- Le dark mode fonctionne sur toutes les pages.
- Les empty states sont présents.
- Les loading states sont présents lorsque nécessaire.
- Les erreurs sont lisibles et utiles.
- Les formulaires sont simples et compréhensibles.
- L'application reste visuellement propre sur desktop et mobile web.

---

# Tests recommandés

## Tests unitaires

- Calcul du solde mensuel.
- Calcul du budget restant.
- Calcul du taux d'épargne.
- Calcul de progression d'objectif.
- Filtrage des transactions.
- Validation de l'import.

## Tests composants

- Formulaire de transaction.
- Carte KPI.
- Graphiques.
- Sidebar.
- Widget dashboard.

## Tests manuels prioritaires

- Créer un compte.
- Ajouter des transactions.
- Modifier les catégories.
- Configurer le dashboard.
- Passer en dark mode.
- Importer un fichier.
- Exporter les données.
