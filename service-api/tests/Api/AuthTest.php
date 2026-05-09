<?php

namespace App\Tests\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthTest extends WebTestCase
{
    public function testFullAuthFlow(): void
    {
        $client = static::createClient();
        $email = 'test-' . uniqid() . '@example.com';
        $password = 'Password123';

        // 1. Test Registration
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'firstName' => 'Test',
                'lastName' => 'User',
                'role' => 'client'
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertEquals('Inscription réussie', $data['message']);
        $this->assertArrayHasKey('token', $data);

        // 2. Test Login
        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password
            ])
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertEquals('Connexion réussie', $data['message']);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('refreshToken', $data);
    }

    public function testRegistrationDuplicateEmail(): void
    {
        $client = static::createClient();
        $email = 'duplicate-' . uniqid() . '@example.com';
        $password = 'Password123';

        $payload = [
            'email' => $email,
            'password' => $password,
            'firstName' => 'First',
            'lastName' => 'Last',
            'role' => 'client'
        ];

        // First registration
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode($payload));
        $this->assertResponseStatusCodeSame(201);

        // Second registration with same email
        $client->request('POST', '/api/auth/register', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode($payload));
        $this->assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertStringContainsString('déjà utilisé', $data['message']);
    }

    public function testRegistrationInvalidData(): void
    {
        $client = static::createClient();

        // Invalid email and too short password
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'invalid-email',
                'password' => 'short',
                'firstName' => 'T',
                'lastName' => 'U',
                'role' => 'invalid-role'
            ])
        );

        $this->assertResponseStatusCodeSame(422);
    }

    public function testRefreshTokenFlow(): void
    {
        $client = static::createClient();
        $email = 'refresh-' . uniqid() . '@example.com';
        $password = 'Password123';

        // 1. Register
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'firstName' => 'Test',
                'lastName' => 'User',
                'role' => 'client'
            ])
        );
        $data = json_decode($client->getResponse()->getContent(), true);
        $refreshToken = $data['refreshToken'];

        // 2. Refresh
        $client->request('POST', '/api/auth/refresh', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refresh_token' => $refreshToken])
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['success']);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('refreshToken', $data);
    }

    public function testLogout(): void
    {
        $client = static::createClient();
        $email = 'logout-' . uniqid() . '@example.com';
        $password = 'Password123';

        // 1. Register to get a refresh token
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'firstName' => 'Test',
                'lastName' => 'User',
                'role' => 'client'
            ])
        );
        $data = json_decode($client->getResponse()->getContent(), true);
        $refreshToken = $data['refreshToken'];

        // 2. Logout
        $client->request('POST', '/api/auth/logout', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refresh_token' => $refreshToken])
        );

        $this->assertResponseStatusCodeSame(200);
        
        // 3. Try to use the refresh token again (should fail)
        $client->request('POST', '/api/auth/refresh', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['refresh_token' => $refreshToken])
        );
        
        $this->assertResponseStatusCodeSame(401);
    }

    public function testForgotPassword(): void
    {
        $client = static::createClient();
        $email = 'forgot-' . uniqid() . '@example.com';
        
        // 1. Register
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'Password123',
                'firstName' => 'Test',
                'lastName' => 'User'
            ])
        );

        // 2. Request password reset
        $client->request('POST', '/api/auth/forgot-password', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email])
        );

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['success']);
    }

    public function testResetPassword(): void
    {
        $client = static::createClient();
        $email = 'reset-' . uniqid() . '@example.com';
        
        // 1. Register
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'Password123',
                'firstName' => 'Test',
                'lastName' => 'User'
            ])
        );

        // 2. Get the user and set a reset token manually (simulating the forgot-password flow)
        $container = static::getContainer();
        $entityManager = $container->get('doctrine.orm.entity_manager');
        $userRepository = $entityManager->getRepository(\App\Entity\User::class);
        $user = $userRepository->findOneBy(['email' => $email]);
        
        $token = 'test-reset-token';
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt(new \DateTime('+1 hour'));
        $entityManager->flush();

        // 3. Reset password
        $client->request('POST', '/api/auth/reset-password', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'token' => $token,
                'password' => 'NewPassword123'
            ])
        );

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($data['success']);

        // 4. Try to login with new password
        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'NewPassword123'
            ])
        );

        $this->assertResponseIsSuccessful();
    }

    public function testAuthenticatedMe(): void
    {
        $client = static::createClient();
        $email = 'me-' . uniqid() . '@example.com';
        $password = 'Password123';

        // 1. Register
        $client->request('POST', '/api/auth/register', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => $password,
                'firstName' => 'Test',
                'lastName' => 'User',
                'role' => 'client'
            ])
        );
        $data = json_decode($client->getResponse()->getContent(), true);
        $token = $data['token'];

        // 2. Access /api/me with Bearer token
        $client->request('GET', '/api/me', [], [], [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            'CONTENT_TYPE' => 'application/json'
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals($email, $data['email']);
    }

    public function testLoginInvalidCredentials(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/auth/login', [], [], 
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'nonexistent@example.com',
                'password' => 'WrongPassword123'
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }
}
