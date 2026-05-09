<?php

namespace App\Message;

class ProcessMediaUploadMessage
{
    private string $filePath;
    private string $context;
    private int $userId;

    public function __construct(string $filePath, string $context, int $userId)
    {
        $this->filePath = $filePath;
        $this->context = $context;
        $this->userId = $userId;
    }

    public function getFilePath(): string
    {
        return $this->filePath;
    }

    public function getContext(): string
    {
        return $this->context;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }
}
