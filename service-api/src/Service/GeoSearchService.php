<?php

namespace App\Service;

use App\Repository\ProviderProfileRepository;
use App\Entity\ServiceCategory;

class GeoSearchService
{
    public function __construct(
        private ProviderProfileRepository $providerProfileRepository
    ) {}

    public function findNearby(
        ?ServiceCategory $category,
        float $lat,
        float $lng,
        int $radius = 50000, // 50km by default
        int $page = 1,
        int $limit = 10,
        ?string $country = null
    ): array {
        return $this->providerProfileRepository->findNearbyByCategory(
            $category,
            $lat,
            $lng,
            $radius,
            $page,
            $limit,
            $country
        );
    }
}
