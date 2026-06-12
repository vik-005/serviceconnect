import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../providers/banner_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';

// ════════════════════════════════════════════════
// HOME SCREEN
// ════════════════════════════════════════════════
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(user?.firstName ?? 'Ami'),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSearchBar(context),
                  const SizedBox(height: 32),
                  _buildPromoBanner(ref),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Catégories', () {}),
                  const SizedBox(height: 16),
                  _buildCategoriesGrid(),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Top Prestataires', () {}),
                  const SizedBox(height: 16),
                  _buildTopProvidersList(),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── AppBar ───
  Widget _buildAppBar(String name) {
    return SliverAppBar(
      expandedHeight: 120,
      floating: true,
      pinned: true,
      backgroundColor: AppColors.primary,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        titlePadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        title: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Bonjour,',
                  style: TextStyle(
                      fontSize: 12,
                      color: Colors.white70,
                      fontWeight: FontWeight.w500),
                ),
                Text(
                  name,
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Colors.white),
                ),
              ],
            ),
            const Spacer(),
            Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                onPressed: () {},
                icon: const Icon(Icons.notifications,
                    color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Search Bar ───
  Widget _buildSearchBar(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Navigate to search
      },
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: AppColors.textMuted),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'De quel service avez-vous besoin ?',
                style: TextStyle(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w500),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.tune,
                  size: 16, color: AppColors.primary),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Promo Banner (dynamic from API) ───
  Widget _buildPromoBanner(WidgetRef ref) {
    final bannersAsync = ref.watch(homeBannersProvider);

    return bannersAsync.when(
      data: (banners) {
        if (banners.isEmpty) return _buildDefaultBanner();
        return _BannerCarousel(banners: banners);
      },
      loading: () => Container(
        width: double.infinity,
        height: 160,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(30),
        ),
        child: const Center(child: CircularProgressIndicator()),
      ),
      error: (err, stack) => _buildDefaultBanner(),
    );
  }

  // ─── Default Banner (fallback) ───
  Widget _buildDefaultBanner() {
    return Container(
      width: double.infinity,
      height: 160,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            bottom: -20,
            child: Icon(Icons.auto_awesome,
                size: 150, color: Colors.white.withOpacity(0.1)),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'PROMO DU MOIS',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  '-20% sur votre\npremière prestation',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      height: 1.2),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Section header ───
  Widget _buildSectionHeader(String title, VoidCallback onSeeAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary),
        ),
        TextButton(
          onPressed: onSeeAll,
          child: const Text(
            'Voir tout',
            style: TextStyle(
                color: AppColors.primary, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }

  // ─── Categories Grid ───
  Widget _buildCategoriesGrid() {
    final categories = [
      {
        'name': 'Plomberie',
        'icon': Icons.water_drop,
        'color': const Color(0xFF0EA5E9)
      },
      {
        'name': 'Électricité',
        'icon': Icons.flash_on,
        'color': const Color(0xFFF97316)
      },
      {
        'name': 'Ménage',
        'icon': Icons.cleaning_services,
        'color': const Color(0xFF8B5CF6)
      },
      {
        'name': 'Peinture',
        'icon': Icons.format_paint,
        'color': const Color(0xFF10B981)
      },
      {
        'name': 'Jardinage',
        'icon': Icons.grass,
        'color': const Color(0xFF22C55E)
      },
      {
        'name': 'Déménagement',
        'icon': Icons.local_shipping,
        'color': const Color(0xFFF59E0B)
      },
      {
        'name': 'Menuiserie',
        'icon': Icons.handyman,
        'color': const Color(0xFF6366F1)
      },
      {
        'name': 'Autre',
        'icon': Icons.more_horiz,
        'color': const Color(0xFF64748B)
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 16,
        crossAxisSpacing: 12,
        childAspectRatio: 0.78,
      ),
      itemBuilder: (context, index) {
        final cat = categories[index];
        final color = cat['color'] as Color;
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                    color: color.withOpacity(0.2), width: 1),
              ),
              child: Icon(cat['icon'] as IconData,
                  color: color, size: 24),
            ),
            const SizedBox(height: 6),
            Text(
              cat['name'] as String,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary),
            ),
          ],
        );
      },
    );
  }

  // ─── Top Providers horizontal list ───
  Widget _buildTopProvidersList() {
    final providers = [
      {
        'name': 'Jean K.',
        'role': 'Électricien Pro',
        'rating': '4.9',
        'reviews': '128'
      },
      {
        'name': 'Marie D.',
        'role': 'Plombière',
        'rating': '4.8',
        'reviews': '94'
      },
      {
        'name': 'Paul M.',
        'role': 'Peintre Expert',
        'rating': '5.0',
        'reviews': '211'
      },
    ];

    return SizedBox(
      height: 210,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: providers.length,
        itemBuilder: (context, index) {
          final p = providers[index];
          return Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor:
                          AppColors.primary.withOpacity(0.1),
                      child: Text(
                        p['name']![0],
                        style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                            fontSize: 22),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppColors.statusOnline,
                          shape: BoxShape.circle,
                          border:
                              Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(p['name']!,
                    style: const TextStyle(
                        fontWeight: FontWeight.w900, fontSize: 14),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(p['role']!,
                    style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star,
                          color: AppColors.warning, size: 13),
                      const SizedBox(width: 4),
                      Text(p['rating']!,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 12)),
                      Text(' (${p['reviews']})',
                          style: const TextStyle(
                              fontSize: 10,
                              color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ════════════════════════════════════════════════
// BANNER CAROUSEL WIDGET (separate class)
// ════════════════════════════════════════════════
class _BannerCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> banners;
  const _BannerCarousel({required this.banners});

  @override
  State<_BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<_BannerCarousel> {
  int _currentIndex = 0;
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  String _getFullImageUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return '${ApiConstants.baseUrl}$url';
  }

  Future<void> _launchUrl(String? urlString) async {
    if (urlString == null || urlString.isEmpty) return;
    final url = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 160,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) =>
                setState(() => _currentIndex = index),
            itemCount: widget.banners.length,
            itemBuilder: (context, index) {
              final banner = widget.banners[index];
              final imageUrl = banner['imageUrl'] as String? ?? '';
              final title = banner['title'] as String? ?? '';
              final targetUrl = banner['targetUrl'] as String?;

              return GestureDetector(
                onTap: () => _launchUrl(targetUrl),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 12,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        imageUrl.isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: _getFullImageUrl(imageUrl),
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  color: Colors.grey[200],
                                  child: const Center(
                                    child: CircularProgressIndicator(),
                                  ),
                                ),
                                errorWidget: (context, url, error) =>
                                    Container(
                                  color: AppColors.primary,
                                  child: const Icon(Icons.broken_image,
                                      color: Colors.white, size: 40),
                                ),
                              )
                            : Container(
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppColors.primary,
                                      AppColors.primaryDark
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                ),
                              ),
                        // Dark overlay for text readability
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.black.withOpacity(0.55),
                                Colors.black.withOpacity(0.1),
                              ],
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.secondary,
                                  borderRadius:
                                      BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'ANNONCE SPONSORISÉE',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 8,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  height: 1.3,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 10),
        // Page indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.banners.length,
            (index) => AnimatedContainer(
              duration: const Duration(milliseconds: 280),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              height: 6,
              width: _currentIndex == index ? 22 : 6,
              decoration: BoxDecoration(
                color: _currentIndex == index
                    ? AppColors.primary
                    : AppColors.textMuted.withOpacity(0.3),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
