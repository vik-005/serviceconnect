<?php

namespace App\Controller\Api;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    public function __construct(
        private NotificationRepository $notificationRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user          = $this->getUser();
        $notifications = $this->notificationRepository->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC'],
            20
        );

        return $this->json($notifications);
    }

    #[Route('/{id}/read', name: 'api_notifications_read', methods: ['PATCH'])]
    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->getUser() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $notification->setIsRead(true);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Notification marquée comme lue']);
    }
}
