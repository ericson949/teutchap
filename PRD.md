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

- **Frontend** : React 18 + Vite + Tailwind CSS (PWA offline-first via Workbox)
- **Backend / Auth** : Supabase (PostgreSQL + Auth + Realtime + Storage + Edge Functions)
- **Sécurité Publique** : Intégration de **Cloudflare Turnstile** en amont de l'API de création pour parer aux soumissions automatisées (Anti-Spam).
- **Gestion d'Identité** : Déploiement du **Shadow Login** (Authentification anonyme Supabase) convertissant silencieusement les visiteurs en propriétaires légitimes via une adresse virtuelle de transition.
- **Sécurité Base de Données** : Verrouillage des tables via Row Level Security (RLS) et **Triggers SQL** sur-mesure validant l'intégrité des flux, exemptant les créateurs et **co-administrateurs** de l'inhibition publique.
- **Compression Media** : Canvas API (client-side) convertissant les flux lourds en JPEG optimisé avant émission réseau.
- **Compilation d'Archives** : Bibliothèque **JSZip** chargée en import dynamique asynchrone côté administrateur pour générer itérativement les archives binaires globales sans saturation de mémoire.
- **Portails Translucides (`createPortal`)** : Encapsulation des tiroirs et modales de détails via `react-dom` ciblant `document.body`, brisant les contraintes d'empilement (`stacking context`) pour éviter tout dépassement ou interférence avec les en-têtes fixes.
- **Lueur Ambiante Cinématique (`Ambient Glow`)** : Rendu d'arrière-plan utilisant l'image source floutée à l'extrême (`blur-3xl opacity-30`) pour projeter un halo lumineux enveloppant et dynamique sur grand écran.

---

## 6. Fonctionnalités — Phase 1 (MVP & Production Hardening)

- **F-01 — Création d'événement express** : Saisie ciblée (type d'événement, jauges), asservie à un sas de vérification Anti-Spam strict (Cloudflare Turnstile).
- **F-02 — QR Code & Partage** : Génération vectorielle unifiée avec incrustation et copie en presse-papiers déclenchant une notification globale de succès au format Toast.
- **F-03 — Gestion des Tranches Horaires** : Saisie optionnelle des heures de début et de fin (`startTime`, `endTime`) conditionnant le cycle de vie des événements s'étalant sur plusieurs jours.
- **F-04 — Sas Premium par Mot de Passe** : Écran de verrouillage immersif interdisant l'accès à la galerie et aux formulaires tant que l'invité n'a pas saisi le code d'accès partagé. L'autorisation validée est persistée dans le cache local.
- **F-05 — Collaboration Multi-Admins & Gestion des Invités** : Console avancée de gestion des contributeurs reposant sur un modèle relationnel strict (`event_invite_user`). L'organisateur visualise l'état de connexion de chaque invité en direct (pastille verte "En ligne" / "Hors ligne" propulsée par **Supabase Presence**) et peut déléguer des droits de co-administration ou révoquer des accès à la volée. Un pont d'interopérabilité (Handoff WebView) garantit la préservation des sessions lors des bascules de navigateurs In-App vers le système natif.
- **F-06 — Upload photo sans compte** : Mode hors-ligne résilient et rattachement strict de la signature de l'invité.
- **F-07 — PWA Installable Universelle** : Bannière de guidage adaptative pour iOS (Safari) et interception du prompt natif pour Android (Chrome).
- **F-08 — Galerie temps réel** : Synchronisation fluide via Supabase Realtime Channels.
- **F-09 — Exportation Globale de l'Album (ZIP)** : Rapatriement asynchrone de l'intégralité des souvenirs bruts sous forme d'archive compressée globale avec jauge de progression en direct.
- **F-10 — Reveal Mode & Modération** : Gestion des quotas et masquage conditionnel avant la levée du voile.
- **F-11 — Vue de Visualisation Organisateur unifiée** : Console de pilotage centralisant les jauges d'occupation, la sécurité et le surclassement sans exiger de défilement excessif sur mobile.
- **F-12 — Galerie Premium & Lightbox Ambient-Glow** : Fiche d'informations transparente (`glassmorphic`) révélant les émojis de réaction, l'auteur et les défis liés, couplée à un zoom plein écran immersif avec lueur ambiante cinématique. Fermeture multi-canal fluide par clic universel ou bouton `X` dédié.
- **F-13 — Prévention des Suppressions Accidentelles** : Élimination complète des calques d'actions intrusifs au survol des cellules de la grille. Les clics sur la galerie ouvrent directement la Fiche de Détail, centralisant la suppression d'images dans un flux d'administration explicite et protégé pour parer aux doubles tapes tactiles involontaires.

---

## 9. Modèle de données (Schéma Physique PostgreSQL)

### Table `users`
- `id` (UUID, Primary Key) : Identifiant de l'organisateur (authentifié ou anonyme via Shadow Login).
- `email` (TEXT, Unique) : Courriel ou identifiant virtuel généré (`anon-[id]@teutchap.shadow`).
- `name` (TEXT) : Raison sociale ou nom d'usage.
- `plan` (TEXT) : Niveau d'abonnement actif (`free`, `premium`, `vip`).

### Table `events`
- `id` (UUID, Primary Key) : Routage principal.
- `token` (TEXT, Unique) : Jeton court de partage WhatsApp (`/e/[token]`).
- `name`, `event_type`, `expected_guests` : Métadonnées descriptives.
- `plan` (TEXT) : Héritage strict des quotas tarifaires.
- `joined_guests_count` (INT) : Jauge dynamique incrémentée à chaque visiteur unique.
- `start_time`, `end_time` (TIMESTAMP) : Bornes temporelles de validité.
- `access_password` (TEXT, Nullable) : Clé de chiffrement/verrouillage de l'album partagé.
- `co_admins` (TEXT[]) : Matrice des identifiants secondaires habilités à la co-gestion.

### Table `photos`
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key) : Référence de l'album.
- `url_original`, `url_compressed` : Pointeurs vers le *Supabase Storage*.
- `contributor_name` (TEXT) : Signature inaltérable saisie par l'invité.
- `is_moderated` (BOOLEAN) : Indicateur d'inhibition (Reveal Mode ou rejet manuel).

### Table `event_invite_user` (Table Pivot / Modèle de Présence)
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key) : Lien de jointure vers la table `events`.
- `user_id` (UUID, Foreign Key) : Lien de jointure vers le profil Shadow de l'invité dans `users`.
- `role` (TEXT) : Niveau de droits d'accès (`guest`, `co_admin`).
- `joined_at` (TIMESTAMPTZ) : Horodatage d'adhésion initiale.
- `last_active_at` (TIMESTAMPTZ) : Suivi des rafraîchissements de session.
- **Contrainte Unique** : `UNIQUE(event_id, user_id)` autorisant l'appartenance à plusieurs événements avec des rôles distincts.

### Table `reactions`
- `id` (UUID, Primary Key)
- `photo_id` (UUID, Foreign Key) : Référence en cascade vers la table `photos`.
- `emoji` (TEXT) : Caractère ou code de l'émoji utilisé.
- `device_fingerprint` (TEXT) : Signature anonyme du votant pour parer aux votes en double.
- **Contrainte Unique** : `UNIQUE(photo_id, emoji, device_fingerprint)`.

### Table `challenges`
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key) : Référence de l'album partagé.
- `title`, `description` (TEXT) : Enoncés textuels du défi.

### Table `payments`
- `id` (UUID, Primary Key) : Identifiant de la transaction.
- `event_id` (UUID, Foreign Key) : Référence de l'événement surclassé.
- `amount` (INT) : Montant payé en FCFA.
- `status` (TEXT) : État de la transaction (`pending`, `completed`, `failed`).
- `payment_method` (TEXT) : Moyen de paiement (`orange_money`, `mtn_momo`).
- `transaction_id` (TEXT, Nullable) : Identifiant externe fourni par l'agrégateur.
- `created_at` (TIMESTAMPTZ) : Date de l'opération.

---

## 10. Modèle économique

### Plans tarifaires
- Gratuit : 0 FCFA / 100 photos
- Premium Mariage : 5 000 FCFA / 1 000 photos
- VIP Event : 15 000 FCFA / 3 000 photos

### Intégration des Paiements (Mobile Money)
Pour le marché d'Afrique Centrale (Cameroun, Gabon, etc.), les flux financiers reposent sur les API des opérateurs Orange Money et MTN MoMo.
- **Agrégateur cible** : Intégration de la passerelle **Campay** (ou alternativement **Monetbil** / **CinetPay**), très populaires pour l'agrégation Orange/MTN en Afrique Centrale.
- **État d'implémentation actuel** : 
  - La structure de persistance transactionnelle (table `payments`) est entièrement implémentée au niveau de la base de données PostgreSQL (Supabase) pour garantir la traçabilité.
  - Le flux de paiement utilisateur (choix du réseau, simulation de débit Orange Money, confirmation de transaction) est intégré au niveau de l'interface (`UpgradeEvent.tsx`).
  - La comptabilisation et le calcul des revenus réels sont consolidés via la vue SQL dynamique `global_stats` pour la console d'administration.
