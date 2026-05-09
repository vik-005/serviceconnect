/// Script de test pour vérifier l'inscription corrigée
/// Utilisation: cd servi_connect_mobile && dart run test_registration.dart

import 'package:dio/dio.dart';
import 'dart:io';

void main() async {
  final dio = Dio(BaseOptions(
    baseUrl: 'http://localhost:8000',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Content-Type': 'application/json'},
    validateStatus: (status) => true,
  ));

  print('╔════════════════════════════════════════════════════════════╗');
  print('║         TEST INSCRIPTION CORRIGÉE - SERVICONNECT          ║');
  print('╚════════════════════════════════════════════════════════════╝\n');

  const baseUrl = 'http://localhost:8000';
  final timestamp = DateTime.now().millisecondsSinceEpoch;

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Health Check
  // ═══════════════════════════════════════════════════════════
  print('TEST 1: Health Check');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    final healthResponse = await dio.get('/api/health');
    if (healthResponse.statusCode == 200) {
      print('✅ API disponible sur $baseUrl');
    } else {
      print('❌ API non disponible. Status: ${healthResponse.statusCode}');
      exit(1);
    }
  } catch (e) {
    print('❌ Erreur de connexion: $e');
    print(
        '   Démarrez l\'API avec: cd service-api && php -S localhost:8000 -t public');
    exit(1);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Inscription avec mot de passe VALIDE
  // ═══════════════════════════════════════════════════════════
  print('\nTEST 2: Inscription avec mot de passe VALIDE');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  final validPassword = 'SecurePass123'; // ✅ 8+ maj + min + chiffre
  final testData = {
    'email': 'test_valid_$timestamp@test.com',
    'password': validPassword,
    'firstName': 'Test',
    'lastName': 'Valid',
    'phone': '+33612345678',
    'role': 'client',
  };

  print('📤 Envoi: ${testData['email']}, Password: $validPassword');
  final validResponse = await dio.post('/api/auth/register', data: testData);

  print('📊 Status: ${validResponse.statusCode}');
  if (validResponse.statusCode == 201) {
    print('✅ SUCCÈS - Inscription réussie');
    print('📄 Response: ${validResponse.data}');
  } else {
    print('❌ ERREUR - ${validResponse.data}');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Inscription avec mot de passe INVALIDE (trop court)
  // ═══════════════════════════════════════════════════════════
  print('\nTEST 3: Inscription avec mot de passe INVALIDE (trop court)');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  final shortPassword = 'Short1'; // ❌ Moins de 8 caractères
  final testData2 = {
    'email': 'test_short_$timestamp@test.com',
    'password': shortPassword,
    'firstName': 'Test',
    'lastName': 'Short',
    'phone': '+33612345678',
    'role': 'client',
  };

  print('📤 Envoi: ${testData2['email']}, Password: $shortPassword');
  final shortResponse = await dio.post('/api/auth/register', data: testData2);

  print('📊 Status: ${shortResponse.statusCode}');
  if (shortResponse.statusCode != 201) {
    print('✅ CORRECTEMENT REJETÉ');
    print(
        '📄 Erreur: ${shortResponse.data['message'] ?? shortResponse.data['errors']}');
  } else {
    print('❌ ERREUR - Devrait être rejeté mais a été accepté!');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Inscription sans majuscule dans mot de passe
  // ═══════════════════════════════════════════════════════════
  print('\nTEST 4: Inscription sans majuscule');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  final noUpperPassword = 'securepass123'; // ❌ Pas de majuscule
  final testData3 = {
    'email': 'test_noupper_$timestamp@test.com',
    'password': noUpperPassword,
    'firstName': 'Test',
    'lastName': 'NoUpper',
    'phone': '+33612345678',
    'role': 'client',
  };

  print('📤 Envoi: ${testData3['email']}, Password: $noUpperPassword');
  final noUpperResponse = await dio.post('/api/auth/register', data: testData3);

  print('📊 Status: ${noUpperResponse.statusCode}');
  if (noUpperResponse.statusCode != 201) {
    print('✅ CORRECTEMENT REJETÉ');
    print(
        '📄 Erreur: ${noUpperResponse.data['message'] ?? noUpperResponse.data['errors']}');
  } else {
    print('❌ ERREUR - Devrait être rejeté!');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Inscription SANS téléphone (optionnel)
  // ═══════════════════════════════════════════════════════════
  print('\nTEST 5: Inscription SANS téléphone (optionnel)');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  final testData4 = {
    'email': 'test_nophone_$timestamp@test.com',
    'password': 'ValidPass123',
    'firstName': 'Test',
    'lastName': 'NoPhone',
    'phone': null, // ← Pas de téléphone
    'role': 'client',
  };

  print('📤 Envoi: ${testData4['email']}, Phone: null (optionnel)');
  final noPhoneResponse = await dio.post('/api/auth/register', data: testData4);

  print('📊 Status: ${noPhoneResponse.statusCode}');
  if (noPhoneResponse.statusCode == 201) {
    print('✅ SUCCÈS - Inscription sans téléphone réussie');
  } else {
    print('❌ ERREUR - ${noPhoneResponse.data}');
  }

  // ═══════════════════════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════════════════════
  print('\n╔════════════════════════════════════════════════════════════╗');
  print('║                       RÉSUMÉ TEST                         ║');
  print('╚════════════════════════════════════════════════════════════╝\n');

  print('✅ Test 1 (Health): PASSÉ');
  print(validResponse.statusCode == 201
      ? '✅ Test 2 (Valide): PASSÉ'
      : '❌ Test 2 (Valide): ÉCHOUÉ');
  print(shortResponse.statusCode != 201
      ? '✅ Test 3 (Trop court): PASSÉ'
      : '❌ Test 3 (Trop court): ÉCHOUÉ');
  print(noUpperResponse.statusCode != 201
      ? '✅ Test 4 (Pas majuscule): PASSÉ'
      : '❌ Test 4 (Pas majuscule): ÉCHOUÉ');
  print(noPhoneResponse.statusCode == 201
      ? '✅ Test 5 (Sans phone): PASSÉ'
      : '❌ Test 5 (Sans phone): ÉCHOUÉ');

  print(
      '\n🎯 Tous les tests doivent être en ✅ pour que l\'inscription fonctionne\n');
}
