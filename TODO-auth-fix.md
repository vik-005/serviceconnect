# JWT Auth Fix TODO

[ ] 1. composer require lexik/jwt-authentication-bundle symfony/mailer

[ ] 2. bin/console lexik:jwt:generate-keypair --overwrite --no-interaction --passphrase="your_passphrase"

[ ] 3. Update .env.local:
```
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase
MAILER_DSN=smtp://localhost:1025?verify_peer=0
```

[ ] 4. Update security.yaml firewall

[ ] 5. Implement real JWT in AuthService.php

[ ] 6. bin/console cache:clear

[ ] 7. Test register/login
