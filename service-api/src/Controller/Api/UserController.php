<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\MediaUploadService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/me')]
#[IsGranted('ROLE_USER')]
class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MediaUploadService $mediaUploadService
    ) {}

    #[Route('', name: 'api_me_show', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'id'          => $user->getId(),
            'email'       => $user->getEmail(),
            'firstName'   => $user->getFirstName(),
            'lastName'    => $user->getLastName(),
            'phone'       => $user->getPhone(),
            'role'        => $user->getRole(),
            'avatarUrl'   => $user->getAvatarUrl(),
            'city'        => $user->getCity(),
            'country'     => $user->getCountry(),
            'isActive'    => $user->isActive(),
            'isOnline'    => $user->isOnline(),
            'lastSeenAt'  => $user->getLastSeenAt()?->format(\DateTimeInterface::ATOM),
            'providerProfile' => $user->getProviderProfile() ? [
                'id'            => $user->getProviderProfile()->getId(),
                'bio'           => $user->getProviderProfile()->getBio(),
                'status'        => $user->getProviderProfile()->getStatus(),
                'ratingAverage' => $user->getProviderProfile()->getRatingAverage(),
                'totalReviews'  => $user->getProviderProfile()->getTotalReviews(),
                'isVerified'    => $user->getProviderProfile()->isVerified(),
                'yearsExperience' => $user->getProviderProfile()->getYearsExperience(),
            ] : null,
        ]);
    }

    #[Route('', name: 'api_me_update', methods: ['PATCH'])]
    public function update(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();

        if (isset($data['firstName']) && trim($data['firstName']) !== '') {
            $user->setFirstName(trim($data['firstName']));
        }
        if (isset($data['lastName']) && trim($data['lastName']) !== '') {
            $user->setLastName(trim($data['lastName']));
        }
        if (array_key_exists('phone', $data)) {
            $user->setPhone($data['phone'] ?: null);
        }
        if (array_key_exists('city', $data)) {
            $user->setCity($data['city'] ?: null);
        }

        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Profil mis à jour']);
    }

    #[Route('/location', name: 'api_me_location', methods: ['PATCH'])]
    public function updateLocation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();

        if (isset($data['latitude']))  $user->setLatitude((float) $data['latitude']);
        if (isset($data['longitude'])) $user->setLongitude((float) $data['longitude']);
        if (isset($data['city']))      $user->setCity($data['city']);

        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Localisation mise à jour']);
    }

    #[Route('/avatar', name: 'api_me_avatar', methods: ['POST'])]
    public function updateAvatar(Request $request): JsonResponse
    {
        $file = $request->files->get('avatar');
        if (!$file) {
            throw new BadRequestHttpException('Fichier avatar manquant');
        }

        /** @var User $user */
        $user = $this->getUser();
        $avatarUrl = $this->mediaUploadService->upload($file, 'avatars');

        $user->setAvatarUrl($avatarUrl);
        $this->entityManager->flush();

        return $this->json(['avatarUrl' => $avatarUrl]);
    }

    #[Route('/fcm-token', name: 'api_me_fcm_token', methods: ['PATCH'])]
    public function updateFcmToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['fcmToken'])) {
            throw new BadRequestHttpException('fcmToken obligatoire');
        }

        /** @var User $user */
        $user = $this->getUser();
        $user->setFcmToken($data['fcmToken']);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Token FCM mis à jour']);
    }

    #[Route('/presence', name: 'api_me_presence', methods: ['PATCH'])]
    public function updatePresence(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();

        if (isset($data['isOnline'])) {
            $user->setIsOnline((bool) $data['isOnline']);
            if (!$data['isOnline']) {
                $user->setLastSeenAt(new \DateTimeImmutable());
            }
        }

        $this->entityManager->flush();

        return $this->json(['success' => true, 'isOnline' => $user->isOnline()]);
    }

    #[Route('', name: 'api_me_delete', methods: ['DELETE'])]
    public function deleteAccount(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        // Soft delete user and deactivate
        $user->setDeletedAt(new \DateTimeImmutable());
        $user->setIsActive(false);
        $user->setIsOnline(false);
        
        $profile = $user->getProviderProfile();
        if ($profile) {
            $profile->setDeletedAt(new \DateTimeImmutable());
            $profile->setStatus('inactive');
        }
        
        $this->entityManager->flush();
        
        return $this->json(['success' => true, 'message' => 'Compte supprimé avec succès. Nous regrettons de vous voir partir !']);
    }
}