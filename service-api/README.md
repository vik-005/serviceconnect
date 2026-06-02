# ServiConnect API

API REST Symfony 7.4 pour la plateforme de mise en relation **ServiConnect** — Clients & Prestataires de services.

## 🛠 Stack Technique

| Composant | Version |
|---|---|
| PHP | 8.2+ |
| Symfony | 7.4 |
| Doctrine ORM | 3.3 |
| JWT Auth | LexikJWT |
| CORS | NelmioCors |
| Temps réel | Mercure (SSE) |
| Base de données | MySQL 8.0+ |

## 📁 Structure des Endpoints Principaux

```
POST   /api/auth/login          → Connexion
POST   /api/auth/register       → Inscription
POST   /api/auth/refresh        → Rafraîchir le token JWT
GET    /api/auth/logout         → Déconnexion

GET    /api/me                  → Profil de l'utilisateur connecté
DELETE /api/me                  → Supprimer son compte

GET    /api/search              → Recherche de prestataires (géolocalisation)
GET    /api/providers/{id}      → Profil d'un prestataire

GET    /api/conversations       → Liste des conversations
POST   /api/conversations       → Démarrer une conversation
POST   /api/messages            → Envoyer un message (texte, audio, photo)

GET    /api/admin/stats         → Statistiques admin
GET    /api/admin/users         → Gestion des utilisateurs (paginée)
```

## ⚙️ Installation Locale

### Prérequis
- PHP 8.2+
- Composer
- MySQL 8.0
- Symfony CLI (optionnel)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/vik-005/service-api.git
cd service-api

# 2. Installer les dépendances
composer install

# 3. Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 4. Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# 5. Créer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction

# 6. Lancer le serveur
symfony server:start
# ou
php -S localhost:8000 -t public/
```

## 🚀 Déploiement sur LWS

Voir le guide complet : [DEPLOIEMENT_LWS.md](./DEPLOIEMENT_LWS.md)

### Résumé rapide

1. Créer la base de données MySQL depuis le panel LWS
2. Uploader les fichiers (FTP ou git clone via SSH)
3. Créer `.env.local` avec vos variables de production
4. Générer les clés JWT : `php bin/console lexik:jwt:generate-keypair`
5. Migrer la BDD : `php bin/console doctrine:migrations:migrate`
6. Vider le cache : `php bin/console cache:clear --env=prod`

## 🔐 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ Soft-delete sur tous les utilisateurs
- ✅ Validation des données avec DTOs Symfony
- ✅ Protection CORS configurée
- ✅ Roles : `ROLE_USER`, `ROLE_ADMIN`, `ROLE_PROVIDER`
- ✅ Endpoint de suppression de compte `DELETE /api/me`

## 📱 Applications Clientes

| Application | Dépôt |
|---|---|
| Monorepo (Web + Mobile) | https://github.com/vik-005/serviceconnect |
| API seule (ce dépôt) | https://github.com/vik-005/service-api |

## 📝 Variables d'Environnement

Copiez `.env.example` vers `.env.local` et renseignez :

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion MySQL |
| `APP_SECRET` | Clé secrète Symfony (32 chars random) |
| `JWT_PASSPHRASE` | Passphrase pour les clés JWT |
| `CORS_ALLOW_ORIGIN` | Origines autorisées (regex) |
| `FIREBASE_SERVER_KEY` | Clé Firebase pour les push notifications |
| `MERCURE_JWT_SECRET` | Secret pour les événements temps réel |
