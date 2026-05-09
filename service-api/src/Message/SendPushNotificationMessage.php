<?php

namespace App\Message;

class SendPushNotificationMessage
{
    private string $fcmToken;
    private string $title;
    private string $body;
    private array $data = [];

    public function __construct(string $fcmToken, string $title, string $body, array $data = [])
    {
        $this->fcmToken = $fcmToken;
        $this->title = $title;
        $this->body = $body;
        $this->data = $data;
    }

    public function getFcmToken(): string
    {
        return $this->fcmToken;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getData(): array
    {
        return $this->data;
    }
}
