<?php

namespace App\Controller\Api;

use App\Dto\Request\SendMessageDto;
use App\Entity\Conversation;
use App\Entity\User;
use App\Service\ConversationService;
use App\Service\MediaUploadService;
use App\Service\MercurePublisher;
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
        private MercurePublisher    $mercurePublisher
    ) {}

    #[Route('', name: 'api_messages_list', methods: ['GET'])]
    public function list(Conversation $conversation, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $this->denyAccessUnlessConversationMember($conversation, $user);

        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 50);

        $messages = $this->messageRepository->findByConversationPaginated(
            (string) $conversation->getId(),
            $page,
            $limit
        );

        // Sort messages back to ASC for the UI (chat view usually needs chronological order)
        usort($messages, fn($a, $b) => $a->getCreatedAt() <=> $b->getCreatedAt());

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

        // Gestion du média uploadé
        if (in_array($type, ['image', 'video', 'audio'], true)) {
            $file = $request->files->get('media');
            if ($file) {
                // On stocke l'URL du fichier comme mediaUrl, pas comme content
                $mediaUrl = $this->mediaUploadService->upload($file, 'messages/' . $type);
                $dto          = new SendMessageDto();
                $dto->content = $content;
                $dto->type    = $type;
                $dto->mediaUrl = $mediaUrl;
            } else {
                return $this->json(['success' => false, 'message' => 'Fichier média manquant'], 400);
            }
        } else {
            if (empty($content)) {
                return $this->json(['success' => false, 'message' => 'Le contenu du message est obligatoire'], 400);
            }
            $dto          = new SendMessageDto();
            $dto->content = $content;
            $dto->type    = $type;
        }

        // ConversationService::sendMessage() gère BDD + Mercure (publish unique)
        $message = $this->conversationService->sendMessage($conversation, $user, $dto);

        return $this->json([
            'id'        => (string) $message->getId(),
            'content'   => $message->getContent(),
            'type'      => $message->getType(),
            'mediaUrl'  => $message->getMediaUrl(),
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
            return $this->json(['success' => false, 'message' => 'Message non trouvé'], 404);
        }

        if ($message->getSender() !== $user) {
            return $this->json(['success' => false, 'message' => 'Vous ne pouvez supprimer que vos propres messages'], 403);
        }

        $message->delete();
        $this->messageRepository->save($message, true);

        // Notifier via Mercure que le message a été supprimé
        $this->mercurePublisher->publish("/conversations/{$conversation->getId()}", [
            'type'      => 'message_deleted',
            'messageId' => (string) $message->getId(),
        ]);

        return $this->json(['success' => true, 'message' => 'Message supprimé']);
    }

    // -------------------------------------------------------------------------
    private function denyAccessUnlessConversationMember(Conversation $conversation, User $user): void
    {
        $isClient   = $conversation->getClient() === $user;
        $isProvider = $conversation->getProviderProfile()?->getUser() === $user;

        if (!$isClient && !$isProvider) {
            throw $this->createAccessDeniedException();
        }
    }
}
