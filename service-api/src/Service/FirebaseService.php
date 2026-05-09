<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class FirebaseService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private ParameterBagInterface $params
    ) {}

    public function sendNotification(string $fcmToken, string $title, string $body, array $data = []): bool
    {
        $projectId = $this->params->get('firebase_project_id');
        $serverKey = $this->params->get('firebase_server_key'); // For legacy API, or use OAuth2 for v1

        if (!$projectId || !$fcmToken) {
            return false;
        }

        try {
            $response = $this->httpClient->request('POST', "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getAccessToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'message' => [
                        'token' => $fcmToken,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'data' => array_map(fn($v) => (string) $v, $data),
                        'android' => [
                            'priority' => 'high',
                            'notification' => [
                                'sound' => 'default',
                            ],
                        ],
                        'apns' => [
                            'payload' => [
                                'aps' => [
                                    'sound' => 'default',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Placeholder for OAuth2 token generation
     * In a real project, use google/auth library
     */
    private function getAccessToken(): string
    {
        return $this->params->get('firebase_access_token') ?? 'dummy-token';
    }
}
