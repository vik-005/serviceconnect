import 'package:flutter/material.dart';

class OnboardingPage {
  final String title;
  final String description;
  final IconData icon;
  final Color backgroundColor;
  final Color iconColor;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.icon,
    this.backgroundColor = const Color(0xFFF5F5F5),
    this.iconColor = const Color(0xFF2563EB),
  });
}

final List<OnboardingPage> onboardingPages = [
  OnboardingPage(
    title: 'Bienvenue sur ServiConnect',
    description:
        'Trouvez les meilleurs prestataires de services près de chez vous en quelques clics',
    icon: Icons.home_repair_service,
    backgroundColor: const Color(0xFFE3F2FD),
    iconColor: const Color(0xFF1976D2),
  ),
  OnboardingPage(
    title: 'Cherchez avec Facilité',
    description:
        'Parcourez des milliers de prestataires vérifiés et trouvez celui qui correspond à vos besoins',
    icon: Icons.search,
    backgroundColor: const Color(0xFFF3E5F5),
    iconColor: const Color(0xFF7B1FA2),
  ),
  OnboardingPage(
    title: 'Communiquez Directement',
    description:
        'Messagerie instantanée, appels vidéo et partage de fichiers avec les prestataires',
    icon: Icons.chat_bubble,
    backgroundColor: const Color(0xFFE8F5E9),
    iconColor: const Color(0xFF388E3C),
  ),
  OnboardingPage(
    title: 'Paiements Sécurisés',
    description:
        'Transactions protégées et garanties pour votre tranquillité d\'esprit',
    icon: Icons.security,
    backgroundColor: const Color(0xFFFFF3E0),
    iconColor: const Color(0xFFF57C00),
  ),
  OnboardingPage(
    title: 'C\'est Parti !',
    description:
        'Créez votre compte et commencez à découvrir les meilleurs services',
    icon: Icons.rocket_launch,
    backgroundColor: const Color(0xFFCE93D8),
    iconColor: const Color(0xFFE91E63),
  ),
];
