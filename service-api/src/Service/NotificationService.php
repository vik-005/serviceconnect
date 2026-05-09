<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MercurePublisher $mercurePublisher,
        private FirebaseService $firebaseService
    ) {}

    public function notify(User $user, string $type, string $title, string $body, array $metadata = []): Notification
    {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType($type);
        $notification->setTitle($title);
        $notification->setBody($body);
        $notification->setMetadata($metadata);
        $notification->setIsRead(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        // 1. Database (Done above)

        // 2. Mercure (Real-time for Web & Open App)
        $this->mercurePublisher->publish(
            "/notifications/{$user->getId()->toString()}",
            [
                'id' => $notification->getId()->toString(),
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'createdAt' => $notification->getCreatedAt()->format(\DateTimeInterface::ATOM)
            ]
        );

        // 3. Firebase (Push for Mobile Background)
        if ($user->getFcmToken()) {
            $this->firebaseService->sendNotification(
                $user->getFcmToken(),
                $title,
                $body,
                array_merge($metadata, ['notification_id' => $notification->getId()->toString()])
            );
        }

        return $notification;
    }
}
