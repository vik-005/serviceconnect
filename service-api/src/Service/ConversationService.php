<?php

namespace App\Service;

use App\Dto\Request\SendMessageDto;
use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\ProviderProfile;
use App\Entity\User;
use App\Repository\ConversationRepository;
use App\Repository\MessageRepository;
use App\Repository\ProviderProfileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ConversationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ConversationRepository $conversationRepository,
        private MessageRepository $messageRepository,
        private ProviderProfileRepository $providerProfileRepository,
        private MercurePublisher $mercurePublisher
    ) {}

    public function findOrCreate(User $client, string $providerId): Conversation
    {
        $providerProfile = $this->providerProfileRepository->find($providerId);
        if (!$providerProfile) {
            throw new NotFoundHttpException('Prestataire non trouvé');
        }

        $conversation = $this->conversationRepository->findOneBy([
            'client' => $client,
            'providerProfile' => $providerProfile
        ]);

        if (!$conversation) {
            $conversation = new Conversation();
            $conversation->setClient($client);
            $conversation->setProviderProfile($providerProfile);
            $conversation->setStatus('open');
            
            $this->entityManager->persist($conversation);
            $this->entityManager->flush();
        }

        return $conversation;
    }

    public function sendMessage(Conversation $conversation, User $sender, SendMessageDto $dto): Message
    {
        $message = new Message();
        $message->setConversation($conversation);
        $message->setSender($sender);
        $message->setContent($dto->content);
        $message->setType($dto->type);
        $message->setMediaUrl($dto->mediaUrl);
        $message->setIsRead(false);

        $conversation->setLastMessageAt(new \DateTime());

        $this->entityManager->persist($message);
        $this->entityManager->flush();

        // Publish to Mercure
        $this->mercurePublisher->publish(
            "/conversations/{$conversation->getId()->toString()}",
            [
                'id' => $message->getId()->toString(),
                'senderId' => $sender->getId()->toString(),
                'content' => $message->getContent(),
                'type' => $message->getType(),
                'mediaUrl' => $message->getMediaUrl(),
                'createdAt' => $message->getCreatedAt()->format(\DateTimeInterface::ATOM),
                'isRead' => $message->isRead()
            ]
        );

        return $message;
    }

    public function markMessagesAsRead(Conversation $conversation, User $reader): void
    {
        $this->messageRepository->markAllReadInConversation($conversation->getId()->toString(), $reader->getId()->toString());
        $this->entityManager->flush();

        // Publish read event to Mercure
        $this->mercurePublisher->publish(
            "/conversations/{$conversation->getId()->toString()}/read",
            [
                'userId' => $reader->getId()->toString(),
                'conversationId' => $conversation->getId()->toString(),
                'timestamp' => (new \DateTime())->format(\DateTimeInterface::ATOM)
            ]
        );
    }
}
