<?php

namespace App\Tests\Api;

use App\Entity\Conversation;
use App\Entity\ProviderProfile;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MessageTest extends WebTestCase
{
    private string $token;
    private string $conversationId;

    public function testMessagingFlow(): void
    {
        $client = static::createClient();
        $em = static::getContainer()->get('doctrine.orm.entity_manager');

        // Cleanup
        $em->createQuery('DELETE FROM App\Entity\Message')->execute();
        $em->createQuery('DELETE FROM App\Entity\Conversation')->execute();
        $em->createQuery('DELETE FROM App\Entity\ProviderProfile')->execute();
        $em->createQuery('DELETE FROM App\Entity\User')->execute();

        // 1. Setup Client and Provider
        $userClient = new User();
        $userClient->setEmail('client-' . uniqid() . '@example.com');
        $userClient->setPasswordHash('hash');
        $userClient->setFirstName('Client');
        $userClient->setLastName('User');
        $userClient->setRole('client');
        $em->persist($userClient);

        $userProvider = new User();
        $userProvider->setEmail('provider-' . uniqid() . '@example.com');
        $userProvider->setPasswordHash('hash');
        $userProvider->setFirstName('Provider');
        $userProvider->setLastName('User');
        $userProvider->setRole('provider');
        $em->persist($userProvider);

        $profile = new ProviderProfile();
        $profile->setUser($userProvider);
        $profile->setStatus('active');
        $em->persist($profile);

        $em->flush();

        // 2. Login Client to get token
        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $userClient->getEmail(), 'password' => 'Password123']) // Wait, I didn't set Password123 hash
        );
        // Better: manually generate token or fix password hash
        // I'll manually set the password to a known hash
        $hasher = static::getContainer()->get('security.user_password_hasher');
        $userClient->setPasswordHash($hasher->hashPassword($userClient, 'Password123'));
        $em->flush();

        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $userClient->getEmail(), 'password' => 'Password123'])
        );
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->token = $data['token'];

        // 3. Create Conversation
        $client->request('POST', '/api/conversations', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token,
            'CONTENT_TYPE' => 'application/json'
        ], json_encode([
            'providerId' => $profile->getId()->toString()
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->conversationId = $data['id'];

        // 4. Send Text Message
        $client->request('POST', "/api/conversations/{$this->conversationId}/messages", [
            'type' => 'text',
            'content' => 'Hello provider!'
        ], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('text', $data['type']);
        $this->assertEquals('Hello provider!', $data['content']);

        // 5. Send Audio Message
        $audioFile = $this->createMockFile('test_audio.mp3', 'audio/mpeg');
        $client->request('POST', "/api/conversations/{$this->conversationId}/messages", [
            'type' => 'audio'
        ], ['media' => $audioFile], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('audio', $data['type']);
        $this->assertStringContainsString('messages/audio', $data['content']);

        // 6. Send Video Message
        $videoFile = $this->createMockFile('test_video.mp4', 'video/mp4');
        $client->request('POST', "/api/conversations/{$this->conversationId}/messages", [
            'type' => 'video'
        ], ['media' => $videoFile], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token
        ]);

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('video', $data['type']);
        $this->assertStringContainsString('messages/video', $data['content']);
    }

    private function createMockFile(string $name, string $mimeType): UploadedFile
    {
        $path = sys_get_temp_dir() . '/' . $name;
        file_put_contents($path, 'dummy content');
        
        return new UploadedFile($path, $name, $mimeType, null, true);
    }
}
