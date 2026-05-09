# Service API Installation TODO (based on REDAME2.md)

Status: [ ] Not started

## Steps:

### 1. Install Missing Composer Dependencies
```
cd service-api
composer require lexik/jwt-authentication-bundle symfony/mercure-bundle vich/uploader-bundle nelmio/cors-bundle nelmio/api-doc-bundle
```
[ ] Completed

### 2. Create Bundle Config Files ✓
- [x] config/packages/lexik_jwt_authentication.yaml
- [x] config/packages/mercure.yaml
- [x] config/packages/nelmio_cors.yaml
- [x] config/packages/vich_uploader.yaml
- [x] config/packages/messenger.yaml
- [x] config/packages/rate_limiter.yaml

### 3. Create Routes ✓
- [x] config/routes/api.yaml
- [x] config/routes/admin.yaml

### 4. Generate JWT Keys
```
cd service-api
bin/console lexik:jwt:generate-keypair
```
[ ] Completed
Note: Set JWT_PASSPHRASE in .env

### 5. Update .env Variables
Add/update:
- DATABASE_URL
- JWT_SECRET_KEY, JWT_PUBLIC_KEY, JWT_PASSPHRASE
- MERCURE_URL, MERCURE_JWT_SECRET
- MAILER_DSN
- APP_UPLOAD_DIR
[ ] Completed

### 6. Database Setup
```
bin/console doctrine:database:create
bin/console make:migration
bin/console doctrine:migrations:migrate
```
[ ] Completed

### 7. Create Uploads Directory
```
mkdir public\uploads\avatars public\uploads\media public\uploads\portfolio
```
[ ] Completed

### 8. Start Mercure Hub
```
docker run -it --rm -p 3000:80 -v %cd%/config/jwt:/container/nginx/certs -e JWT_KEYPAIR_PASSPHRASE=your_passphrase bubkoo/mercure
```
[ ] Running on port 3000

### 9. Test API
```
symfony server:start --port=8000 -d
curl http://localhost:8000
```
[ ] API running

### 10. Clear Cache & Verify
```
bin/console cache:clear
bin/console debug:container lexik_jwt
```
[ ] All bundles registered

Status: [ ] Completed ✅
