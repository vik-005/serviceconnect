# TODO - Communication Backend Symfony (JWT) <-> Frontend Next.js (CORS)

## Étape 1 — Audit & correctifs CORS + headers
- [ ] Lire/valider la config `service-api/config/packages/nelmio_cors.yaml`
- [ ] Vérifier `.env` via le code (ne pas lire directement les fichiers .env si interdit) : `CORS_ALLOW_ORIGIN`, éventuel `CORS_ALLOW_CREDENTIALS`
- [ ] Forcer les réponses OPTIONS preflight pour `/api/**` et headers `Authorization`

## Étape 2 — Fix JWT / refresh token contract
- [ ] Vérifier la forme JSON attendue par `AuthController::refresh` (clé `refresh_token`)
- [ ] Corriger `servi-connect-web/lib/api/axios.ts` pour éviter bugs: double requête, retry incorrect, race conditions
- [ ] Ajouter une protection contre le refresh concurrent (single-flight) et empêcher les boucles

## Étape 3 — Routes sécurisées et “Authorization Bearer”
- [ ] Ajouter un mécanisme “/api/me” sécurisé (ou aligner avec existant)
- [ ] Valider security.yaml + roles (USER/ADMIN)

## Étape 4 — Mercure (SSE/EventSource)
- [ ] Vérifier `MERCURE_PUBLIC_URL` et clés Mercure dans `service-api/config/packages/mercure.yaml`
- [ ] Ajouter côté frontend EventSource avec token (JWT Mercure si nécessaire)

## Étape 5 — CRUD exemple sécurisé (pro)
- [ ] Créer une Entity Doctrine (ex: `Post`)
- [ ] Générer migration
- [ ] CRUD endpoint protégé via controller
- [ ] Consommation côté Next.js

## Étape 6 — Production-ready
- [ ] Ajouter scripts / commandes de démarrage et variables dev/prod
- [ ] Ajouter checklist sécurité (CSP, rate-limiter, logs)


