<?php

namespace App\MessageHandler;

use App\Message\SendPushNotificationMessage;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\HttpClient\HttpClient;
use Psr\Log\LoggerInterface;

#[AsMessageHandler]
class SendPushNotificationHandler
{
    private string $firebaseProjectId;
    private string $firebaseKey;
    private LoggerInterface $logger;

    public function __construct(string $firebaseProjectId, string $firebaseKey, LoggerInterface $logger)
    {
        $this->firebaseProjectId = $firebaseProjectId;
        $this->firebaseKey = $firebaseKey;
        $this->logger = $logger;
    }

    public function __invoke(SendPushNotificationMessage $message): void
    {
        $client = HttpClient::create();

        $body = [
            'message' => [
                'token' => $message->getFcmToken(),
                'notification' => [
                    'title' => $message->getTitle(),
                    'body' => $message->getBody(),
                ],
                'data' => $message->getData(),
            ],
        ];

        try {
            $response = $client->request('POST', sprintf(
                'https://fcm.googleapis.com/v1/projects/%s/messages:send',
                $this->firebaseProjectId
            ), [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->firebaseKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $body,
            ]);

            $this->logger->info('Push notification sent', ['response' => $response->getStatusCode()]);
        } catch (\Exception $e) {
            $this->logger->error('Push notification failed', ['error' => $e->getMessage()]);
        }
    }
}
