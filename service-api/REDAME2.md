Tu es un expert Symfony 7 + API REST. Le projet "ServiConnect" a déjà ses Entités et Repositories générés (Prompt 1). Tu vas maintenant générer AUTOMATIQUEMENT et COMPLÈTEMENT toute la logique métier, les controllers API, l'authentification JWT, le chat temps réel et le dashboard admin.

═══════════════════════════════════════════
STACK TECHNIQUE OBLIGATOIRE
═══════════════════════════════════════════
- Symfony 7.x + PHP 8.3
- lexik/jwt-authentication-bundle (JWT Auth)
- symfony/mercure-bundle (WebSocket temps réel)
- symfony/messenger (tâches asynchrones)
- vich/uploader-bundle (upload fichiers)
- nelmio/cors-bundle (CORS pour web + mobile)
- symfony/rate-limiter (protection endpoints)
- symfony/http-client (Firebase FCM)
- nelmio/api-doc-bundle (documentation Swagger)
- Réponses JSON uniquement (JsonResponse) — pas de templates Twig
- Format de réponse uniforme :
  { "success": true, "data": {...}, "message": "...", "errors": [] }

═══════════════════════════════════════════
STRUCTURE COMPLÈTE DES DOSSIERS À CRÉER
═══════════════════════════════════════════
src/
├── Controller/
│   ├── Api/
│   │   ├── AuthController.php
│   │   ├── UserController.php
│   │   ├── ProviderController.php
│   │   ├── SearchController.php
│   │   ├── ConversationController.php
│   │   ├── MessageController.php
│   │   ├── ReviewController.php
│   │   ├── BannerController.php
│   │   ├── PortfolioController.php
│   │   └── NotificationController.php
│   └── Admin/
│       ├── AdminDashboardController.php
│       ├── AdminUserController.php
│       ├── AdminBannerController.php
│       └── AdminCategoryController.php
├── Service/
│   ├── AuthService.php
│   ├── GeoSearchService.php
│   ├── MediaUploadService.php
│   ├── NotificationService.php
│   ├── ConversationService.php
│   ├── MercurePublisher.php
│   └── RatingService.php
├── Dto/
│   ├── Request/
│   │   ├── RegisterDto.php
│   │   ├── LoginDto.php
│   │   ├── UpdateProfileDto.php
│   │   ├── SearchProviderDto.php
│   │   ├── SendMessageDto.php
│   │   ├── CreateReviewDto.php
│   │   └── CreateBannerDto.php
│   └── Response/
│       ├── UserResponseDto.php
│       ├── ProviderResponseDto.php
│       ├── MessageResponseDto.php
│       └── ConversationResponseDto.php
├── Security/
│   ├── JwtAuthenticator.php
│   └── Voter/
│       ├── ConversationVoter.php
│       └── MessageVoter.php
├── EventListener/
│   ├── MessageCreatedListener.php
│   ├── ReviewCreatedListener.php
│   └── JwtCreatedListener.php
└── MessageHandler/
    ├── SendPushNotificationHandler.php
    └── ProcessMediaUploadHandler.php

config/
├── packages/
│   ├── lexik_jwt_authentication.yaml
│   ├── mercure.yaml
│   ├── messenger.yaml
│   ├── nelmio_cors.yaml
│   ├── rate_limiter.yaml
│   └── vich_uploader.yaml
├── routes/
│   ├── api.yaml
│   └── admin.yaml
└── jwt/
    (clés générées via bin/console lexik:jwt:generate-keypair)

═══════════════════════════════════════════
MODULE 1 : AUTHENTIFICATION JWT
═══════════════════════════════════════════
Fichier : src/Controller/Api/AuthController.php
Fichier : src/Service/AuthService.php
Fichier : src/Security/JwtAuthenticator.php
Fichier : src/EventListener/JwtCreatedListener.php

ROUTES à implémenter :
POST /api/auth/register
  - Body: { email, password, firstName, lastName, phone, role: "client"|"provider" }
  - Si role=provider : crée aussi ProviderProfile vide
  - Validation : email unique, password min 8 chars + 1 majuscule + 1 chiffre
  - Hash password avec Symfony PasswordHasher
  - Retourne : { user, token, refreshToken }

POST /api/auth/login
  - Body: { email, password }
  - Rate limit : 10 tentatives / 15 minutes par IP
  - Retourne : { user, token (expire 1h), refreshToken (expire 30j) }

POST /api/auth/refresh
  - Body: { refreshToken }
  - Génère un nouveau JWT sans redemander les credentials
  - Stocke les refresh tokens en base (table refresh_tokens)

POST /api/auth/logout
  - Invalide le refresh token en base

POST /api/auth/forgot-password
  - Génère un token reset (valide 30min), stocké en base
  - Envoie email via Symfony Mailer (template à créer)

POST /api/auth/reset-password
  - Body: { token, newPassword }
  - Vérifie le token, met à jour le hash

JwtCreatedListener :
  - Ajoute dans le payload JWT : { id, email, role, firstName, lastName }
  - Permet au mobile de lire les infos sans appel API supplémentaire

═══════════════════════════════════════════
MODULE 2 : GESTION UTILISATEUR
═══════════════════════════════════════════
Fichier : src/Controller/Api/UserController.php

GET /api/me [JWT requis]
  - Retourne le profil complet (user + providerProfile si prestataire)

PATCH /api/me [JWT requis]
  - Body: { firstName, lastName, phone, city, country }
  - Validation Symfony Validator

PATCH /api/me/location [JWT requis]
  - Body: { latitude, longitude }
  - Met à jour la géolocalisation en temps réel

POST /api/me/avatar [JWT requis]
  - Multipart/form-data : champ "avatar" (image jpeg/png/webp max 5MB)
  - Utilise VichUploader ou MediaUploadService
  - Retourne { avatarUrl }

═══════════════════════════════════════════
MODULE 3 : RECHERCHE GÉOGRAPHIQUE
═══════════════════════════════════════════
Fichier : src/Controller/Api/SearchController.php
Fichier : src/Service/GeoSearchService.php

GET /api/search/providers?category={slug}&lat={float}&lng={float}&radius={int}&page={int}&limit={int}
  - Paramètres : category (obligatoire), lat+lng (obligatoires), radius (défaut 5000m), page, limit
  - GeoSearchService::findNearby() appelle ProviderProfileRepository::findNearbyByCategory()
  - Formule Haversine SQL :
    (6371000 * acos(cos(radians(:lat)) * cos(radians(u.latitude))
    * cos(radians(u.longitude) - radians(:lng))
    + sin(radians(:lat)) * sin(radians(u.latitude))))
  - Filtre : status='active', isActive=true, provider has active service in category
  - Tri : distance ASC, ratingAverage DESC
  - Retourne par prestataire : { id, firstName, lastName, avatarUrl, city,
    ratingAverage, totalReviews, yearsExperience, status, distance,
    services[{categoryName, description}] }
  - Pagination : { data, total, page, limit, totalPages }

GET /api/categories [PUBLIC]
  - Retourne toutes les catégories actives triées par displayOrder

GET /api/providers/{id} [PUBLIC]
  - Profil public complet du prestataire
  - Inclut : user info, providerProfile, services, top 3 reviews

GET /api/providers/{id}/portfolio [PUBLIC]
  - Paginated list (page, limit)

GET /api/providers/{id}/reviews [PUBLIC]
  - Liste des avis avec pagination, tri date DESC

═══════════════════════════════════════════
MODULE 4 : ESPACE PRESTATAIRE
═══════════════════════════════════════════
Fichier : src/Controller/Api/ProviderController.php

GET /api/provider/profile [JWT + ROLE_PROVIDER]
PATCH /api/provider/profile [JWT + ROLE_PROVIDER]
  - Body: { bio, yearsExperience, services: [{categoryId, description}] }
  - Met à jour ProviderProfile + recalcule ProviderServices (diff ajout/suppression)

PATCH /api/provider/status [JWT + ROLE_PROVIDER]
  - Body: { status: "active"|"inactive"|"busy" }

GET /api/provider/portfolio [JWT + ROLE_PROVIDER]
POST /api/provider/portfolio [JWT + ROLE_PROVIDER]
  - Multipart: { title, description, media (file) }
  - Accepte : image (jpeg/png/webp max 10MB) ou video (mp4/mov max 100MB)
  - MediaUploadService gère la détection du type et le stockage

DELETE /api/provider/portfolio/{id} [JWT + ROLE_PROVIDER]
  - Vérifie que le portfolio appartient bien au prestataire connecté

GET /api/provider/dashboard [JWT + ROLE_PROVIDER]
  - Stats : { totalConversations, activeConversations, averageRating,
    totalReviews, profileViews (compteur incrémenté à chaque GET /providers/{id}),
    recentReviews[5], unreadMessages }

═══════════════════════════════════════════
MODULE 5 : MESSAGERIE TEMPS RÉEL
═══════════════════════════════════════════
Fichier : src/Controller/Api/ConversationController.php
Fichier : src/Controller/Api/MessageController.php
Fichier : src/Service/ConversationService.php
Fichier : src/Service/MercurePublisher.php
Fichier : src/EventListener/MessageCreatedListener.php

GET /api/conversations [JWT requis]
  - Retourne mes conversations triées par lastMessageAt DESC
  - Pour chaque conversation : { id, otherUser, lastMessage, unreadCount }

POST /api/conversations [JWT requis — ROLE_CLIENT uniquement]
  - Body: { providerId }
  - ConversationService::findOrCreate() : si conversation existe déjà, retourne l'existante
  - Retourne la conversation avec son id

GET /api/conversations/{id}/messages [JWT requis]
  - Vérifie via ConversationVoter que l'utilisateur est client ou prestataire de cette conv
  - Paginated (page, limit=20), tri createdAt DESC
  - Marque automatiquement les messages comme lus à la récupération

POST /api/conversations/{id}/messages [JWT requis]
  - Body: multipart/form-data
    { content (text nullable), type, media (file nullable) }
  - Types supportés : text, audio (m4a/ogg/mp3 max 20MB), video (mp4 max 100MB),
    image (jpeg/png/webp max 10MB), call_log
  - Pour call_log : content = numéro de téléphone formaté du prestataire
  - Après création du message :
    → MessageCreatedListener déclenche :
      1. MercurePublisher::publish(topic: /conversations/{id}, data: messageData)
      2. Dispatch(new SendPushNotificationMessage(recipientId, messageData))
    → Met à jour conversation.lastMessageAt

PATCH /api/conversations/{id}/read [JWT requis]
  - Marque tous les messages non lus de la conv comme lus pour l'utilisateur connecté

Mercure (WebSocket) :
  - MercurePublisher publie sur le topic : /conversations/{conversationId}
  - Payload publié : { id, senderId, content, type, mediaUrl, createdAt, isRead }
  - Authorization via JWT Mercure (cookie ou header)
  - Configuration dans mercure.yaml : publishAllowedOrigins ["*"], subscribeAllowedOrigins ["*"]
  - Le frontend souscrit via : new EventSource('/api/.well-known/mercure?topic=/conversations/{id}')

═══════════════════════════════════════════
MODULE 6 : UPLOAD MÉDIAS
═══════════════════════════════════════════
Fichier : src/Service/MediaUploadService.php
Fichier : src/MessageHandler/ProcessMediaUploadHandler.php

POST /api/media/upload [JWT requis]
  - Multipart: { file, context: "message"|"portfolio"|"avatar" }
  - Validation : mime type + taille selon contexte
  - Génère un nom de fichier unique (UUID + extension)
  - Stocke dans public/uploads/{context}/{year}/{month}/
  - Retourne { mediaUrl, mediaType, fileName }

DELETE /api/media/{fileName} [JWT requis]
  - Vérifie que le fichier appartient à l'utilisateur
  - Supprime physiquement

═══════════════════════════════════════════
MODULE 7 : AVIS ET NOTES
═══════════════════════════════════════════
Fichier : src/Controller/Api/ReviewController.php
Fichier : src/Service/RatingService.php
Fichier : src/EventListener/ReviewCreatedListener.php

POST /api/reviews [JWT + ROLE_CLIENT]
  - Body: { providerId, conversationId (nullable), rating (1-5), comment }
  - Vérifie via ReviewRepository::hasClientReviewedProvider() — un seul avis possible
  - ReviewCreatedListener : après création, appelle RatingService::recalculateAverage(providerId)
  - RatingService recalcule ratingAverage et totalReviews sur ProviderProfile

═══════════════════════════════════════════
MODULE 8 : NOTIFICATIONS
═══════════════════════════════════════════
Fichier : src/Controller/Api/NotificationController.php
Fichier : src/Service/NotificationService.php
Fichier : src/MessageHandler/SendPushNotificationHandler.php

GET /api/notifications [JWT requis]
  - Retourne les notifications non lues de l'utilisateur connecté

PATCH /api/notifications/{id}/read [JWT requis]
PATCH /api/notifications/read-all [JWT requis]

POST /api/notifications/push-token [JWT requis]
  - Body: { fcmToken }
  - Stocke le token Firebase dans user.fcmToken

SendPushNotificationHandler :
  - Reçoit un message Symfony Messenger
  - Appelle l'API Firebase FCM v1 via symfony/http-client :
    POST https://fcm.googleapis.com/v1/projects/{PROJECT_ID}/messages:send
    Headers: Authorization Bearer {FCM_TOKEN}
    Body: { message: { token: user.fcmToken, notification: { title, body } } }
  - Crée aussi l'entité Notification en base

NotificationService::notify(User $user, string $type, string $title, string $body) :
  - Crée Notification en base
  - Si user.fcmToken non null → dispatch(SendPushNotificationMessage)
  - Publie sur Mercure topic /notifications/{userId}

═══════════════════════════════════════════
MODULE 9 : BANNIÈRES PUBLICITAIRES
═══════════════════════════════════════════
Fichier : src/Controller/Api/BannerController.php

GET /api/banners?placement={home|search|profile} [PUBLIC]
  - Retourne les bannières actives du placement demandé, triées par displayOrder

═══════════════════════════════════════════
MODULE 10 : DASHBOARD ADMIN
═══════════════════════════════════════════
Fichier : src/Controller/Admin/AdminDashboardController.php
Fichier : src/Controller/Admin/AdminUserController.php
Fichier : src/Controller/Admin/AdminBannerController.php
Fichier : src/Controller/Admin/AdminCategoryController.php

Tous ces endpoints nécessitent ROLE_ADMIN.

GET /api/admin/stats
  - { totalUsers, totalProviders, totalClients, totalConversations,
    totalMessages, totalReviews, newUsersThisWeek, activeProviders }

GET /api/admin/users?role=&search=&page=&limit=
  - Filtre par role, recherche par nom/email
PATCH /api/admin/users/{id}/toggle-active
  - Active/désactive un compte
PATCH /api/admin/users/{id}/verify-provider
  - Met isVerified=true sur ProviderProfile

GET /api/admin/banners
POST /api/admin/banners
  - Body: { title, targetUrl, placement, isActive, startDate, endDate, displayOrder }
  - Upload image via MediaUploadService
PUT /api/admin/banners/{id}
DELETE /api/admin/banners/{id}

GET /api/admin/categories
POST /api/admin/categories
  - Body: { name, slug (auto-généré si absent), iconUrl, displayOrder }
PATCH /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
  - Vérifie qu'aucun prestataire actif n'utilise cette catégorie avant suppression

═══════════════════════════════════════════
SÉCURITÉ — VOTERS & GUARDS
═══════════════════════════════════════════
ConversationVoter (src/Security/Voter/ConversationVoter.php) :
  - VIEW : user est le client OU le prestataire de la conversation
  - SEND_MESSAGE : idem

MessageVoter (src/Security/Voter/MessageVoter.php) :
  - DELETE : user est l'expéditeur ET message créé depuis moins de 5 minutes

config/packages/security.yaml :
  - Firewalls : api (stateless, jwt), admin (stateless, jwt)
  - access_control :
    - { path: ^/api/auth, roles: PUBLIC_ACCESS }
    - { path: ^/api/admin, roles: ROLE_ADMIN }
    - { path: ^/api/provider, roles: ROLE_PROVIDER }
    - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
  - Role hierarchy : ROLE_ADMIN > ROLE_PROVIDER > ROLE_CLIENT

═══════════════════════════════════════════
CORS — CONFIG NELMIO
═══════════════════════════════════════════
config/packages/nelmio_cors.yaml :
  - allow_origin : ['*'] (dev) / liste de domaines en prod
  - allow_methods : ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
  - allow_headers : ['Content-Type','Authorization','X-Requested-With']
  - expose_headers : ['Link']
  - max_age : 3600

═══════════════════════════════════════════
ROUTES config/routes/api.yaml
═══════════════════════════════════════════
api_controllers:
  resource: ../../src/Controller/Api/
  type: attribute
  prefix: /api

admin_controllers:
  resource: ../../src/Controller/Admin/
  type: attribute
  prefix: /api/admin

═══════════════════════════════════════════
VARIABLES D'ENVIRONNEMENT (.env.example)
═══════════════════════════════════════════
###DATABASE_URL=postgresql://servi:secret@localhost:5432/serviconnect?serverVersion=16
DATABASE_URL="mysql://root:@127.0.0.1:3306/connect?serverVersion=mariadb-10.4.328&charset=utf8mb4"
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=conseve
DB_USER=root
DB_PASSWORD=
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase
MERCURE_URL=http://localhost:3000/.well-known/mercure
MERCURE_PUBLIC_URL=http://localhost:3000/.well-known/mercure
MERCURE_JWT_SECRET=your_mercure_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVER_KEY=your_firebase_key
MAILER_DSN=smtp://localhost:1025
APP_UPLOAD_DIR=%kernel.project_dir%/public/uploads
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'

═══════════════════════════════════════════
RÈGLES DE GÉNÉRATION
═══════════════════════════════════════════
1. Génère CHAQUE fichier PHP en entier — aucun placeholder "// TODO" ou "..."
2. Chaque controller retourne TOUJOURS JsonResponse avec le format uniforme
3. Utilise #[Route], #[IsGranted], #[MapRequestPayload] (Symfony 7)
4. Validation via #[Assert\...] sur les DTOs
5. Gestion d'erreurs : try/catch + codes HTTP corrects (400, 401, 403, 404, 422, 500)
6. Chaque service est injecté via le constructeur (injection de dépendances)
7. Ajoute #[OA\...] (NelmioApiDoc) sur chaque endpoint pour Swagger
8. Les MessageHandlers doivent implémenter MessageHandlerInterface

ORDRE DE GÉNÉRATION :
1. DTOs (Request puis Response)
2. Services (GeoSearch, Media, Notification, Conversation, Rating, MercurePublisher)
3. Security (JwtCreatedListener, Voters)
4. EventListeners
5. MessageHandlers
6. Controllers (Auth → User → Search → Provider → Conversation → Message → Review → Notification → Banner → Admin)
7. Fichiers de configuration (security.yaml, lexik_jwt.yaml, mercure.yaml, messenger.yaml, nelmio_cors.yaml, routes/)
8. .env.example avec commentaires explicatifs sur chaque variable