<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @implements PasswordUpgraderInterface<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }

        $user->setPasswordHash($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Find a user by email or phone
     */
    public function findByEmailOrPhone(string $value): ?User
    {
        return $this->createQueryBuilder('u')
            ->where('u.email = :value OR u.phone = :value')
            ->setParameter('value', $value)
            ->andWhere('u.deletedAt IS NULL')
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find all active providers
     */
    public function findActiveProviders(): array
    {
        return $this->createQueryBuilder('u')
            ->innerJoin('u.providerProfile', 'pp')
            ->where('u.isActive = true')
            ->andWhere('pp.status = :status')
            ->andWhere('u.deletedAt IS NULL')
            ->andWhere('pp.deletedAt IS NULL')
            ->setParameter('status', 'active')
            ->orderBy('pp.ratingAverage', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find paginated users with provider profile to prevent N+1 queries.
     */
    public function findPaginatedUsers(int $page = 1, int $limit = 10, ?string $role = null): array
    {
        $qb = $this->createQueryBuilder('u')
            ->leftJoin('u.providerProfile', 'pp')
            ->addSelect('pp')
            ->where('u.deletedAt IS NULL')
            ->orderBy('u.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($role) {
            $qb->andWhere('u.role = :role')
               ->setParameter('role', $role);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Count total users for pagination.
     */
    public function countUsers(?string $role = null): int
    {
        $qb = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.deletedAt IS NULL');

        if ($role) {
            $qb->andWhere('u.role = :role')
               ->setParameter('role', $role);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
