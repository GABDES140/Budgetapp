# 01 - Portée MVP

## Objectif du MVP

Le MVP de BudgetApp doit permettre à un utilisateur ou à un ménage de gérer un budget personnel ou partagé dans une application web moderne, visuelle et configurable.

Le MVP doit offrir suffisamment de fonctionnalités pour être réellement utile, tout en gardant une expérience utilisateur raffinée, claire et maîtrisée.

BudgetApp ne doit pas être un prototype minimaliste sans valeur d'usage. La V1 doit être un produit crédible, fonctionnellement riche, mais visuellement épuré.

---

## Principes directeurs du MVP

Le MVP doit respecter les principes suivants :

- interface web moderne ;
- navigation par sidebar gauche de type SaaS ;
- dark mode disponible dès V1 ;
- simplicité visuelle ;
- hiérarchie claire ;
- forte visualisation des données ;
- personnalisation avancée ;
- saisie rapide des données ;
- analytique configurable ;
- architecture extensible ;
- expérience utilisateur fluide et premium.

---

## Stack recommandée pour le MVP

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Framer Motion

### Backend cible

- Node.js
- API REST ou architecture server actions selon l'implémentation choisie
- PostgreSQL à terme

### Stockage initial

Pour accélérer le développement initial, l'application peut fonctionner avec :

- données mockées ;
- stockage local ;
- fichiers JSON locaux ;
- ou une abstraction de persistence préparée pour PostgreSQL.

Le code doit cependant être structuré pour permettre une migration vers PostgreSQL sans réécriture majeure.

---

## Fonctionnalités incluses dans le MVP

## 1. Authentification

### Inclus

- Création de compte.
- Connexion.
- Déconnexion.
- Gestion de session.
- Récupération de mot de passe.

### Niveau de sécurité attendu

Pour le MVP, une sécurité standard web moderne est suffisante. Il n'est pas nécessaire d'implémenter dès V1 :

- double authentification ;
- chiffrement avancé applicatif ;
- logs d'activité détaillés ;
- audit trail complet.

---

## 2. Gestion des transactions

### Inclus

- Ajout de revenus.
- Ajout de dépenses.
- Modification de transactions.
- Suppression de transactions.
- Saisie rapide.
- Saisie détaillée optionnelle.
- Notes.
- Dates.
- Devise.
- Catégorie.
- Sous-catégorie.
- Type de transaction : revenu ou dépense.

### Exclusions

- Synchronisation bancaire.
- Détection automatique des transactions bancaires.
- Import automatique depuis institutions financières.

---

## 3. Transactions récurrentes

### Inclus

- Création de transactions récurrentes.
- Revenus récurrents.
- Dépenses récurrentes.
- Fréquences simples : mensuelle, hebdomadaire, annuelle.
- Visualisation des transactions récurrentes.

### Exclusions

- Logique complexe de récurrence personnalisée.
- Synchronisation bancaire automatique.

---

## 4. Catégories et sous-catégories

### Inclus

- Catégories par défaut.
- Sous-catégories au besoin.
- Création de catégories personnalisées.
- Modification de catégories personnalisées.
- Suppression de catégories personnalisées.
- Association d'une couleur ou d'une icône à une catégorie.

---

## 5. Budget mensuel global

### Inclus

- Définition d'un budget mensuel global.
- Calcul automatique des dépenses mensuelles.
- Calcul du budget restant.
- Affichage des écarts budgétaires.
- Suivi visuel de progression.

### Exclusions

- Budgets détaillés par catégorie comme exigence obligatoire V1.
- Budgets complexes multi-périodes.

---

## 6. Objectifs financiers personnalisés

### Inclus

- Création d'objectifs personnalisés.
- Montant cible.
- Montant actuel.
- Date cible optionnelle.
- Progression visuelle.
- Statut de progression.

### Exemples

- Fonds d'urgence.
- Voyage.
- Achat majeur.
- Remboursement personnel.
- Objectif libre.

---

## 7. Dashboard principal

Le dashboard doit être visuel, configurable et organisé en widgets.

### Informations à afficher

- Solde du mois.
- Revenus totaux.
- Dépenses totales.
- Budget restant.
- Graphique dépenses vs revenus.
- Catégories principales.
- Objectifs financiers.
- Tendances mensuelles.
- Transactions récentes.
- Santé financière globale.

### Personnalisation

- Widgets activables.
- Widgets désactivables.
- Widgets déplaçables.
- Sauvegarde de la configuration utilisateur.

---

## 8. Pages spécialisées

Le MVP doit être structuré en plusieurs pages plutôt qu'en un seul dashboard massif.

### Pages requises

- Dashboard.
- Transactions.
- Analytics.
- Objectifs.
- Catégories.
- Import / Export.
- Budget partagé.
- Paramètres.

---

## 9. Analytique financière

### Inclus

- Comparaison mois/mois.
- Comparaison année/mois.
- Tendances mensuelles.
- Dépenses par catégorie.
- Revenus vs dépenses.
- Indicateurs financiers configurables.
- Graphiques interactifs.

### Graphiques attendus

- Pie chart.
- Bar chart.
- Line chart.
- Cartes KPI.

---

## 10. Santé financière configurable

### Inclus

- Statut global de santé financière.
- Indicateurs configurables.
- Affichage visuel synthétique.

### Exemples d'indicateurs

- Taux d'épargne.
- Ratio dépenses / revenus.
- Évolution mensuelle.
- Progression budgétaire.
- Solde net mensuel.

---

## 11. Recherche et filtres

### Inclus

- Recherche de transactions.
- Filtre par type.
- Filtre par catégorie.
- Filtre par sous-catégorie.
- Filtre par période.
- Filtre par devise.

---

## 12. Import CSV / Excel

### Inclus

- Import CSV.
- Import Excel.
- Template standardisé.
- Validation de base des colonnes.
- Prévisualisation avant import.

### Exclusions

- Mapping intelligent complexe.
- Catégorisation IA.
- Nettoyage automatique avancé.

---

## 13. Export de données

### Inclus

- Export CSV.
- Export Excel si simple à implémenter.

### Exclusions

- Rapports PDF avancés.
- Exports fiscaux spécialisés.

---

## 14. Budget partagé simple

### Inclus

- Création d'un budget partagé.
- Invitation d'un utilisateur par courriel.
- Accès commun aux données du budget.
- Visualisation commune des transactions et indicateurs.

### Exclusions

- Rôles complexes.
- Permissions granulaires.
- Séparation avancée dépenses personnelles / communes.

---

## Fonctionnalités explicitement hors MVP

Les fonctionnalités suivantes ne doivent pas être développées dans la V1 :

- Connexion bancaire.
- IA.
- Recommandations automatisées.
- Prévisions financières complexes.
- Détection d'anomalies.
- Coaching financier.
- Application mobile native.
- Multi-comptes financiers.
- Gestion des investissements.
- Gestion du patrimoine net.
- Double authentification.
- Permissions complexes.
- Rapports PDF avancés.
- Automatisations financières avancées.

---

## Critères de succès du MVP

Le MVP est réussi si l'utilisateur peut :

- créer un compte ;
- ajouter ses revenus et dépenses ;
- catégoriser ses transactions ;
- visualiser ses finances sur plusieurs pages ;
- personnaliser son dashboard ;
- suivre ses objectifs ;
- importer et exporter ses données ;
- utiliser le dark mode ;
- partager un budget simplement ;
- comprendre sa situation financière en moins de 60 secondes.
