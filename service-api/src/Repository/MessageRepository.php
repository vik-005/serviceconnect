<?php

namespace App\Repository;

use App\Entity\Message;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function save(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Message $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find messages in a conversation with pagination
     */
    public function findByConversationPaginated(string $conversationId, int $page = 1, int $limit = 50): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.conversation = :conversationId')
            ->andWhere('m.deletedAt IS NULL')
            ->setParameter('conversationId', $conversationId)
            ->orderBy('m.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Count unread messages for a user
     */
    public function countUnreadForUser(string $userId): int
    {
        return (int)$this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.sender != :userId')
            ->andWhere('m.isRead = false')
            ->andWhere('m.deletedAt IS NULL')
            ->andWhere('m.conversation IN (
                SELECT c.id FROM App\Entity\Conversation c
                WHERE (c.client = :userId OR c.providerProfile IN (
                    SELECT pp.id FROM App\Entity\ProviderProfile pp
                    WHERE pp.user = :userId
                ))
                AND c.deletedAt IS NULL
            )')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Mark all messages as read in a conversation for a user
     */
    public function markAllReadInConversation(string $conversationId, string $userId): void
    {
        $this->createQueryBuilder('m')
            ->update()
            ->set('m.isRead', true)
            ->where('m.conversation = :conversationId')
            ->andWhere('m.sender != :userId')
            ->setParameter('conversationId', $conversationId)
            ->setParameter('userId', $userId)
            ->getQuery()
            ->execute();
    }
}
