<?php

namespace App\MessageHandler;

use App\Message\ProcessMediaUploadMessage;
use App\Service\MediaUploadService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class ProcessMediaUploadHandler
{
    private MediaUploadService $mediaUploadService;

    public function __construct(MediaUploadService $mediaUploadService)
    {
        $this->mediaUploadService = $mediaUploadService;
    }

    public function __invoke(ProcessMediaUploadMessage $message): void
    {
        $this->mediaUploadService->process($message->getFilePath(), $message->getContext(), $message->getUserId());
    }
}
