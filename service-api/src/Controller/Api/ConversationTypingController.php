<?php

namespace App\Controller\Api;

use App\Entity\Conversation;
use App\Entity\User;
use App\Service\MercureService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/conversations/{id}')]
#[IsGranted('ROLE_USER')]
class ConversationTypingController extends AbstractController
{
    public function __construct(
        private MercureService $mercureService
    ) {}

    /**
     * Send typing indicator
     * POST /api/conversations/{id}/typing
     */
    #[Route('/typing', name: 'api_conversation_typing', methods: ['POST'])]
    public function sendTypingIndicator(
        Conversation $conversation,
        Request $request
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        
        // Verify user is part of conversation
        if ($conversation->getClient() !== $user && 
            $conversation->getProviderProfile()->getUser() !== $user) {
            throw $this->createAccessDeniedException();
        }

        $data = json_decode($request->getContent(), true);
        $isTyping = $data['isTyping'] ?? false;

        // Publish typing indicator via Mercure
        $this->mercureService->publishTyping(
            $conversation->getId(),
            [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ],
            $isTyping
        );

        return new JsonResponse(['success' => true]);
    }

    /**
     * Get users currently typing
     * GET /api/conversations/{id}/typing-users
     */
    #[Route('/typing-users', name: 'api_conversation_typing_users', methods: ['GET'])]
    public function getTypingUsers(Conversation $conversation): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        // Verify user is part of conversation
        if ($conversation->getClient() !== $user && 
            $conversation->getProviderProfile()->getUser() !== $user) {
            throw $this->createAccessDeniedException();
        }

        // Note: With Mercure/WebSocket, we don't need to poll typing users
        // Frontend subscribes to the topic and receives updates in real-time
        
        return new JsonResponse([]);
    }
}
