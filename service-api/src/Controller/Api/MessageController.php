<?php

namespace App\Controller\Api;

use App\Dto\Request\SendMessageDto;
use App\Entity\Conversation;
use App\Entity\User;
use App\Service\ConversationService;
use App\Service\MediaUploadService;
use App\Service\MercureService;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/conversations/{id}/messages')]
#[IsGranted('ROLE_USER')]
class MessageController extends AbstractController
{
    public function __construct(
        private ConversationService $conversationService,
        private MessageRepository   $messageRepository,
        private MediaUploadService  $mediaUploadService,
        private MercureService      $mercureService
    ) {}

    #[Route('', name: 'api_messages_list', methods: ['GET'])]
    public function list(Conversation $conversation): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->denyAccessUnlessConversationMember($conversation, $user);

        $messages = $this->messageRepository->findBy(
            ['conversation' => $conversation, 'deletedAt' => null],
            ['createdAt' => 'ASC']
        );

        return $this->json($messages, 200, [], ['groups' => ['msg:read']]);
    }

    #[Route('', name: 'api_messages_send', methods: ['POST'])]
    public function send(Conversation $conversation, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->denyAccessUnlessConversationMember($conversation, $user);

        $type    = $request->request->get('type', 'text');
        $content = $request->request->get('content');

        if (in_array($type, ['image', 'video', 'audio'], true)) {
            $file = $request->files->get('media');
            if ($file) {
                $content = $this->mediaUploadService->upload($file, 'messages/' . $type);
            }
        }

        $dto          = new SendMessageDto();
        $dto->content = $content;
        $dto->type    = $type;

        $message = $this->conversationService->sendMessage($conversation, $user, $dto);

        // Publish to Mercure for real-time
        $this->mercureService->publishMessage((string) $conversation->getId(), [
            'id'         => (string) $message->getId(),
            'content'    => $message->getContent(),
            'type'       => $message->getType(),
            'senderId'   => (string) $user->getId(),
            'senderName' => "{$user->getFirstName()} {$user->getLastName()}",
            'createdAt'  => $message->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ]);

        return $this->json([
            'id'        => (string) $message->getId(),
            'content'   => $message->getContent(),
            'type'      => $message->getType(),
            'createdAt' => $message->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ], 201);
    }

    #[Route('/read', name: 'api_messages_read_all', methods: ['PATCH'])]
    public function markAsRead(Conversation $conversation): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->denyAccessUnlessConversationMember($conversation, $user);

        $this->messageRepository->markAsRead($conversation, $user);

        return $this->json(['success' => true, 'message' => 'Messages marqués comme lus']);
    }

    #[Route('/{messageId}', name: 'api_messages_delete', methods: ['DELETE'])]
    public function delete(Conversation $conversation, string $messageId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->denyAccessUnlessConversationMember($conversation, $user);

        $message = $this->messageRepository->find($messageId);
        if (!$message || $message->getConversation() !== $conversation) {
            throw $this->createNotFoundException('Message non trouvé');
        }

        // Only sender can delete their message (like WhatsApp "Delete for everyone" logic can be added later)
        // For now, let's allow sender to delete.
        if ($message->getSender() !== $user) {
            throw $this->createAccessDeniedException('Vous ne pouvez supprimer que vos propres messages');
        }

        $message->delete();
        $this->messageRepository->save($message, true);

        // Notify via Mercure that message was deleted
        $this->mercureService->publishMessage((string) $conversation->getId(), [
            'type'      => 'message_deleted',
            'messageId' => (string) $message->getId(),
        ]);

        return $this->json(['success' => true, 'message' => 'Message supprimé']);
    }

    // -----------------------------------------------------------------------
    private function denyAccessUnlessConversationMember(Conversation $conversation, User $user): void
    {
        $isClient   = $conversation->getClient() === $user;
        $isProvider = $conversation->getProviderProfile()?->getUser() === $user;

        if (!$isClient && !$isProvider) {
            throw $this->createAccessDeniedException();
        }
    }
}
