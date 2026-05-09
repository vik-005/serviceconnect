<?php

namespace App\Repository;

use App\Entity\Conversation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Conversation>
 */
class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

    /**
     * Find conversations for a user with pagination
     */
    public function findByUserPaginated(string $userId, int $page = 1, int $limit = 20): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.client = :userId OR c.providerProfile IN (
                SELECT pp.id FROM App\Entity\ProviderProfile pp
                WHERE pp.user = :userId
            )')
            ->andWhere('c.deletedAt IS NULL')
            ->setParameter('userId', $userId)
            ->orderBy('c.lastMessageAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find or create a conversation between a client and provider
     */
    public function findOrCreateBetween(string $clientId, string $providerId): Conversation
    {
        $conversation = $this->createQueryBuilder('c')
            ->where('c.client = :clientId')
            ->andWhere('c.providerProfile = :providerId')
            ->andWhere('c.deletedAt IS NULL')
            ->setParameter('clientId', $clientId)
            ->setParameter('providerId', $providerId)
            ->getQuery()
            ->getOneOrNullResult();

        if ($conversation === null) {
            // Create new conversation
            $em = $this->getEntityManager();
            $client = $em->getReference('App\Entity\User', $clientId);
            $provider = $em->getReference('App\Entity\ProviderProfile', $providerId);

            $conversation = new Conversation();
            $conversation->setClient($client);
            $conversation->setProviderProfile($provider);

            $em->persist($conversation);
            $em->flush();
        }

        return $conversation;
    }
}
