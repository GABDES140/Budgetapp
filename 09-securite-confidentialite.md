# 09 - Sécurité et Confidentialité

## Objectif

Définir les exigences minimales de sécurité et de confidentialité pour BudgetApp.

Le MVP ne nécessite pas une sécurité avancée, mais il doit respecter des pratiques web modernes de base, car les données financières sont sensibles.

---

# Niveau de sécurité MVP

Le MVP doit inclure une sécurité standard, sans implémenter de mécanismes avancés au départ.

## Inclus

- Authentification utilisateur.
- Sessions sécurisées.
- Validation des entrées.
- Protection des routes privées.
- Séparation des données par utilisateur et par budget.
- Gestion simple des accès au budget partagé.

## Non requis en V1

- Double authentification.
- Chiffrement applicatif avancé.
- Journalisation complète des activités.
- Audit trail.
- Permissions granulaires.
- Conformité réglementaire avancée.

---

# Confidentialité

## Principes

- Les données financières doivent appartenir à l'utilisateur ou au budget partagé.
- Un utilisateur ne doit jamais voir les données d'un autre budget sans invitation.
- Les invitations doivent être contrôlées par un token ou un mécanisme équivalent.
- Les données mockées ne doivent pas contenir d'informations réelles.

---

# Données sensibles

Les données suivantes doivent être considérées sensibles :

- revenus ;
- dépenses ;
- objectifs financiers ;
- catégories personnalisées ;
- courriels ;
- préférences utilisateur ;
- informations de budget partagé.

---

# Authentification

## Exigences

- Les mots de passe ne doivent jamais être stockés en clair.
- En mode production, utiliser un hash sécurisé.
- Les routes privées doivent vérifier l'état de connexion.
- L'utilisateur doit pouvoir se déconnecter.

---

# Validation des données

Toutes les entrées utilisateur doivent être validées :

- montants ;
- dates ;
- devises ;
- courriels ;
- fichiers importés ;
- catégories ;
- objectifs.

Utiliser une librairie de validation comme Zod si possible.

---

# Import de fichiers

## Risques à gérer

- Colonnes invalides.
- Montants invalides.
- Dates invalides.
- Fichiers trop volumineux.
- Données incohérentes.

## Règles

- Prévisualiser avant import.
- Valider avant sauvegarde.
- Afficher les erreurs clairement.

---

# Budget partagé

## Règles de confidentialité

- Une invitation donne accès aux données du budget concerné seulement.
- Les membres ne doivent pas accéder aux budgets non partagés.
- Les rôles owner/member doivent être stockés même si les permissions sont simples en V1.

---

# Préparation future

L'architecture doit permettre d'ajouter plus tard :

- double authentification ;
- permissions avancées ;
- logs d'activité ;
- chiffrement renforcé ;
- audit de sécurité ;
- conformité plus stricte si le produit devient commercial.
