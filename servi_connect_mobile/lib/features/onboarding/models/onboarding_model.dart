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
    backgroundColor: const Color(0xFFEFF6FF), // Soft Blue
    iconColor: const Color(0xFF2563EB), // Sky Blue
  ),
  OnboardingPage(
    title: 'Cherchez avec Facilité',
    description:
        'Parcourez des milliers de prestataires vérifiés et trouvez celui qui correspond à vos besoins',
    icon: Icons.search_rounded,
    backgroundColor: const Color(0xFFFFF7ED), // Soft Orange
    iconColor: const Color(0xFFF97316), // Orange
  ),
  OnboardingPage(
    title: 'Communiquez Directement',
    description:
        'Messagerie instantanée, appels vidéo et partage de fichiers avec les prestataires',
    icon: Icons.chat_bubble_outline_rounded,
    backgroundColor: const Color(0xFFF0FDFA), // Soft Cyan/Blue
    iconColor: const Color(0xFF0D9488), // Cyan-Blue
  ),
  OnboardingPage(
    title: 'Paiements Sécurisés',
    description:
        'Transactions protégées et garanties pour votre tranquillité d\'esprit',
    icon: Icons.gpp_good_rounded,
    backgroundColor: const Color(0xFFFEF3C7), // Light Warm Orange
    iconColor: const Color(0xFFD97706), // Warm Orange
  ),
  OnboardingPage(
    title: 'C\'est Parti !',
    description:
        'Créez votre compte et commencez à découvrir les meilleurs services',
    icon: Icons.rocket_launch_rounded,
    backgroundColor: const Color(0xFFECF2FF), // Indigo/Blue
    iconColor: const Color(0xFF4F46E5), // Indigo
  ),
];

