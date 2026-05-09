# Guide de Test API - ServiConnect Mobile

## Vérification de la Liaison API

### Services Créés

La couche de service mobile est maintenant complètement intégrée avec l'API :

1. **AuthService** (`core/services/auth_service.dart`)
   - ✅ Register : POST `/api/auth/register`
   - ✅ Login : POST `/api/auth/login`
   - ✅ Get Profile : GET `/api/auth/profile`
   - ✅ Refresh Token : POST `/api/auth/refresh`
   - ✅ Logout : POST `/api/auth/logout`
   - ✅ Update Profile : PUT `/api/auth/profile`

2. **ConversationService** (`core/services/conversation_service.dart`)
   - ✅ Fetch Conversations : GET `/api/conversations`
   - ✅ Get Conversation Details : GET `/api/conversations/{id}`
   - ✅ Get Messages : GET `/api/conversations/{id}/messages`
   - ✅ Send Message : POST `/api/conversations/{id}/messages`
   - ✅ Mark as Read : POST `/api/conversations/{id}/messages/read`
   - ✅ Send Typing Indicator : POST `/api/conversations/{id}/typing`
   - ✅ Create Conversation : POST `/api/conversations`
   - ✅ Delete Conversation : DELETE `/api/conversations/{id}`

3. **ProviderService** (`core/services/provider_service.dart`)
   - ✅ Search Providers : GET `/api/search/providers`
   - ✅ Get Provider Detail : GET `/api/providers/{id}`
   - ✅ Get Provider Reviews : GET `/api/providers/{id}/reviews`
   - ✅ Get All Providers : GET `/api/providers`
   - ✅ Get Categories : GET `/api/categories`
   - ✅ Submit Review : POST `/api/providers/{id}/reviews/submit`
   - ✅ Get Banners : GET `/api/banners`

### Configuration de l'API

L'API est configurée dans `core/constants/api_constants.dart` :

```dart
// Par défaut (développement local)
baseUrl = 'http://localhost:8000'

// En production, utiliser les variables d'environnement :
// API_BASE_URL, MERCURE_URL, UPLOADS_BASE_URL
```

### Test de Connexion

#### 1. Vérifier que l'API est en cours d'exécution

```bash
cd service-api
docker-compose up -d
# L'API doit être accessible sur http://localhost:8000
```

#### 2. Tester la connexion de base

Utilisez le fichier `core/network/api_test.dart` pour tester :

```dart
import 'package:servi_connect_mobile/core/network/api_test.dart';

// Tester la connexion
final isConnected = await ApiConnectionTest.testConnection();
print('API Connected: $isConnected');

// Tester le login
final loginSuccess = await ApiConnectionTest.testLogin(
  'test@example.com',
  'password123'
);
print('Login Success: $loginSuccess');
```

#### 3. Tester manuellement avec Postman ou curl

```bash
# Test de connexion
curl http://localhost:8000/health

# Test du login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Réponse attendue :
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "...",
  "user": { ... }
}
```

### Pages Optimisées

#### 1. **Login Screen** (`features/auth/presentation/login_screen.dart`)
   - ✅ Icônes Flutter natives (pas de lucide_react)
   - ✅ Connexion à AuthService
   - ✅ Validation des entrées
   - ✅ Gestion des erreurs
   - ✅ Stockage sécurisé du token JWT

#### 2. **Register Screen** (`features/auth/presentation/register_screen.dart`)
   - ✅ Formulaire complet avec validation
   - ✅ Intégration AuthService
   - ✅ Gestion des erreurs API
   - ✅ Navigation vers login après succès

#### 3. **Conversation List Screen** (`features/conversations/presentation/conversation_list_screen.dart`)
   - ✅ Affichage des conversations
   - ✅ Intégration ConversationService
   - ✅ Icônes Flutter natives
   - ✅ Rafraîchissement des données

#### 4. **Chat Screen** (`features/conversations/presentation/chat_screen.dart`)
   - ✅ Affichage des messages
   - ✅ Envoi de messages via ConversationService
   - ✅ Support des notifications avec Mercure
   - ✅ Indicateur de saisie (typing)

### Flux d'Authentification

```
1. Utilisateur se connecte/s'inscrit
   ↓
2. Mobile envoie identifiants à AuthService
   ↓
3. API retourne JWT token + refresh token
   ↓
4. Mobile stocke les tokens (sécurisé)
   ↓
5. DioClient ajoute automatiquement Authorization header
   ↓
6. Toutes les requêtes ultérieures sont authentifiées
```

### Flux de Conversation

```
1. Utilisateur ouvre conversations
   ↓
2. Mobile appelle ConversationService.fetchConversations()
   ↓
3. API retourne liste des conversations
   ↓
4. Utilisateur sélectionne une conversation
   ↓
5. Mobile appelle ConversationService.getMessages()
   ↓
6. Messages affichés dans la UI
   ↓
7. Utilisateur envoie un message
   ↓
8. Mobile appelle ConversationService.sendMessage()
   ↓
9. API enregistre et diffuse le message via Mercure
```

### Dépannage

#### L'API n'est pas accessible
```bash
# Vérifier que l'API est en cours d'exécution
curl http://localhost:8000/health

# Vérifier les logs
cd service-api && docker-compose logs -f app
```

#### Le login échoue
```bash
# Vérifier les identifiants
# Vérifier que l'utilisateur existe dans l'API
# Vérifier les logs d'API pour les erreurs
```

#### Les messages ne sont pas reçus
```bash
# Vérifier que Mercure est en cours d'exécution
# Vérifier les logs de Mercure
# Vérifier que le client est abonné au bon topic
```

### Fichiers Importants

- **API Constants** : `lib/core/constants/api_constants.dart`
- **Auth Service** : `lib/core/services/auth_service.dart`
- **Conversation Service** : `lib/core/services/conversation_service.dart`
- **Provider Service** : `lib/core/services/provider_service.dart`
- **API Test Utils** : `lib/core/network/api_test.dart`
- **DioClient** : `lib/core/network/dio_client.dart`

### Prochaines Étapes

1. ✅ Intégration API complétée
2. ✅ Services optimisés créés
3. ⏳ Tests unitaires (à ajouter)
4. ⏳ Tests d'intégration (à ajouter)
5. ⏳ Déploiement en production

