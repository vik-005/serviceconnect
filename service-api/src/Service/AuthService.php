<?php

namespace App\Service;

use App\Dto\Request\RegisterDto;
use App\Dto\Response\AuthResponseDto;
use App\Dto\Response\UserResponseDto;
use App\Entity\ProviderProfile;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthService
{
    public function __construct(
        private UserRepository              $userRepository,
        private EntityManagerInterface      $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface          $validator,
        private ActivityLogger              $activityLogger,
        private RefreshTokenService         $refreshTokenService,
        private JWTTokenManagerInterface    $jwtManager,
        private ?MailerInterface            $mailer = null,
    ) {}

    public function register(RegisterDto $dto): AuthResponseDto
    {
        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            $messages = array_map(fn($v) => $v->getMessage(), iterator_to_array($violations));
            throw new BadRequestHttpException('Données invalides: ' . implode(', ', $messages));
        }

        if ($this->userRepository->findOneBy(['email' => $dto->email])) {
            throw new BadRequestHttpException('Cet email est déjà utilisé');
        }

        $user = new User();
        $user->setEmail($dto->email);
        $user->setFirstName($dto->firstName);
        $user->setLastName($dto->lastName);
        $user->setPhone($dto->phone);
        $user->setRole($dto->role);
        $user->setIsActive(true);
        $user->setCountry('BJ');
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $dto->password));

        $this->entityManager->persist($user);

        if ($dto->role === 'provider') {
            $providerProfile = new ProviderProfile();
            $providerProfile->setUser($user);
            $providerProfile->setStatus('active');
            $providerProfile->setIsVerified(false);
            $providerProfile->setYearsExperience(0);
            $this->entityManager->persist($providerProfile);
        }

        $this->entityManager->flush();

        $this->activityLogger->log('USER_REGISTERED', 'User', $user->getId()->toString(), ['email' => $dto->email], $user);

        return $this->buildAuthResponse($user, 'Inscription réussie');
    }

    public function login(string $email, string $password): AuthResponseDto
    {
        $user = $this->userRepository->findByEmailOrPhone($email);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            throw new UnauthorizedHttpException('Bearer', 'Email ou mot de passe incorrect');
        }

        if (!$user->isActive()) {
            throw new UnauthorizedHttpException('Bearer', 'Compte désactivé. Veuillez contacter le support.');
        }

        $this->activityLogger->log('USER_LOGIN', 'User', $user->getId()->toString(), null, $user);

        return $this->buildAuthResponse($user, 'Connexion réussie');
    }

    public function forgotPassword(string $emailOrPhone): void
    {
        $user = $this->userRepository->findByEmailOrPhone($emailOrPhone);
        // Silent fail: do not reveal whether user exists
        if (!$user) {
            return;
        }

        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt(new \DateTime('+1 hour'));
        $this->entityManager->flush();

        // Envoi SMS simulé si l'identifiant n'est pas un email
        if (!filter_var($emailOrPhone, FILTER_VALIDATE_EMAIL)) {
            $this->activityLogger->log('SMS_PASSWORD_RESET_TOKEN', 'User', $user->getId()->toString(), [
                'phone' => $user->getPhone(),
                'token' => $token
            ], $user);
        } else if ($this->mailer && $user->getEmail()) {
            $frontendUrl = $_ENV['APP_FRONTEND_URL'] ?? 'http://localhost';
            $resetLink   = "{$frontendUrl}/reset-password?token={$token}";
            $emailMsg    = (new Email())
                ->from('noreply@serviconnect.app')
                ->to($user->getEmail())
                ->subject('Réinitialisation de votre mot de passe')
                ->html("<p>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href=\"{$resetLink}\">{$resetLink}</a></p><p>Ce lien expire dans 1 heure.</p>");

            $this->mailer->send($emailMsg);
        }
    }

    public function resetPassword(string $token, string $newPassword): void
    {
        $user = $this->userRepository->findOneBy(['resetToken' => $token]);

        if (!$user) {
            throw new BadRequestHttpException('Token invalide ou expiré');
        }

        if ($user->getResetTokenExpiresAt() && $user->getResetTokenExpiresAt() < new \DateTime()) {
            throw new BadRequestHttpException('Token expiré. Veuillez faire une nouvelle demande.');
        }

        $user->setPasswordHash($this->passwordHasher->hashPassword($user, $newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $this->entityManager->flush();
    }

    public function refreshToken(string $token): AuthResponseDto
    {
        $user = $this->refreshTokenService->validate($token);

        if (!$user) {
            throw new UnauthorizedHttpException('Bearer', 'Token de rafraîchissement invalide ou expiré');
        }

        $this->refreshTokenService->revoke($token);
        $this->activityLogger->log('TOKEN_REFRESH', 'User', $user->getId()->toString(), null, $user);

        return $this->buildAuthResponse($user, 'Token rafraîchi');
    }

    public function logout(string $refreshToken): void
    {
        $this->refreshTokenService->revoke($refreshToken);
    }

    // -----------------------------------------------------------------------
    private function buildAuthResponse(User $user, string $message): AuthResponseDto
    {
        $jwt          = $this->jwtManager->create($user);
        $refreshToken = $this->refreshTokenService->create($user);

        $response               = new AuthResponseDto();
        $response->success      = true;
        $response->message      = $message;
        $response->user         = UserResponseDto::fromEntity($user);
        $response->token        = $jwt;
        $response->refreshToken = $refreshToken;
        $response->expiresIn    = 3600;

        return $response;
    }
}
