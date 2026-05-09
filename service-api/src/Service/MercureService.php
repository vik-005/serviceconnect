<?php

namespace App\Service;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Mercure Hub Integration for Real-time Chat Updates
 * 
 * Mercure is a protocol for real-time updates over HTTP.
 * It enables push notifications to subscribed clients.
 * 
 * Setup:
 * 1. Docker: docker run -d -p 3000:3000 dunglas/mercure
 * 2. Set MERCURE_PUBLIC_URL and MERCURE_JWT_SECRET in .env
 */
class MercureService
{
    private HttpClientInterface $httpClient;
    private string $mercureUrl;
    private string $jwtToken;

    public function __construct(
        string $mercurePublicUrl = 'http://localhost/.well-known/mercure',
        string $mercureSecret = 'your-secret-key'
    ) {
        $this->mercureUrl = $mercurePublicUrl;
        $this->httpClient = HttpClient::create();
        
        // Generate JWT token for publisher
        $this->jwtToken = $this->generateJwt($mercureSecret);
    }

    /**
     * Publish a message to a topic
     */
    public function publish(string $topic, array $data): bool
    {
        try {
            $response = $this->httpClient->request('POST', $this->mercureUrl, [
                'headers' => [
                    'Authorization' => "Bearer {$this->jwtToken}",
                    'Content-Type' => 'application/x-www-form-urlencoded',
                ],
                'body' => http_build_query([
                    'topic' => $topic,
                    'data' => json_encode($data),
                    'retry' => 3000, // milliseconds
                ]),
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            \error_log('Mercure publish error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Publish message to conversation participants
     */
    public function publishMessage(string $conversationId, array $message): bool
    {
        return $this->publish(
            "conversation/{$conversationId}/messages",
            $message
        );
    }

    /**
     * Publish typing indicator
     */
    public function publishTyping(string $conversationId, array $user, bool $isTyping): bool
    {
        return $this->publish(
            "conversation/{$conversationId}/typing",
            [
                'userId' => $user['id'],
                'firstName' => $user['firstName'],
                'lastName' => $user['lastName'],
                'isTyping' => $isTyping,
                'timestamp' => time(),
            ]
        );
    }

    /**
     * Private: Generate JWT token
     */
    private function generateJwt(string $secret): string
    {
        $header = \json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = \json_encode([
            'mercure' => [
                'publish' => ['*'],
                'subscribe' => ['*'],
            ],
            'iat' => time(),
        ]);

        $base64Header = \strtr(\base64_encode($header), '+/', '-_');
        $base64Payload = \strtr(\base64_encode($payload), '+/', '-_');
        $signature = \hash_hmac('sha256', "$base64Header.$base64Payload", $secret, true);
        $base64Signature = \strtr(\base64_encode($signature), '+/', '-_');

        return "$base64Header.$base64Payload.$base64Signature";
    }
}
