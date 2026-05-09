# 🔍 AUDIT EXPERT - PROBLÈME INSCRIPTION (API, WEB, MOBILE)

**Date:** 30 Avril 2026  
**Expert:** Senior Full-Stack (20+ ans)  
**Status:** 🔴 CRITIQUE - Inscription bloquée

---

## 📋 RÉSUMÉ EXÉCUTIF

L'inscription **échoue** sur web et mobile à cause de **3 problèmes majeurs**:

1. **Validation mot de passe différente** ❌
   - API: min 8, maj+min+chiffre
   - Web: min 6
   - Mobile: aucune validation

2. **Champ 'phone' incohérent** ❌
   - API: OPTIONNEL
   - Web: REQUIS (min 10)
   - Mobile: REQUIS (aucun min)

3. **Pas de gestion d'erreurs claires** ❌
   - Requête rejeta par API
   - Frontend ne comprend pas pourquoi

---

## 📊 TABLEAU COMPARATIF COMPLET

| Champ | API (Symfony) | Web (Next.js) | Mobile (Flutter) | ✅ Status |
|-------|---------------|---------------|-----------------|---------|
| **email** | ✅ Required<br>Email format | ✅ Required<br>Email format | ✅ Required<br>Email format | ✅ OK |
| **password** | ✅ Required<br>Min: **8**<br>Maj+min+chiffre | ❌ Required<br>Min: **6** | ❌ Required<br>**NO VALIDATION** | 🔴 BLOQUANT |
| **firstName** | ✅ Required<br>Min 2, Max 100 | ✅ Required<br>Min 2 | ✅ Required | ✅ OK |
| **lastName** | ✅ Required<br>Min 2, Max 100 | ✅ Required<br>Min 2 | ✅ Required | ✅ OK |
| **phone** | ⚠️ OPTIONAL<br>Phone format | ❌ REQUIRED<br>Min 10 | ❌ REQUIRED<br>No min | 🔴 BLOQUANT |
| **role** | ✅ Required<br>enum: client/provider | ✅ Required<br>enum | ✅ Required<br>enum | ✅ OK |
| **confirmPassword** | ❌ N/A | ✅ Client-side only | N/A | ℹ️ Normal |
| **selectedCategories** | ❌ N/A | ⚠️ Sent anyway | N/A | ⚠️ Ignoré |

---

## 🔴 PROBLÈME 1: VALIDATION PASSWORD INCOMPATIBLE

### API (Symfony - RegisterDto.php)
```php
#[Assert\NotBlank(message: "Le mot de passe est obligatoire")]
#[Assert\Length(
    min: 8,
    minMessage: "Le mot de passe doit contenir au moins {{ limit }} caractères",
)]
#[Assert\Regex(
    pattern: "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/",
    message: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
)]
public string $password;
```

### Web (Next.js - register/page.tsx)
```javascript
password: z.string().min(6, 'Mot de passe trop court'),
```

### Mobile (Flutter - register_screen.dart)
```dart
// ❌ AUCUNE VALIDATION POUR LE MOT DE PASSE!
// Seule validation client-side: champ requis
```

### ⚠️ IMPACT
- **Web:** Accepte "abc123" → API le rejette ❌
- **Mobile:** Accepte "abc123" → API le rejette ❌
- **Message d'erreur:** "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"

### ✅ SOLUTION
**Web & Mobile:** Mettre à jour le validateur

---

## 🔴 PROBLÈME 2: CHAMP PHONE INCOHÉRENT

### API (Symfony)
```php
#[Assert\Regex(
    pattern: "/^\+?[0-9\s\-\(\)]+$/",
    message: "Format de téléphone invalide"
)]
public ?string $phone = null;  // ← OPTIONAL!
```

### Web (Next.js)
```javascript
phone: z.string().min(10, 'Numéro de téléphone invalide'),  // REQUIS
```

### Mobile (Flutter)
```dart
_phoneController = TextEditingController();  // REQUIS, pas de validation
```

### ⚠️ IMPACT
- **API:** Phone optionnel, accepte null ou ""
- **Web:** Rejette si vide → Inscription bloquée
- **Mobile:** Rejette si vide → Inscription bloquée

### ✅ SOLUTION
**Option A (Recommandé):** Rendre phone optionnel partout
**Option B:** Rendre phone requis dans API

---

## 🔴 PROBLÈME 3: CHAMPS SUPPLÉMENTAIRES NON GÉRÉS

### Web envoie
```javascript
{
  email: "user@test.com",
  password: "Test123",
  firstName: "John",
  lastName: "Doe",
  phone: "+33612345678",
  role: "client",
  confirmPassword: "Test123",      // ❌ Non dans API
  selectedCategories: []            // ❌ Non dans API
}
```

### API attend
```php
{
  email: "user@test.com",
  password: "Test123",
  firstName: "John",
  lastName: "Doe",
  phone: "+33612345678",
  role: "client"
}
```

### ⚠️ IMPACT
- Les champs extras sont **IGNORÉS** (pas d'erreur)
- Mais compliquent le debug

---

## 📝 BODY JSON ATTENDU vs RÉEL

### ✅ BODY CORRECT (Accepté par API)
```json
{
  "email": "jean.dupont@test.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "role": "client"
}
```

### ❌ WEB ENVOIE ACTUELLEMENT
```json
{
  "email": "jean.dupont@test.com",
  "password": "pass",              // ← Min 6 au lieu de 8 + maj + min + chiffre
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "role": "client",
  "confirmPassword": "pass",       // ← Champ client-side
  "selectedCategories": []          // ← Champ non utilisé
}
```

### ❌ MOBILE ENVOIE ACTUELLEMENT
```json
{
  "email": "jean.dupont@test.com",
  "password": "pass",              // ← Aucune validation
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "",                     // ← Requis en frontend mais optionnel en API
  "role": "client"
}
```

### 📊 HEADERS

Doit inclure:
```http
Content-Type: application/json
```

---

## 🔧 PLAN DE CORRECTION RAPIDE

### ⏱️ Phase 1 - URGENT (15 min)

#### Backend API
```diff
// service-api/src/Dto/Request/RegisterDto.php
public ?string $phone = null;  // ← Reste optionnel
// Option alternative: le rendre requis
```

#### Frontend Web (Next.js)
```diff
// servi-connect-web/app/(auth)/register/page.tsx
const registerSchema = z.object({
-  password: z.string().min(6, 'Mot de passe trop court'),
+  password: z.string()
+    .min(8, 'Minimum 8 caractères')
+    .regex(/[a-z]/, 'Doit contenir une minuscule')
+    .regex(/[A-Z]/, 'Doit contenir une majuscule')
+    .regex(/\d/, 'Doit contenir un chiffre'),
-  phone: z.string().min(10, 'Numéro invalide'),
+  phone: z.string().min(10, 'Numéro invalide').optional().or(z.literal('')),  // Optionnel
});
```

#### Frontend Mobile (Flutter)
```diff
// servi_connect_mobile/lib/features/auth/presentation/register_screen.dart
_buildTextField(
  controller: _passwordController,
  label: 'Mot de passe',
  hint: '••••••••',
  icon: Icons.lock_outline,
  obscureText: true,
+  validator: (value) {
+    if (value == null || value.isEmpty) return 'Requis';
+    if (value.length < 8) return 'Min 8 caractères';
+    if (!RegExp(r'[a-z]').hasMatch(value)) return 'Une minuscule requise';
+    if (!RegExp(r'[A-Z]').hasMatch(value)) return 'Une majuscule requise';
+    if (!RegExp(r'\d').hasMatch(value)) return 'Un chiffre requis';
+    return null;
+  },
),
```

### ⏱️ Phase 2 - IMPORTANT (30 min)

#### Frontend Web - Nettoyer les champs avant envoi
```diff
// servi-connect-web/lib/api/auth.ts
export const register = async (userData: any) => {
+  // Nettoyer les champs non nécessaires
+  const cleanData = {
+    email: userData.email,
+    password: userData.password,
+    firstName: userData.firstName,
+    lastName: userData.lastName,
+    phone: userData.phone || null,  // Optionnel
+    role: userData.role,
+  };
-  const { data } = await api.post('/api/auth/register', userData);
+  const { data } = await api.post('/api/auth/register', cleanData);
   return data;
};
```

#### Frontend Web - Améliorer gestion erreurs
```diff
// servi-connect-web/app/(auth)/register/page.tsx
const registerMutation = useMutation({
  mutationFn: authApi.register,
  onSuccess: () => {
    router.push('/login');
  },
+  onError: (error: any) => {
+    const message = error.response?.data?.message || error.message;
+    toast.error(message);  // Afficher erreur API
+  },
});
```

#### Mobile - Nettoyer les champs avant envoi
```diff
// servi_connect_mobile/lib/core/services/auth_service.dart
Future<AuthResponse> register({
  required String firstName,
  required String lastName,
  required String email,
  required String password,
  required String phone,
  required String role,
}) async {
  // ...
  final response = await _dio.post(
    ApiConstants.register,
    data: {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
-     'phone': phone,  // ← Envoyer null si vide
+     'phone': phone.isEmpty ? null : phone,
      'role': role,
    },
  );
}
```

---

## ✅ VÉRIFICATION POST-CORRECTION

### Test Web
```bash
# Doit réussir avec:
{
  "email": "test@example.com",
  "password": "SecurePass123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+33612345678",
  "role": "client"
}

# Doit échouer avec:
{
  "email": "test@example.com",
  "password": "weak",  // ← Min 8 + maj + min + chiffre
  "firstName": "Test",
  "lastName": "User",
  "phone": "+33612345678",
  "role": "client"
}
```

### Test Mobile
```dart
// Tester avec test_api.dart
final response = await dio.post('/api/auth/register', data: {
  'email': 'mobile_test@example.com',
  'password': 'ValidPass123',  // ← 8+ maj + min + chiffre
  'firstName': 'Mobile',
  'lastName': 'Test',
  'phone': '+33612345678',  // ← Optionnel mais envoyé
  'role': 'client',
});

print('Status: ${response.statusCode}');
print('Response: ${response.data}');
```

---

## 🎯 CHECKLIST CORRECTION

- [ ] API: Vérifier que phone est optionnel (ou le rendre requis)
- [ ] Web: Mettre à jour validation password (min 8 + maj + min + chiffre)
- [ ] Web: Rendre phone optionnel
- [ ] Web: Nettoyer champs avant envoi (confirmPassword, selectedCategories)
- [ ] Mobile: Ajouter validation password
- [ ] Mobile: Ajouter validation phone (optionnel ou min 10)
- [ ] Mobile: Envoyer null si phone est vide
- [ ] Web: Tester inscription avec mot de passe faible (doit être rejeté)
- [ ] Mobile: Tester inscription avec mot de passe faible (doit être rejeté)
- [ ] Web: Tester sans phone (doit fonctionner)
- [ ] Mobile: Tester sans phone (doit fonctionner)

---

## 🚀 PRIORITÉ

1. **URGENT (5 min):** Corriger validation password Web & Mobile
2. **IMPORTANT (10 min):** Clarifier champ phone (requis vs optionnel)
3. **BON À FAIRE (15 min):** Nettoyer champs avant envoi

---

## 📞 QUESTIONS POUR LE PRODUCT OWNER

1. Le téléphone doit-il être **requis** ou **optionnel** lors de l'inscription ?
   - Actuellement: API = optionnel, Web = requis, Mobile = requis
   - Décision: **À clarifier**

2. Le mot de passe doit-il vraiment avoir majuscule + minuscule + chiffre ?
   - Sécurité: OUI (recommandé)
   - Mais c'est très strict pour l'UX

3. Veux-tu des **catégories de service** lors de l'inscription (mobile) ?
   - Actuellement: Web l'envoie (mais API n'en a pas besoin)
   - Décision: À clarifier

---

## 📎 FICHIERS À MODIFIER

```
API:
  service-api/src/Dto/Request/RegisterDto.php          (Vérifier phone optionnel)
  service-api/src/Controller/Api/AuthController.php    (Vérifier erreurs retournées)

Web:
  servi-connect-web/app/(auth)/register/page.tsx       (Validation schema)
  servi-connect-web/lib/api/auth.ts                    (Nettoyer données + erreurs)
  servi-connect-web/lib/hooks/useAuth.ts               (Gestion erreurs API)

Mobile:
  servi_connect_mobile/lib/features/auth/presentation/register_screen.dart  (Validation password)
  servi_connect_mobile/lib/core/services/auth_service.dart                  (Nettoyer phone)
  servi_connect_mobile/lib/features/auth/providers/auth_provider.dart       (Gestion erreurs)
```

---

## 🎓 LEÇONS APPRISES

1. **Synchroniser les DTOs:** L'API et les formulaires doivent être en sync
2. **Tester early:** Chaque champ doit être testé avant production
3. **Valider strictement:** Les deux côtés (frontend + backend)
4. **Documenter:** Garder un schéma unique de référence
5. **Gestion erreurs:** Retourner messages clairs depuis l'API

---

**Rapport généré:** 30 Avril 2026  
**Expert:** Senior Full-Stack Architecture
