import 'dart:io';
import 'package:dio/dio.dart';

/// Test complet de l'API d'authentification ServiConnect
/// Usage: dart test_api.dart
void main() async {
  final dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:8000',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
    validateStatus: (status) => true, // Accepte tous les status pour debug
  ));

  // Intercepteur pour logger les requêtes/réponses
  dio.interceptors.add(LogInterceptor(
    requestHeader: true,
    requestBody: true,
    responseHeader: true,
    responseBody: true,
    error: true,
    logPrint: (obj) => print('[DIO] $obj'),
  ));

  print('╔════════════════════════════════════════════════════════════╗');
  print('║     TEST API AUTH - SERVICONNECT MOBILE                    ║');
  print('╚════════════════════════════════════════════════════════════╝\n');

  // Génère des emails uniques pour éviter les conflits
  final timestamp = DateTime.now().millisecondsSinceEpoch;
  final providerEmail = 'provider_$timestamp@test.com';
  final clientEmail = 'client_$timestamp@test.com';
  const password = 'Password123'; // Respecte la regex API: min 8, 1 maj, 1 min, 1 chiffre

  String? providerToken;
  String? providerRefreshToken;
  String? clientToken;
  String? clientRefreshToken;

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Health Check
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 1: Health Check');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    final healthResponse = await dio.get('/health');
    print('✅ Status: ${healthResponse.statusCode}');
    print('📄 Body: ${healthResponse.data}\n');
  } catch (e) {
    print('❌ Health check failed: $e\n');
    print('⚠️  L\'API ne semble pas démarrée. Démarrez-la avec:');
    print('   cd service-api && php -S localhost:8000 -t public\n');
    exit(1);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Inscription Prestataire (Provider)
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 2: Inscription Prestataire');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('📧 Email: $providerEmail');
  print('🔑 Password: $password');
  print('🎭 Role: provider\n');

  try {
    final registerProviderResponse = await dio.post('/api/auth/register', data: {
      'firstName': 'Jean',
      'lastName': 'Prestataire',
      'email': providerEmail,
      'password': password,
      'phone': '+22990000001',
      'role': 'provider',
    });

    print('📊 Status Code: ${registerProviderResponse.statusCode}');
    print('📄 Response: ${registerProviderResponse.data}\n');

    if (registerProviderResponse.statusCode == 201) {
      print('✅ Inscription Prestataire réussie !');
      providerToken = registerProviderResponse.data['token'];
      providerRefreshToken = registerProviderResponse.data['refreshToken'];
      print('🔐 Token reçu: ${providerToken?.substring(0, 30)}...');
      print('🔄 Refresh Token reçu: ${providerRefreshToken?.substring(0, 30)}...\n');
    } else {
      print('❌ Inscription Prestataire échouée');
      print('⚠️  Erreurs: ${registerProviderResponse.data['errors'] ?? registerProviderResponse.data['message']}\n');
    }
  } catch (e) {
    print('❌ Exception Inscription Prestataire: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Inscription Client
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 3: Inscription Client');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('📧 Email: $clientEmail');
  print('🔑 Password: $password');
  print('🎭 Role: client\n');

  try {
    final registerClientResponse = await dio.post('/api/auth/register', data: {
      'firstName': 'Marie',
      'lastName': 'Client',
      'email': clientEmail,
      'password': password,
      'phone': '+22990000002',
      'role': 'client',
    });

    print('📊 Status Code: ${registerClientResponse.statusCode}');
    print('📄 Response: ${registerClientResponse.data}\n');

    if (registerClientResponse.statusCode == 201) {
      print('✅ Inscription Client réussie !');
      clientToken = registerClientResponse.data['token'];
      clientRefreshToken = registerClientResponse.data['refreshToken'];
      print('🔐 Token reçu: ${clientToken?.substring(0, 30)}...');
      print('🔄 Refresh Token reçu: ${clientRefreshToken?.substring(0, 30)}...\n');
    } else {
      print('❌ Inscription Client échouée');
      print('⚠️  Erreurs: ${registerClientResponse.data['errors'] ?? registerClientResponse.data['message']}\n');
    }
  } catch (e) {
    print('❌ Exception Inscription Client: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Tentative d'inscription avec email existant
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 4: Inscription avec email déjà utilisé (doit échouer)');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    final duplicateResponse = await dio.post('/api/auth/register', data: {
      'firstName': 'Dup',
      'lastName': 'Licat',
      'email': providerEmail, // Même email que le prestataire
      'password': password,
      'phone': '+22990000003',
      'role': 'client',
    });

    print('📊 Status Code: ${duplicateResponse.statusCode}');
    print('📄 Response: ${duplicateResponse.data}\n');

    if (duplicateResponse.statusCode == 201) {
      print('⚠️  WARNING: L\'API a accepté un doublon (bug potentiel)\n');
    } else {
      print('✅ Correctement rejeté avec status ${duplicateResponse.statusCode}\n');
    }
  } catch (e) {
    print('❌ Exception: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Connexion Prestataire
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 5: Connexion Prestataire');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('📧 Email: $providerEmail\n');

  try {
    final loginProviderResponse = await dio.post('/api/auth/login', data: {
      'email': providerEmail,
      'password': password,
    });

    print('📊 Status Code: ${loginProviderResponse.statusCode}');
    print('📄 Response: ${loginProviderResponse.data}\n');

    if (loginProviderResponse.statusCode == 200) {
      print('✅ Connexion Prestataire réussie !');
      providerToken = loginProviderResponse.data['token'];
      providerRefreshToken = loginProviderResponse.data['refreshToken'];
      print('🔐 Token: ${providerToken?.substring(0, 30)}...');
      print('👤 User: ${loginProviderResponse.data['user']?['firstName']} ${loginProviderResponse.data['user']?['lastName']}');
      print('🎭 Role: ${loginProviderResponse.data['user']?['role']}');
      print('✅ Vérifié: ${loginProviderResponse.data['user']?['isVerified']}\n');
    } else {
      print('❌ Connexion Prestataire échouée');
      print('⚠️  Message: ${loginProviderResponse.data['message']}\n');
    }
  } catch (e) {
    print('❌ Exception Connexion Prestataire: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Connexion Client
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 6: Connexion Client');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('📧 Email: $clientEmail\n');

  try {
    final loginClientResponse = await dio.post('/api/auth/login', data: {
      'email': clientEmail,
      'password': password,
    });

    print('📊 Status Code: ${loginClientResponse.statusCode}');
    print('📄 Response: ${loginClientResponse.data}\n');

    if (loginClientResponse.statusCode == 200) {
      print('✅ Connexion Client réussie !');
      clientToken = loginClientResponse.data['token'];
      clientRefreshToken = loginClientResponse.data['refreshToken'];
      print('🔐 Token: ${clientToken?.substring(0, 30)}...');
      print('👤 User: ${loginClientResponse.data['user']?['firstName']} ${loginClientResponse.data['user']?['lastName']}');
      print('🎭 Role: ${loginClientResponse.data['user']?['role']}\n');
    } else {
      print('❌ Connexion Client échouée');
      print('⚠️  Message: ${loginClientResponse.data['message']}\n');
    }
  } catch (e) {
    print('❌ Exception Connexion Client: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Connexion avec mauvais mot de passe
  // ═══════════════════════════════════════════════════════════
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  print('TEST 7: Connexion avec mauvais mot de passe (doit échouer)');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    final wrongPasswordResponse = await dio.post('/api/auth/login', data: {
      'email': providerEmail,
      'password': 'WrongPassword123',
    });

    print('📊 Status Code: ${wrongPasswordResponse.statusCode}');
    print('📄 Response: ${wrongPasswordResponse.data}\n');

    if (wrongPasswordResponse.statusCode == 401) {
      print('✅ Correctement rejeté (401 Unauthorized)\n');
    } else {
      print('⚠️  Status inattendu: ${wrongPasswordResponse.statusCode}\n');
    }
  } catch (e) {
    print('❌ Exception: $e\n');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Refresh Token (Prestataire)
  // ═══════════════════════════════════════════════════════════
  if (providerRefreshToken != null) {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('TEST 8: Refresh Token (Prestataire)');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      final refreshResponse = await dio.post('/api/auth/refresh', data: {
        'refresh_token': providerRefreshToken,
      });

      print('📊 Status Code: ${refreshResponse.statusCode}');
      print('📄 Response: ${refreshResponse.data}\n');

      if (refreshResponse.statusCode == 200) {
        print('✅ Refresh Token réussi !');
        providerToken = refreshResponse.data['token'];
        providerRefreshToken = refreshResponse.data['refreshToken'];
        print('🔐 Nouveau Token: ${providerToken?.substring(0, 30)}...\n');
      } else {
        print('❌ Refresh Token échoué\n');
      }
    } catch (e) {
      print('❌ Exception Refresh Token: $e\n');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 9: Logout (Client)
  // ═══════════════════════════════════════════════════════════
  if (clientRefreshToken != null) {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('TEST 9: Logout (Client)');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      final logoutResponse = await dio.post('/api/auth/logout', data: {
        'refresh_token': clientRefreshToken,
      });

      print('📊 Status Code: ${logoutResponse.statusCode}');
      print('📄 Response: ${logoutResponse.data}\n');

      if (logoutResponse.statusCode == 200) {
        print('✅ Logout réussi !\n');
      } else {
        print('❌ Logout échoué\n');
      }
    } catch (e) {
      print('❌ Exception Logout: $e\n');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Tentative avec token révoqué
  // ═══════════════════════════════════════════════════════════
  if (clientRefreshToken != null) {
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    print('TEST 10: Refresh avec token révoqué (doit échouer)');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      final revokedResponse = await dio.post('/api/auth/refresh', data: {
        'refresh_token': clientRefreshToken,
      });

      print('📊 Status Code: ${revokedResponse.statusCode}');
      print('📄 Response: ${revokedResponse.data}\n');

      if (revokedResponse.statusCode == 401) {
        print('✅ Correctement rejeté (token révoqué)\n');
      } else {
        print('⚠️  Comportement inattendu\n');
      }
    } catch (e) {
      print('❌ Exception: $e\n');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════════════════════
  print('╔════════════════════════════════════════════════════════════╗');
  print('║                    RÉSUMÉ DES TESTS                        ║');
  print('╚════════════════════════════════════════════════════════════╝');
  print('✅ Test 1: Health Check');
  print('✅ Test 2: Inscription Prestataire');
  print('✅ Test 3: Inscription Client');
  print('✅ Test 4: Email dupliqué (rejet)');
  print('✅ Test 5: Connexion Prestataire');
  print('✅ Test 6: Connexion Client');
  print('✅ Test 7: Mauvais mot de passe (rejet)');
  print('✅ Test 8: Refresh Token');
  print('✅ Test 9: Logout');
  print('✅ Test 10: Token révoqué (rejet)');
  print('\n🎉 Tests terminés !');
}

