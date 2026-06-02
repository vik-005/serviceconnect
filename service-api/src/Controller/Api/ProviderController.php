<?php

namespace App\Controller\Api;

use App\Repository\ProviderProfileRepository;
use App\Repository\ReviewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/providers')]
class ProviderController extends AbstractController
{
    public function __construct(
        private ProviderProfileRepository $providerRepository,
        private ReviewRepository $reviewRepository
    ) {}

    #[Route('/{id}', name: 'api_provider_detail', methods: ['GET'])]
    public function getProvider(string $id): JsonResponse
    {
        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            return $this->json(['success' => false, 'message' => 'Prestataire non trouvé'], 404);
        }

        $user = $provider->getUser();

        // Get services
        $services = [];
        foreach ($provider->getProviderServices() as $ps) {
            if ($ps->isActive()) {
                $services[] = [
                    'id' => $ps->getId(),
                    'categoryName' => $ps->getCategory()->getName(),
                    'categorySlug' => $ps->getCategory()->getSlug(),
                    'description' => $ps->getDescription()
                ];
            }
        }

        return $this->json([
            'id'              => $provider->getId(),
            'user'            => [
                'firstName' => $user->getFirstName(),
                'lastName'  => $user->getLastName(),
                'avatarUrl' => $user->getAvatarUrl(),
                'city'      => $user->getCity(),
                'isOnline'  => $user->isOnline(),
                'lastSeenAt' => $user->getLastSeenAt()?->format(\DateTimeInterface::ATOM),
            ],
            'bio'             => $provider->getBio(),
            'yearsExperience' => $provider->getYearsExperience(),
            'ratingAverage'   => $provider->getRatingAverage(),
            'totalReviews'    => $provider->getTotalReviews(),
            'status'          => $provider->getStatus(),
            'isVerified'      => $provider->isVerified(),
            'services'        => $services
        ]);
    }

    #[Route('/{id}/reviews', name: 'api_provider_reviews', methods: ['GET'])]
    public function getReviews(string $id): JsonResponse
    {
        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            return $this->json(['success' => false, 'message' => 'Prestataire non trouvé'], 404);
        }

        $reviews = $this->reviewRepository->findByProviderSorted($id);

        $data = array_map(fn($r) => [
            'id' => $r->getId(),
            'rating' => $r->getRating(),
            'comment' => $r->getComment(),
            'createdAt' => $r->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'client' => [
                'firstName' => $r->getClient()->getFirstName(),
                'lastName' => $r->getClient()->getLastName(),
                'avatarUrl' => $r->getClient()->getAvatarUrl()
            ]
        ], $reviews);

        return $this->json($data);
    }
}