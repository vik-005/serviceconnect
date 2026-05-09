<?php

namespace App\EventListener;

use App\Entity\Review;
use App\Service\RatingService;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class ReviewCreatedListener
{
    private RatingService $ratingService;

    public function __construct(RatingService $ratingService)
    {
        $this->ratingService = $ratingService;
    }

    public function postPersist(Review $review, LifecycleEventArgs $event): void
    {
        $this->ratingService->recalculateAverage($review->getProviderProfile());
        $event->getObjectManager()->flush();
    }
}

