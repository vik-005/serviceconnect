import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../../../core/constants/app_colors.dart';
import '../../providers/search_provider.dart';

class ProviderMapView extends StatelessWidget {
  final List<ServiceProvider> providers;
  final LatLng userLocation;
  final String? mapboxToken; // Optionnel : utiliser OSM par défaut

  const ProviderMapView({
    super.key,
    required this.providers,
    required this.userLocation,
    this.mapboxToken,
  });

  @override
  Widget build(BuildContext context) {
    // Si un mapboxToken est fourni, on utilise Mapbox, sinon OpenStreetMap par défaut
    final tileUrl = mapboxToken != null && mapboxToken!.isNotEmpty
        ? 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=$mapboxToken'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    return FlutterMap(
      options: MapOptions(
        initialCenter: userLocation,
        initialZoom: 13.0,
      ),
      children: [
        TileLayer(
          urlTemplate: tileUrl,
          userAgentPackageName: 'com.example.serviconnect',
        ),
        MarkerLayer(
          markers: [
            // User Location
            Marker(
              point: userLocation,
              width: 40,
              height: 40,
              child: const Icon(Icons.my_location, color: Colors.blue, size: 30),
            ),
            // Providers
            ...providers.map(
              (p) => Marker(
                point: p.latitude != null && p.longitude != null
                    ? LatLng(p.latitude!, p.longitude!)
                    : LatLng(userLocation.latitude + (p.distance * 0.01), userLocation.longitude + (p.distance * 0.01)), // Fallback if no location data
                width: 40,
                height: 40,
                child: GestureDetector(
                  onTap: () {
                    // Show provider details
                  },
                  child: Container(
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.work, color: Colors.white, size: 20),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
