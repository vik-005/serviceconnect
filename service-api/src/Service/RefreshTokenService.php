<?php

namespace App\Service;

use App\Entity\RefreshToken;
use App\Entity\User;
use App\Repository\RefreshTokenRepository;
use Doctrine\ORM\EntityManagerInterface;

class RefreshTokenService
{
    public function __construct(
        private EntityManagerInterface  $entityManager,
        private RefreshTokenRepository  $refreshTokenRepository
    ) {}

    public function create(User $user): string
    {
        // Revoke all existing tokens before issuing a new one
        $this->revokeAllForUser($user);

        $refreshToken = new RefreshToken();
        $refreshToken->setUser($user);
        $refreshToken->setToken(bin2hex(random_bytes(64)));
        $refreshToken->setExpiresAt(new \DateTime('+30 days'));

        $this->entityManager->persist($refreshToken);
        $this->entityManager->flush();

        return $refreshToken->getToken();
    }

    public function validate(string $token): ?User
    {
        $refreshToken = $this->refreshTokenRepository->findOneByToken($token);

        if (!$refreshToken || $refreshToken->isRevoked() || $refreshToken->isExpired()) {
            return null;
        }

        return $refreshToken->getUser();
    }

    public function revoke(string $token): void
    {
        $refreshToken = $this->refreshTokenRepository->findOneByToken($token);

        if ($refreshToken && !$refreshToken->isRevoked()) {
            $refreshToken->setIsRevoked(true);
            $this->entityManager->flush();
        }
    }

    public function revokeAllForUser(User $user): void
    {
        $tokens = $this->refreshTokenRepository
            ->createQueryBuilder('rt')
            ->andWhere('rt.user = :user')
            ->andWhere('rt.isRevoked = false')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();

        foreach ($tokens as $token) {
            $token->setIsRevoked(true);
        }

        if (!empty($tokens)) {
            $this->entityManager->flush();
        }
    }
}
