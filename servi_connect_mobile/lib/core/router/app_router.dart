import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/profile_screen.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/reset_password_screen.dart';

// Placeholder screens for routes not yet fully implemented
class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Conversations')),
        body: const Center(child: Text('Conversations Screen')),
      );
}

class ConversationDetailScreen extends StatelessWidget {
  final String conversationId;
  const ConversationDetailScreen({super.key, required this.conversationId});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Conversation')),
        body: Center(child: Text('Conversation: $conversationId')),
      );
}

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Search Providers')),
        body: const Center(child: Text('Search Screen')),
      );
}

class ProviderDetailScreen extends StatelessWidget {
  final String providerId;
  const ProviderDetailScreen({super.key, required this.providerId});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Provider Details')),
        body: Center(child: Text('Provider: $providerId')),
      );
}


class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Admin Dashboard')),
        body: const Center(child: Text('Admin Dashboard Screen')),
      );
}

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/onboarding',
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: '/conversations',
        builder: (context, state) => const ConversationsScreen(),
      ),
      GoRoute(
        path: '/conversation/:id',
        builder: (context, state) {
          final conversationId = state.pathParameters['id']!;
          return ConversationDetailScreen(conversationId: conversationId);
        },
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/provider/:id',
        builder: (context, state) {
          final providerId = state.pathParameters['id']!;
          return ProviderDetailScreen(providerId: providerId);
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
    ],
    redirect: (context, state) {
      // TODO: Add auth guard logic here
      // Check if user is authenticated
      // If not authenticated and trying to access protected routes, redirect to login
      return null;
    },
  );
}
