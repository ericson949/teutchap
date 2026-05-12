# PRD — Application de photographie événementielle collaborative
## Marché cible : Afrique Centrale (Cameroun, Congo, Gabon, RCA…)

**Version :** 1.0  
**Statut :** Prêt pour développement  
**Dernière mise à jour :** Mai 2026  
**Auteur :** Équipe produit

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Contexte et opportunité](#2-contexte-et-opportunité)
3. [Utilisateurs cibles](#3-utilisateurs-cibles)
4. [Contraintes non-négociables](#4-contraintes-non-négociables)
5. [Architecture technique](#5-architecture-technique)
6. [Fonctionnalités — Phase 1 (MVP)](#6-fonctionnalités--phase-1-mvp)
7. [Fonctionnalités — Phase 2](#7-fonctionnalités--phase-2)
8. [Fonctionnalités — Phase 3](#8-fonctionnalités--phase-3)
9. [Modèle de données](#9-modèle-de-données)
10. [Modèle économique](#10-modèle-économique)
11. [Schémas UX — parcours critiques](#11-schémas-ux--parcours-critiques)
12. [Critères d'acceptation globaux](#12-critères-dacceptation-globaux)
13. [KPIs et métriques de succès](#13-kpis-et-métriques-de-succès)
14. [Hors périmètre](#14-hors-périmètre)

---

## 1. Vision produit

### Énoncé de vision

> Devenir **la mémoire collective officielle des événements en Afrique centrale** — l'endroit où les souvenirs d'un mariage, d'une funéraille, d'une remise de diplôme ou d'un anniversaire sont centralisés, préservés et partagés durablement.

### Problème résolu

Aujourd'hui, les photos d'événements en Afrique centrale sont :
- **dispersées** dans des dizaines de fils WhatsApp
- **compressées** et dégradées lors du partage
- **perdues** quand les téléphones changent ou les groupes sont supprimés
- **jamais centralisées** dans un espace dédié à l'événement

### Solution

Une Progressive Web App (PWA) permettant à un organisateur de créer un événement en 30 secondes, de générer un QR code universel, et à chaque invité de contribuer ses photos **sans inscription, sans application à télécharger**, même avec une connexion instable.

### Différenciateurs clés

| Axe | Notre position |
|---|---|
| Accès | Sans compte, scan → photo → terminé |
| Réseau | Offline-first, compression adaptative |
| Émotion | Reveal mode : photos cachées révélées à heure fixe |
| Viralité | WhatsApp-native : lien, bot, notifications |
| Culture | Templates pour mariages, funérailles, camps religieux |
| Paiement | Orange Money, MTN MoMo |

---

## 2. Contexte et opportunité

### Marché

L'Afrique centrale organise des événements à très haute valeur émotionnelle et sociale :

- **Mariages** — cérémonies multi-jours, parfois 500+ invités
- **Funérailles** — événements communautaires de grande ampleur
- **Remises de diplôme** — célébrations familiales étendues
- **Tontines / réunions de famille** — régularité mensuelle
- **Camps religieux / vigiles** — audience massive, contexte sobre
- **Anniversaires, soirées VIP, événements corporate**

### Dynamiques terrain à maîtriser

- **Réseau mobile dominant** : 4G inégale, 3G fréquente, zones blanches
- **Android low-end majoritaire** : appareils <2 Go de RAM, Android 7-10
- **Coût data élevé** : chaque mégaoctet a un coût réel pour l'utilisateur
- **WhatsApp = infrastructure sociale** : c'est le canal de communication principal
- **Paiement mobile money** : Orange Money et MTN MoMo dominent le paiement digital
- **Multi-générationnel** : le produit doit fonctionner pour les 16 ans comme pour les 65 ans

---

## 3. Utilisateurs cibles

### Persona 1 — L'Organisateur
### Persona 2 — L'Invité contributeur
### Persona 3 — Le Revendeur / Partenaire

---

## 4. Contraintes non-négociables

### CN-01 — Zéro installation pour l'invité
### CN-02 — Offline-first pour l'upload
### CN-03 — Compatibilité Android 7+
### CN-04 — Compression adaptative obligatoire
### CN-05 — Paiement mobile money
### CN-06 — WhatsApp comme canal principal

---

## 5. Architecture technique

Frontend          → React 18 + Vite + Tailwind CSS (PWA)
Backend / Auth    → Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
Storage / CDN     → Supabase Storage
Compression media → Canvas API (client-side)
Génération UUID   → Frontend natif (`crypto.randomUUID()`) garantissant un routage déterministe immédiat

---

## 6. Fonctionnalités — Phase 1 (MVP)

- F-01 — Création d'événement express (Ciblage par type d'événement et nombre d'invités attendus ; Mode public par défaut pour le plan gratuit)
- F-02 — QR Code universel
- F-03 — Upload photo sans compte
- F-04 — PWA installable
- F-05 — Galerie temps réel
- F-06 — Téléchargement ZIP
- F-07 — Reveal Mode
- F-08 — Modération galerie
- F-09 — Partage WhatsApp natif avec notification globale de succès au format Toast
- F-10 — Upload offline (Service Worker)
- F-11 — Compression intelligente côté client
- F-12 — Vue de Visualisation Organisateur unifiée (Regroupement du QR Code, du lien direct, des limites du plan et de l'incitation à l'amélioration sur une carte unique sans scroll vertical sur mobile)

---

## 9. Modèle de données

### Table `users` (organisateurs)
### Table `events`
### Table `photos`
### Table `payments`

---

## 10. Modèle économique

### Plans tarifaires
- Gratuit : 0 FCFA / 100 photos
- Premium Mariage : 5 000 FCFA / 1 000 photos
- VIP Event : 15 000 FCFA / 3 000 photos
