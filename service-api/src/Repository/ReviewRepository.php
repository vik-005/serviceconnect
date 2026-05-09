<?php

namespace App\Repository;

use App\Entity\Review;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    /**
     * Find reviews for a provider sorted by date
     */
    public function findByProviderSorted(string $providerId): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.providerProfile = :providerId')
            ->andWhere('r.deletedAt IS NULL')
            ->setParameter('providerId', $providerId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Check if a client has already reviewed a provider
     */
    public function hasClientReviewedProvider(string $clientId, string $providerId): bool
    {
        return (bool)$this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->where('r.client = :clientId')
            ->andWhere('r.providerProfile = :providerId')
            ->andWhere('r.deletedAt IS NULL')
            ->setParameter('clientId', $clientId)
            ->setParameter('providerId', $providerId)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
