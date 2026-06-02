<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\ConversationService;
use App\Service\MercurePublisher;
use App\Repository\ConversationRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/conversations')]
#[IsGranted('ROLE_USER')]
class ConversationController extends AbstractController
{
    public function __construct(
        private ConversationService    $conversationService,
        private ConversationRepository $conversationRepository,
        private MessageRepository      $messageRepository,
        private MercurePublisher       $mercurePublisher
    ) {}

    #[Route('', name: 'api_conversations_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $conversations = $this->conversationRepository->findByUser($user);

        return $this->json($conversations, 200, [], ['groups' => ['conv:read']]);
    }

    #[Route('', name: 'api_conversations_create', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['providerId'])) {
            throw new BadRequestHttpException('providerId est obligatoire');
        }

        /** @var User $user */
        $user = $this->getUser();
        $conversation = $this->conversationService->findOrCreate($user, $data['providerId']);

        return $this->json([
            'id'            => $conversation->getId(),
            'status'        => $conversation->getStatus(),
            'lastMessageAt' => $conversation->getLastMessageAt()?->format(\DateTimeInterface::ATOM),
        ], 201);
    }

    #[Route('/unread-count', name: 'api_conversations_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'unreadCount' => $this->conversationRepository->countUnreadForUser($user),
        ]);
    }

    #[Route('/{id}/read', name: 'api_conversations_mark_read', methods: ['PATCH'])]
    public function markAsRead(string $id): JsonResponse
    {
        /** @var User $user */
        $user         = $this->getUser();
        $conversation = $this->conversationRepository->find($id);

        if (!$conversation) {
            throw new NotFoundHttpException('Conversation introuvable');
        }

        $this->conversationService->markMessagesAsRead($conversation, $user);

        return $this->json(['success' => true, 'message' => 'Messages marqués comme lus']);
    }

    #[Route('/{id}/typing', name: 'api_conversations_typing', methods: ['POST'])]
    public function sendTyping(string $id, Request $request): JsonResponse
    {
        $data         = json_decode($request->getContent(), true);
        $isTyping     = (bool) ($data['isTyping'] ?? false);

        /** @var User $user */
        $user         = $this->getUser();
        $conversation = $this->conversationRepository->find($id);

        if (!$conversation) {
            throw new NotFoundHttpException('Conversation introuvable');
        }

        $this->mercurePublisher->publish(
            "/conversations/{$id}/typing",
            [
                'userId'    => (string) $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName'  => $user->getLastName(),
                'isTyping'  => $isTyping,
                'timestamp' => (new \DateTime())->format(\DateTimeInterface::ATOM),
            ]
        );

        return $this->json(['success' => true]);
    }
}
