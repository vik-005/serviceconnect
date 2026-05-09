<?php

namespace App\Security;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\TokenExtractor\AuthorizationHeaderTokenExtractor;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

class JwtAuthenticator extends AbstractGuardAuthenticator implements AuthenticationEntryPointInterface
{
    private JWTTokenManagerInterface $jwtManager;
    private AuthorizationHeaderTokenExtractor $tokenExtractor;

    public function __construct(JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenExtractor = new AuthorizationHeaderTokenExtractor('Bearer', 'Authorization', true);
    }

    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        return new Response('Authentication Required', 401);
    }

    public function supports(Request $request): bool
    {
        return $this->tokenExtractor->extract($request) !== null;
    }

    public function getCredentials(Request $request): string
    {
        return $this->tokenExtractor->extract($request);
    }

    public function getUser($credentials, UserProviderInterface $userProvider): ?User
    {
        try {
            $payload = $this->jwtManager->decode(new \Lexik\Bundle\JWTAuthenticationBundle\Token\JWTToken($credentials));
        } catch (JWTDecodeFailureException $e) {
            throw new CustomUserMessageAuthenticationException('Invalid JWT Token');
        }

        $username = $payload['username'];

        return $userProvider->loadUserByIdentifier($username);
    }

    public function checkCredentials($credentials, User $user): bool
    {
        return true;
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $providerKey): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return null;
    }
}
