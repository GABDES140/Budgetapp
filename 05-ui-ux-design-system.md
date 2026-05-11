# 05 - UI UX Design System

## Objectif

Définir les principes visuels et interactifs de BudgetApp afin d'obtenir une interface cohérente, moderne, premium et simple à utiliser.

---

# Direction UX

BudgetApp doit s'inspirer d'une expérience Apple-like :

- simplicité visuelle ;
- hiérarchie claire ;
- interface calme ;
- transitions fluides ;
- composants sobres ;
- densité d'information maîtrisée ;
- esthétique premium sans surcharge.

L'interface doit être très visuelle, mais jamais confuse.

---

# Architecture d'interface

## Structure générale

L'application doit utiliser une structure SaaS classique :

- sidebar gauche fixe ;
- contenu principal à droite ;
- header contextuel ;
- cartes de contenu ;
- pages spécialisées.

## Pages principales

- Dashboard
- Transactions
- Analytics
- Objectifs
- Catégories
- Import / Export
- Budget partagé
- Paramètres

---

# Navigation

## Sidebar gauche

La sidebar doit contenir :

- logo BudgetApp ;
- liens de navigation ;
- état actif clair ;
- accès aux paramètres ;
- bouton déconnexion ou menu profil.

## Items suggérés

- Dashboard
- Transactions
- Analytics
- Objectifs
- Catégories
- Import / Export
- Partage
- Paramètres

---

# Thèmes

## Light mode

- Fond clair.
- Cartes légèrement contrastées.
- Texte foncé.
- Accent couleur sobre.

## Dark mode

- Fond sombre profond.
- Cartes légèrement plus claires que le fond.
- Texte clair.
- Contrastes accessibles.
- Graphiques lisibles en environnement sombre.

Le dark mode est obligatoire dès la V1.

---

# Composants UI recommandés

Utiliser shadcn/ui pour :

- Button
- Card
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Input
- Select
- Table
- Badge
- Progress
- Tooltip
- Switch
- Checkbox

Utiliser Tailwind CSS pour :

- layout ;
- spacing ;
- responsive ;
- couleurs ;
- états hover/focus ;
- dark mode.

Utiliser Framer Motion pour :

- transitions de pages ;
- apparition des cartes ;
- micro-interactions ;
- déplacement des widgets.

Utiliser Recharts pour :

- line charts ;
- bar charts ;
- pie charts ;
- tooltips interactifs.

---

# Principes de design

## Hiérarchie

Chaque page doit avoir :

- un titre clair ;
- un sous-texte contextuel ;
- des actions principales visibles ;
- des cartes bien séparées ;
- une densité contrôlée.

## Cartes KPI

Les cartes KPI doivent afficher :

- libellé ;
- valeur principale ;
- variation ou contexte ;
- icône facultative ;
- couleur sémantique avec modération.

## Graphiques

Les graphiques doivent être :

- lisibles ;
- interactifs ;
- accompagnés de titres ;
- cohérents entre pages ;
- jamais décoratifs sans valeur analytique.

## Formulaires

Les formulaires doivent être :

- courts par défaut ;
- avec champs avancés optionnels ;
- validés clairement ;
- accompagnés de messages d'erreur utiles.

---

# États d'interface

Chaque module doit gérer :

- loading state ;
- empty state ;
- error state ;
- success state ;
- disabled state.

---

# Ton rédactionnel

Le ton de l'application doit être :

- clair ;
- calme ;
- professionnel ;
- non culpabilisant ;
- orienté action.

Éviter les messages anxiogènes comme « Vous dépensez trop ». Préférer « Votre budget est dépassé de 120 $ ce mois-ci ».

---

# Responsive

L'application est web-first avec priorité desktop, mais doit rester utilisable sur tablette et mobile web.

## Desktop

- Sidebar complète.
- Graphiques larges.
- Dashboard en grille.

## Mobile web

- Sidebar transformée en menu.
- Cartes empilées.
- Tableaux adaptés ou simplifiés.
