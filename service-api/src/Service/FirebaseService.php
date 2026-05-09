<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Google\Auth\Middleware\AuthTokenMiddleware;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;

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
     * Génère un jeton OAuth2 valide pour Firebase FCM HTTP v1 API
     */
    private function getAccessToken(): string
    {
        $credentialsPath = $this->params->get('kernel.project_dir') . '/config/firebase_credentials.json';
        
        if (!file_exists($credentialsPath)) {
            // Repli sur un token factice si le fichier n'existe pas (pour le mode dev sans configuration)
            return $this->params->get('firebase_access_token') ?? 'dummy-token';
        }

        $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
        
        $credentials = new ServiceAccountCredentials($scopes, $credentialsPath);
        $token = $credentials->fetchAuthToken();
        
        return $token['access_token'] ?? 'dummy-token';
    }
}
