
<style>
*{box-sizing:border-box;margin:0;padding:0}
.wrap{padding:1rem 0;font-family:var(--font-sans)}
.header{background:var(--color-background-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1rem 1.25rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:12px}
.badge{font-size:11px;font-weight:500;background:#EAF3DE;color:#27500A;border-radius:20px;padding:3px 10px;flex-shrink:0}
@media(prefers-color-scheme:dark){.badge{background:#27500A;color:#C0DD97}}
.title{font-size:15px;font-weight:500;color:var(--color-text-primary)}
.sub{font-size:12px;color:var(--color-text-secondary);margin-top:2px}
.prompt-box{background:var(--color-background-primary);border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-lg);padding:1.2rem 1.25rem;position:relative}
pre{font-family:var(--font-mono);font-size:12px;color:var(--color-text-primary);line-height:1.75;white-space:pre-wrap;word-break:break-word}
.copy-btn{position:absolute;top:12px;right:12px;font-size:11px;font-family:var(--font-sans);background:var(--color-background-secondary);color:var(--color-text-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:6px;padding:4px 10px;cursor:pointer;transition:background .15s}
.copy-btn:hover{background:var(--color-background-tertiary);color:var(--color-text-primary)}
</style>
<div class="wrap">
<div class="header">
  <div>
    <div class="title">Prompt 1 — Base de données & Repositories</div>
    <div class="sub">Symfony 7 · Doctrine ORM · PostgreSQL + PostGIS · Migrations automatiques</div>
  </div>
  <span class="badge">PROMPT 1 / 2</span>
</div>
<div class="prompt-box">
<button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('p1').innerText);this.textContent='Copié !';setTimeout(()=>this.textContent='Copier',2000)">Copier</button>
<pre id="p1">Tu es un expert Symfony 7. Tu vas générer AUTOMATIQUEMENT et COMPLÈTEMENT toute la couche Base de données du projet "ServiConnect" (plateforme de mise en relation clients/prestataires de services).

═══════════════════════════════════════════
STACK TECHNIQUE OBLIGATOIRE
═══════════════════════════════════════════
- Symfony 7.x + PHP 8.3
- Doctrine ORM 3.x + doctrine/doctrine-migrations-bundle
- Base de données : PostgreSQL 16 + extension PostGIS (pour les requêtes géospatiales)
- UUIDs (Symfony UidBundle) comme clé primaire sur toutes les entités
- Annotations/Attributs PHP 8 (#[ORM\...]) — AUCUN YAML/XML
- Timestamps automatiques (createdAt, updatedAt) via un trait Timestampable
- Soft delete via un trait SoftDeletable (deletedAt nullable)

═══════════════════════════════════════════
STRUCTURE DES DOSSIERS À CRÉER
═══════════════════════════════════════════
src/
├── Entity/
│   ├── User.php
│   ├── ProviderProfile.php
│   ├── ServiceCategory.php
│   ├── ProviderService.php
│   ├── Portfolio.php
│   ├── Conversation.php
│   ├── Message.php
│   ├── Review.php
│   ├── Banner.php
│   └── Notification.php
├── Repository/
│   ├── UserRepository.php
│   ├── ProviderProfileRepository.php
│   ├── ServiceCategoryRepository.php
│   ├── ProviderServiceRepository.php
│   ├── PortfolioRepository.php
│   ├── ConversationRepository.php
│   ├── MessageRepository.php
│   ├── ReviewRepository.php
│   ├── BannerRepository.php
│   └── NotificationRepository.php
└── Entity/Traits/
    ├── TimestampableTrait.php
    └── SoftDeletableTrait.php

═══════════════════════════════════════════
ENTITÉS À GÉNÉRER (détail complet)
═══════════════════════════════════════════

[1] User
- id : UUID (PK, auto-généré)
- email : string(180), unique, not null
- phone : string(20), unique, nullable
- passwordHash : string(255), not null
- role : string ENUM('client','provider','admin'), default 'client'
- firstName : string(100), not null
- lastName : string(100), not null
- avatarUrl : string(500), nullable
- latitude : float, nullable (géolocalisation)
- longitude : float, nullable
- city : string(150), nullable
- country : string(100), default 'BJ'
- isActive : boolean, default true
- fcmToken : string(500), nullable (push notifications Firebase)
- Relations :
    * OneToOne → ProviderProfile (cascade persist/remove)
    * OneToMany → Conversation (as client)
    * OneToMany → Message
    * OneToMany → Review (as client)
    * OneToMany → Notification
- Implements UserInterface + PasswordAuthenticatedUserInterface

[2] ProviderProfile
- id : UUID (PK)
- user : OneToOne → User (mappedBy)
- bio : text, nullable
- yearsExperience : int, default 0
- ratingAverage : float, default 0.0
- totalReviews : int, default 0
- status : string ENUM('active','inactive','busy'), default 'active'
- isVerified : boolean, default false
- Relations :
    * OneToMany → ProviderService
    * OneToMany → Portfolio
    * OneToMany → Conversation (as provider)
    * OneToMany → Review (as provider)

[3] ServiceCategory
- id : UUID (PK)
- name : string(150), unique, not null
- slug : string(150), unique, not null
- iconUrl : string(500), nullable
- isActive : boolean, default true
- displayOrder : int, default 0
- Relations :
    * OneToMany → ProviderService

[4] ProviderService
- id : UUID (PK)
- providerProfile : ManyToOne → ProviderProfile
- category : ManyToOne → ServiceCategory
- description : text, nullable
- isActive : boolean, default true

[5] Portfolio
- id : UUID (PK)
- providerProfile : ManyToOne → ProviderProfile
- title : string(255), not null
- description : text, nullable
- mediaUrl : string(500), not null
- mediaType : string ENUM('image','video'), default 'image'

[6] Conversation
- id : UUID (PK)
- client : ManyToOne → User
- providerProfile : ManyToOne → ProviderProfile
- status : string ENUM('open','closed','archived'), default 'open'
- lastMessageAt : datetime, nullable
- Relations :
    * OneToMany → Message

[7] Message
- id : UUID (PK)
- conversation : ManyToOne → Conversation
- sender : ManyToOne → User
- content : text, nullable
- type : string ENUM('text','audio','video','image','call_log'), default 'text'
- mediaUrl : string(500), nullable
- durationSeconds : int, nullable (pour audio/vidéo)
- isRead : boolean, default false

[8] Review
- id : UUID (PK)
- client : ManyToOne → User
- providerProfile : ManyToOne → ProviderProfile
- conversation : ManyToOne → Conversation, nullable
- rating : int (1-5), not null
- comment : text, nullable
- Contrainte : un client ne peut laisser qu'un seul avis par prestataire (UniqueConstraint)

[9] Banner
- id : UUID (PK)
- title : string(255), not null
- imageUrl : string(500), not null
- targetUrl : string(500), nullable
- placement : string ENUM('home','search','profile'), default 'home'
- isActive : boolean, default true
- startDate : datetime, nullable
- endDate : datetime, nullable
- displayOrder : int, default 0

[10] Notification
- id : UUID (PK)
- user : ManyToOne → User
- type : string(100) (ex: 'new_message','new_review','system')
- title : string(255), not null
- body : text, not null
- isRead : boolean, default false
- metadata : json, nullable (données contextuelles)

═══════════════════════════════════════════
REPOSITORIES — MÉTHODES CUSTOM OBLIGATOIRES
═══════════════════════════════════════════

UserRepository :
- findByEmailOrPhone(string $value): ?User
- findActiveProviders(): array

ProviderProfileRepository :
- findNearbyByCategory(float $lat, float $lng, int $radiusMeters, string $categorySlug): array
  → Utilise la formule Haversine via DQL ou une requête SQL native PostGIS :
    ST_DWithin(ST_MakePoint(u.longitude, u.latitude)::geography,
               ST_MakePoint(:lng, :lat)::geography, :radius)
  → Trier par distance ASC, puis ratingAverage DESC
- findByStatus(string $status): array
- updateRatingAverage(string $providerId): void
  → Recalcule automatiquement ratingAverage et totalReviews depuis la table reviews

ConversationRepository :
- findByUserPaginated(string $userId, int $page, int $limit): array
- findOrCreateBetween(string $clientId, string $providerId): Conversation

MessageRepository :
- findByConversationPaginated(string $conversationId, int $page, int $limit): array
- countUnreadForUser(string $userId): int
- markAllReadInConversation(string $conversationId, string $userId): void

NotificationRepository :
- findUnreadByUser(string $userId): array
- markAllReadForUser(string $userId): void

ReviewRepository :
- findByProviderSorted(string $providerId): array
- hasClientReviewedProvider(string $clientId, string $providerId): bool

BannerRepository :
- findActiveBanners(string $placement): array
  → WHERE isActive=true AND (startDate IS NULL OR startDate <= NOW())
    AND (endDate IS NULL OR endDate >= NOW())
  → ORDER BY displayOrder ASC

═══════════════════════════════════════════
MIGRATIONS
═══════════════════════════════════════════
Génère une migration initiale complète (Version[timestamp].php) qui :
1. Active l'extension PostGIS si non activée : CREATE EXTENSION IF NOT EXISTS postgis;
2. Crée toutes les tables dans l'ordre correct (respect des FK)
3. Crée les index suivants :
   - idx_user_email (users.email)
   - idx_user_role (users.role)
   - idx_provider_status (provider_profiles.status)
   - idx_provider_location (users.latitude, users.longitude) — index spatial GIST si PostGIS
   - idx_message_conversation (messages.conversation_id)
   - idx_message_created (messages.created_at)
   - idx_notification_user_read (notifications.user_id, notifications.is_read)
   - idx_banner_placement_active (banners.placement, banners.is_active)
4. Insère les données de seed :
   - 15 catégories de services réalistes pour le Bénin/Afrique de l'Ouest :
     Plomberie, Électricité, Menuiserie, Peinture, Maçonnerie, Jardinage,
     Climatisation, Informatique, Coiffure à domicile, Nettoyage,
     Mécanique auto, Couture/Broderie, Cours particuliers, Livraison,
     Sécurité/Gardiennage
   - 1 compte admin : email=admin@serviconnect.bj / password=Admin@2025

═══════════════════════════════════════════
TRAITS
═══════════════════════════════════════════
TimestampableTrait :
- createdAt : datetime_immutable, auto #[ORM\PrePersist]
- updatedAt : datetime, auto #[ORM\PreUpdate]

SoftDeletableTrait :
- deletedAt : datetime, nullable
- méthode softDelete() et isDeleted()
- Filtre Doctrine automatique pour exclure les enregistrements supprimés

═══════════════════════════════════════════
FICHIERS DE CONFIGURATION À GÉNÉRER
═══════════════════════════════════════════
- config/packages/doctrine.yaml : connexion PostgreSQL, types UUID, mapping auto
- .env. POUR CELA UTILISER MYSQL
- composer.json (section require) : toutes les dépendances nécessaires

═══════════════════════════════════════════
RÈGLES DE GÉNÉRATION
═══════════════════════════════════════════
1. Génère CHAQUE fichier PHP en entier — aucun placeholder "// TODO" ou "..."
2. Tous les imports (use) doivent être présents et corrects
3. Les attributs PHP 8 doivent être syntaxiquement valides
4. Chaque entité doit avoir ses getters/setters complets
5. Les repositories étendent ServiceEntityRepository correctement
6. Le code doit être prêt pour "php bin/console doctrine:migrations:migrate" sans erreur

COMMENCE par src/Entity/Traits/TimestampableTrait.php, puis les entités dans l'ordre des dépendances (User en dernier car il a le plus de relations), puis les repositories, puis la migration.</pre>
</div>
</div>
