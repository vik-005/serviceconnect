<?php

namespace App\EventListener;

use App\Entity\Message;
use App\Service\MercurePublisher;
use App\Service\NotificationService;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Messenger\MessageBusInterface;

class MessageCreatedListener
{
    public function __construct(
        private MercurePublisher $mercurePublisher,
        private MessageBusInterface $bus,
        private NotificationService $notificationService
    ) {}

    public function postPersist(Message $message, LifecycleEventArgs $event): void
    {
        $conversation = $message->getConversation();
        if (!$conversation) return;

        $client = $conversation->getClient();
        $providerProfile = $conversation->getProviderProfile();
        if (!$providerProfile) return;
        
        $providerUser = $providerProfile->getUser();
        $senderId = $message->getSender()->getId();
        
        $recipient = ($client && $client->getId() == $senderId) ? $providerUser : $client;

        // Publish to Mercure
        $this->mercurePublisher->publish($conversation, $message);

        // Send notification
        $this->notificationService->notify($recipient, 'new_message', 
            'Nouveau message', $message->getContent());

        // Mark conversation updated
        $conversation->setLastMessageAt($message->getCreatedAt());
        $event->getObjectManager()->flush();
    }
}
?>

