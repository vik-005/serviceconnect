<?php

namespace App\Controller\Api;

use App\Dto\Request\LoginDto;
use App\Dto\Request\RegisterDto;
use App\Service\AuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private AuthService $authService
    ) {}

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(#[MapRequestPayload] RegisterDto $registerDto): JsonResponse
    {
        $result = $this->authService->register($registerDto);

        return $this->json($result, 201);
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(#[MapRequestPayload] LoginDto $loginDto): JsonResponse
    {
        $result = $this->authService->login($loginDto->email, $loginDto->password);

        return $this->json($result);
    }

    #[Route('/refresh', name: 'api_auth_refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['refresh_token'])) {
            throw new BadRequestHttpException('refresh_token obligatoire');
        }

        $result = $this->authService->refreshToken($data['refresh_token']);

        return $this->json($result);
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['refresh_token'])) {
            throw new BadRequestHttpException('refresh_token obligatoire');
        }

        $this->authService->logout($data['refresh_token']);

        return $this->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
        ]);
    }

    #[Route('/forgot-password', name: 'api_auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $identifier = $data['email'] ?? $data['emailOrPhone'] ?? $data['phone'] ?? null;
        
        if (empty($identifier)) {
            throw new BadRequestHttpException('Identifiant (email ou téléphone) obligatoire');
        }

        $this->authService->forgotPassword($identifier);

        return $this->json([
            'success' => true,
            'message' => 'Si un compte existe, les instructions de réinitialisation ont été envoyées',
        ]);
    }

    #[Route('/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (empty($data['token']) || empty($data['password'])) {
            throw new BadRequestHttpException('Token et mot de passe obligatoires');
        }

        $this->authService->resetPassword($data['token'], $data['password']);

        return $this->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès',
        ]);
    }
}
