<?php

namespace App\Repository;

use App\Entity\Banner;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Banner>
 */
class BannerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Banner::class);
    }

    /**
     * Find active banners for a placement
     * Respects startDate and endDate constraints
     */
    public function findActiveBanners(string $placement): array
    {
        return $this->createQueryBuilder('b')
            ->where('b.isActive = true')
            ->andWhere('b.placement = :placement')
            ->andWhere('(b.startDate IS NULL OR b.startDate <= CURRENT_TIMESTAMP)')
            ->andWhere('(b.endDate IS NULL OR b.endDate >= CURRENT_TIMESTAMP)')
            ->andWhere('b.deletedAt IS NULL')
            ->setParameter('placement', $placement)
            ->orderBy('b.displayOrder', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
