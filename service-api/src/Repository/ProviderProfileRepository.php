<?php

namespace App\Repository;

use App\Entity\ProviderProfile;
use App\Entity\ServiceCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProviderProfile>
 */
class ProviderProfileRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProviderProfile::class);
    }

    /**
     * Find nearby providers by category using Haversine formula
     * 
     * @param ServiceCategory|null $category
     * @param float $lat Latitude
     * @param float $lng Longitude
     * @param int $radiusMeters Search radius in meters
     * @param int $page
     * @param int $limit
     * @return array
     */
    public function findNearbyByCategory(
        ?ServiceCategory $category,
        float $lat,
        float $lng,
        int $radiusMeters,
        int $page = 1,
        int $limit = 10,
        ?string $country = null
    ): array {
        // Approximate bounding box (1 degree is approx 111km)
        $radiusKm = $radiusMeters / 1000;
        $latDelta = $radiusKm / 111;
        $lngDelta = $radiusKm / (111 * cos(deg2rad($lat)));
        
        $minLat = $lat - $latDelta;
        $maxLat = $lat + $latDelta;
        $minLng = $lng - $lngDelta;
        $maxLng = $lng + $lngDelta;

        $qb = $this->createQueryBuilder('pp')
            ->select('pp', 'u')
            ->innerJoin('pp.user', 'u')
            ->where('pp.status = :status')
            ->andWhere('pp.deletedAt IS NULL')
            ->andWhere('u.deletedAt IS NULL')
            ->andWhere('u.latitude BETWEEN :minLat AND :maxLat')
            ->andWhere('u.longitude BETWEEN :minLng AND :maxLng')
            ->setParameter('minLat', $minLat)
            ->setParameter('maxLat', $maxLat)
            ->setParameter('minLng', $minLng)
            ->setParameter('maxLng', $maxLng)
            ->setParameter('status', 'active');

        if ($category) {
            $qb->innerJoin('pp.providerServices', 'ps')
               ->andWhere('ps.category = :category')
               ->setParameter('category', $category);
        }

        if ($country) {
            $qb->andWhere('u.country = :country')
               ->setParameter('country', $country);
        }

        $results = $qb->getQuery()->getResult();
        
        $formattedResults = [];
        foreach ($results as $provider) {
            $user = $provider->getUser();
            $distance = $this->calculateDistance($lat, $lng, (float)$user->getLatitude(), (float)$user->getLongitude());
            
            if ($distance <= $radiusKm) {
                $formattedResults[] = [
                    'provider' => $provider,
                    'distance_km' => round($distance, 2)
                ];
            }
        }

        usort($formattedResults, fn($a, $b) => $a['distance_km'] <=> $b['distance_km']);

        return [
            'results' => array_slice($formattedResults, ($page - 1) * $limit, $limit),
            'total' => count($formattedResults)
        ];
    }

    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    public function getStatsForProvider(ProviderProfile $providerProfile): array
    {
        return $this->getEntityManager()->createQuery('
            SELECT AVG(r.rating) as average, COUNT(r.id) as count
            FROM App\Entity\Review r
            WHERE r.providerProfile = :pp
            AND r.deletedAt IS NULL
        ')
        ->setParameter('pp', $providerProfile)
        ->getSingleResult();
    }
}
