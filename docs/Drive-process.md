# Plan d'implémentation d'une fonctionnalité "Drive" pour Survivor

Voici un plan d'implémentation pour ajouter une fonctionnalité "Drive" permettant aux fondateurs d'accéder aux fichiers de leur startup et de gérer ces fichiers.

## 1. Architecture Backend

### 1.1 Modèle de données

**Création d'une nouvelle application Django "drive"**
- Création de l'application : `python manage.py startapp drive`
- Ajout de l'application aux INSTALLED_APPS dans settings.py

**Modèles**
- `DriveFile` : Représente un fichier stocké dans le système
  - `startup` : ForeignKey vers StartupDetail (liaison avec la startup)
  - `name` : Nom du fichier
  - `file` : Champ FileField pour stocker le fichier physique
  - `size` : Taille du fichier en octets
  - `file_type` : Type MIME du fichier
  - `uploaded_by` : ForeignKey vers CustomUser (qui a uploadé le fichier)
  - `uploaded_at` : DateTimeField (quand le fichier a été uploadé)
  - `last_modified` : DateTimeField (dernière modification)
  - `description` : Description optionnelle du fichier
  - `is_archived` : Booléen pour archiver un fichier sans le supprimer

- `DriveFolder` (optionnel - pour organiser les fichiers hiérarchiquement)
  - `startup` : ForeignKey vers StartupDetail
  - `name` : Nom du dossier
  - `parent` : ForeignKey vers lui-même (pour la hiérarchie)
  - `created_at` : DateTimeField
  - `created_by` : ForeignKey vers CustomUser

### 1.2 Configuration du stockage

**Options de stockage**
- Utilisation de Django's FileField avec stockage sur système de fichiers (pour développement)
- Configuration de stockage cloud pour production (AWS S3, Google Cloud Storage, etc.)
- Configuration dans settings.py pour le stockage des médias

### 1.3 API REST

**Serializers**
- `DriveFileSerializer` : Sérialisation des fichiers
- `DriveFolderSerializer` : Sérialisation des dossiers (si implémenté)

**Vues**
- `DriveFileViewSet` : CRUD pour les fichiers
  - GET : Liste des fichiers (filtrable par startup)
  - POST : Upload d'un nouveau fichier
  - GET (detail) : Détails d'un fichier
  - PUT/PATCH : Mise à jour des métadonnées
  - DELETE : Suppression d'un fichier

- `FileDownloadView` : Vue spécifique pour le téléchargement sécurisé de fichiers
- `FileBulkOperationView` : Pour les opérations sur plusieurs fichiers

**Routes**
- `/api/drive/files/` : Point d'entrée principal pour les fichiers
- `/api/drive/files/<id>/` : Opérations sur un fichier spécifique
- `/api/drive/files/<id>/download/` : Téléchargement d'un fichier
- `/api/drive/startups/<startup_id>/files/` : Tous les fichiers d'une startup

### 1.4 Permissions et sécurité

**Permissions personnalisées**
- Création d'une permission `CanManageStartupFiles` dans le système de permissions
- Vérification que seuls les fondateurs liés à une startup peuvent accéder à ses fichiers
- Utilisation des permissions Django REST Framework pour sécuriser les endpoints

**Validation des fichiers**
- Validation des types de fichiers autorisés
- Limites de taille des fichiers
- Scan antivirus (optionnel mais recommandé)

### 1.5 Intégration avec les modèles existants

- Ajout de related_name dans les ForeignKey pour faciliter les requêtes
- Possiblement mise à jour du modèle StartupDetail pour indiquer l'utilisation de l'espace de stockage

## 2. Architecture Frontend

### 2.1 Composants React

**Page principale du Drive**
- `DrivePage` : Page principale contenant la liste des fichiers
- `FileList` : Composant pour afficher la liste des fichiers
- `FileCard` : Carte représentant un fichier individuel
- `FileViewer` : Prévisualisation des fichiers supportés
- `FolderNavigation` : Navigation entre dossiers (si implémenté)

**Gestion des fichiers**
- `FileUploadModal` : Modal pour l'upload de fichiers
- `FileDetailsPanel` : Panneau latéral pour afficher les détails d'un fichier
- `FileActionsMenu` : Menu contextuel pour les actions sur les fichiers

### 2.2 Services et hooks

**Services**
- `driveService.js` : Service pour interagir avec l'API Drive
  - `getFiles(startupId)`
  - `uploadFile(startupId, file, metadata)`
  - `downloadFile(fileId)`
  - `updateFile(fileId, metadata)`
  - `deleteFile(fileId)`

**Hooks personnalisés**
- `useStartupFiles` : Hook pour charger et gérer les fichiers d'une startup
- `useFileUpload` : Hook pour gérer le processus d'upload avec progress tracking

### 2.3 Routing et navigation

**Routes**
- `/dashboard/startup/:id/drive` : Page principale du Drive
- `/dashboard/startup/:id/drive/:fileId` : Vue détaillée d'un fichier

**Navigation**
- Ajout d'un élément "Documents" dans la barre latérale ou la navigation principale pour accéder au Drive

### 2.4 Interface utilisateur

**Fonctionnalités UI**
- Vue en grille/liste avec toggle
- Tri par nom, date, type, taille
- Filtrage par type de fichier
- Recherche de fichiers par nom/contenu
- Drag & drop pour l'upload et l'organisation

**Interactions**
- Preview des fichiers (PDF, images, etc.) 
- Téléchargement direct
- Partage de liens (optionnel)
- Indication de l'espace utilisé / disponible

### 2.5 Gestion de l'upload

**Processus d'upload**
- Upload avec barre de progression
- Support multi-fichiers
- Validation côté client avant envoi
- Gestion des échecs et reprises

## 3. Plan de mise en œuvre

### 3.1 Étapes de développement Backend

1. Création de l'application Django "drive"
2. Implémentation des modèles de données
3. Configuration du stockage des fichiers
4. Création des serializers et vues pour l'API
5. Implémentation des permissions et de la sécurité
6. Tests unitaires et d'intégration
7. Documentation de l'API

### 3.2 Étapes de développement Frontend

1. Création des services pour interagir avec l'API
2. Développement des composants UI principaux
3. Implémentation de la logique d'upload et de gestion de fichiers
4. Intégration avec le système de navigation existant
5. Tests et optimisation de l'expérience utilisateur
6. Accessibilité et responsive design

### 3.3 Optimisations et améliorations futures

**Phase 1 (MVP)**
- Upload, téléchargement et gestion basique des fichiers
- Liaison des fichiers aux startups
- Contrôle des accès basé sur les rôles

**Phase 2 (Améliorations)**
- Organisation des fichiers en dossiers
- Prévisualisation en ligne pour les formats courants
- Métadonnées et tags pour les fichiers
- Partage limité de fichiers avec des tiers

**Phase 3 (Fonctionnalités avancées)**
- Collaboration en temps réel
- Versioning des fichiers
- Commentaires sur les fichiers
- Intégration avec des services tiers (Google Drive, Dropbox)

## 4. Considérations techniques

### 4.1 Sécurité

- Authentification pour tous les accès aux fichiers
- Chiffrement des fichiers sensibles
- Validation des types MIME et des extensions
- Protection contre les attaques courantes (CSRF, XSS)
- Audit logging pour les opérations critiques

### 4.2 Performance

- Gestion efficace des grands fichiers
- Upload par chunks pour les fichiers volumineux
- Mise en cache appropriée pour les fichiers fréquemment accédés
- Limitation du nombre de requêtes pour les listings volumineux

### 4.3 Limites et quotas

- Définition de quotas d'espace par startup
- Limitation des types de fichiers autorisés
- Restrictions sur la taille maximale des fichiers
- Politiques de rétention et d'archivage

### 4.4 Maintenance

- Tâches périodiques pour nettoyer les fichiers temporaires
- Mécanismes de backup et restauration
- Surveillance de l'utilisation de l'espace disque
- Outils d'administration pour la gestion des fichiers

Ce plan d'implémentation fournit une approche structurée pour ajouter une fonctionnalité Drive à Survivor, en respectant l'architecture existante et en s'intégrant de manière cohérente avec les fonctionnalités actuelles du système.