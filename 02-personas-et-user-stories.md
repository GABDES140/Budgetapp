# 02 - Personas et User Stories

## Objectif du document

Ce document définit les principaux profils utilisateurs de BudgetApp ainsi que les user stories qui guideront la conception produit, l'UX et le développement.

---

# Personas

## Persona 1 - Jeune professionnel

### Profil

- 24 à 35 ans.
- Revenu stable.
- Vie financière en structuration.
- Habitué aux outils numériques.
- Recherche une solution simple, moderne et visuelle.

### Objectifs

- Comprendre où va son argent.
- Suivre ses revenus et dépenses.
- Mieux contrôler ses finances.
- Atteindre des objectifs personnels.
- Éviter la surcharge administrative.

### Frustrations

- Applications trop rigides.
- Interfaces surchargées.
- Manque de visualisation claire.
- Peu de personnalisation.
- Difficulté à maintenir une discipline budgétaire.

### Besoins

- Saisie rapide.
- Dashboard clair.
- Catégories personnalisables.
- Indicateurs financiers simples à comprendre.
- Expérience premium et fluide.

---

## Persona 2 - Couple ou ménage

### Profil

- Deux personnes ou plus qui partagent certaines finances.
- Besoin d'une vision commune.
- Gestion d'un budget partagé simple.

### Objectifs

- Suivre les dépenses communes.
- Partager la visibilité financière.
- Comprendre le budget du ménage.
- Suivre des objectifs communs.

### Frustrations

- Difficulté à centraliser les dépenses.
- Manque de transparence.
- Outils peu adaptés au partage simple.

### Besoins

- Budget partagé.
- Invitation simple.
- Dashboard commun.
- Transactions accessibles aux participants.

---

## Persona 3 - Utilisateur analytique

### Profil

- Aime les données.
- Veut comprendre ses tendances financières.
- Recherche des indicateurs configurables.

### Objectifs

- Analyser mois/mois.
- Comparer les périodes.
- Identifier les catégories dominantes.
- Suivre des ratios financiers.
- Exporter les données.

### Frustrations

- Applications trop simplistes.
- Graphiques limités.
- Indicateurs non configurables.

### Besoins

- Analytics avancées.
- Filtres personnalisés.
- Graphiques interactifs.
- Export CSV/Excel.

---

# User Stories

## Authentification

### US-001 - Création de compte

En tant qu'utilisateur, je veux créer un compte afin de sauvegarder mes données financières.

### US-002 - Connexion

En tant qu'utilisateur, je veux me connecter afin d'accéder à mon espace financier personnalisé.

### US-003 - Déconnexion

En tant qu'utilisateur, je veux me déconnecter afin de protéger l'accès à mes données.

---

## Transactions

### US-004 - Ajouter une dépense rapidement

En tant qu'utilisateur, je veux ajouter rapidement une dépense afin de garder mon budget à jour sans friction.

### US-005 - Ajouter un revenu

En tant qu'utilisateur, je veux ajouter un revenu afin de suivre ma situation financière mensuelle.

### US-006 - Ajouter des détails optionnels

En tant qu'utilisateur, je veux pouvoir ajouter une description, une note, une devise et une catégorie afin de documenter mes transactions au besoin.

### US-007 - Modifier une transaction

En tant qu'utilisateur, je veux modifier une transaction afin de corriger une erreur.

### US-008 - Supprimer une transaction

En tant qu'utilisateur, je veux supprimer une transaction afin de retirer une donnée incorrecte.

### US-009 - Rechercher une transaction

En tant qu'utilisateur, je veux rechercher une transaction afin de retrouver rapidement une information financière.

---

## Catégories

### US-010 - Catégories par défaut

En tant qu'utilisateur, je veux disposer de catégories par défaut afin de commencer rapidement.

### US-011 - Catégories personnalisées

En tant qu'utilisateur, je veux créer mes propres catégories afin d'adapter l'application à ma réalité.

### US-012 - Sous-catégories

En tant qu'utilisateur, je veux créer des sous-catégories afin d'analyser mes dépenses avec plus de précision.

---

## Transactions récurrentes

### US-013 - Créer une transaction récurrente

En tant qu'utilisateur, je veux créer une transaction récurrente afin d'éviter de saisir manuellement mes revenus ou dépenses répétitives.

### US-014 - Gérer les récurrences

En tant qu'utilisateur, je veux modifier ou désactiver une transaction récurrente afin de garder mes données exactes.

---

## Dashboard

### US-015 - Voir ma situation financière globale

En tant qu'utilisateur, je veux voir un dashboard clair afin de comprendre rapidement ma situation financière.

### US-016 - Voir mes revenus et dépenses

En tant qu'utilisateur, je veux voir mes revenus et dépenses afin de comprendre mon solde mensuel.

### US-017 - Voir mes catégories principales

En tant qu'utilisateur, je veux voir mes principales catégories de dépenses afin d'identifier mes postes de coûts dominants.

### US-018 - Personnaliser mon dashboard

En tant qu'utilisateur, je veux activer, désactiver et déplacer des widgets afin d'adapter le dashboard à mes priorités.

---

## Santé financière

### US-019 - Voir un statut financier

En tant qu'utilisateur, je veux voir un statut de santé financière afin de comprendre rapidement si ma situation est saine, à surveiller ou critique.

### US-020 - Configurer les indicateurs

En tant qu'utilisateur, je veux choisir les indicateurs affichés afin d'obtenir une lecture adaptée à mes besoins.

---

## Objectifs financiers

### US-021 - Créer un objectif

En tant qu'utilisateur, je veux créer un objectif financier personnalisé afin de suivre une cible personnelle.

### US-022 - Suivre la progression

En tant qu'utilisateur, je veux visualiser ma progression afin de rester motivé.

---

## Analytics

### US-023 - Comparer les mois

En tant qu'utilisateur, je veux comparer mes finances d'un mois à l'autre afin d'identifier mes tendances.

### US-024 - Comparer les années

En tant qu'utilisateur, je veux comparer mes données par année et par mois afin d'obtenir une vision long terme.

### US-025 - Filtrer les données

En tant qu'utilisateur, je veux filtrer mes transactions par période, catégorie, type et devise afin d'analyser mes finances précisément.

---

## Import / Export

### US-026 - Importer un fichier

En tant qu'utilisateur, je veux importer un fichier CSV ou Excel afin d'ajouter rapidement plusieurs transactions.

### US-027 - Utiliser un template

En tant qu'utilisateur, je veux utiliser un template standard afin d'importer mes données sans confusion.

### US-028 - Exporter mes données

En tant qu'utilisateur, je veux exporter mes données afin de garder une copie ou les analyser ailleurs.

---

## Budget partagé

### US-029 - Inviter un utilisateur

En tant qu'utilisateur, je veux inviter une autre personne afin de gérer un budget partagé.

### US-030 - Consulter un budget partagé

En tant qu'utilisateur invité, je veux consulter le budget partagé afin de suivre les finances communes.

---

## Interface

### US-031 - Utiliser le dark mode

En tant qu'utilisateur, je veux utiliser un mode sombre afin d'améliorer le confort visuel.

### US-032 - Naviguer simplement

En tant qu'utilisateur, je veux naviguer avec une sidebar claire afin d'accéder rapidement aux sections principales.
