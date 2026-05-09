<?php

namespace App\Service;

use App\Entity\Review;
use App\Entity\ProviderProfile;
use App\Repository\ReviewRepository;
use Doctrine\ORM\EntityManagerInterface;

class RatingService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ReviewRepository $reviewRepository
    ) {}

    public function recalculateAverage(ProviderProfile $providerProfile): void
    {
        $stats = $this->reviewRepository->getStatsForProvider($providerProfile);
        
        $providerProfile->setRatingAverage($stats['average'] ?? 0.0);
        $providerProfile->setTotalReviews($stats['count'] ?? 0);

        $this->entityManager->flush();
    }
}
