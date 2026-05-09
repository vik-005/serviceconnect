# TODO - Tests API Messages et Notifications

## Plan d'implémentation
- [x] 1. Analyser les contrôleurs API (Conversation, Message, Notification, Typing)
- [ ] 2. Créer `test_api_messages.dart` complet
  - Inscription Client + Prestataire
  - Login pour récupérer tokens et providerProfileId
  - Création conversation (`POST /api/conversations`)
  - Envoi message texte client
  - Envoi message texte provider
  - Envoi messages média (dummy audio, image, vidéo via FormData)
  - Récupération liste messages
  - Test typing indicator (`POST /api/conversations/{id}/typing`)
  - Test marquer comme lu (`PATCH /api/conversations/{id}/messages/read`)
  - Récupération notifications (`GET /api/notifications`)
- [ ] 3. Exécuter le test et corriger les erreurs au fur et à mesure
- [ ] 4. Valider que tous les endpoints passent
