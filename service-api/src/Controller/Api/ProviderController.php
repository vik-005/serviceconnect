<?php

namespace App\Controller\Api;

use App\Repository\ProviderProfileRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/providers')]
class ProviderController extends AbstractController
{
    public function __construct(
        private ProviderProfileRepository $providerRepository
    ) {}

    #[Route('/{id}', name: 'api_provider_detail', methods: ['GET'])]
    public function getProvider(string $id): array
    {
        $provider = $this->providerRepository->find($id);

        if (!$provider) {
            throw $this->createNotFoundException('Prestataire non trouvé');
        }

        $user = $provider->getUser();

        return [
            'id' => $provider->getId(),
            'user' => [
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'avatarUrl' => $user->getAvatarUrl(),
                'city' => $user->getCity()
            ],
            'bio' => $provider->getBio(),
            'yearsExperience' => $provider->getYearsExperience(),
            'ratingAverage' => $provider->getRatingAverage(),
            'totalReviews' => $provider->getTotalReviews(),
            'status' => $provider->getStatus(),
            'services' => $provider->getProviderServices()->toArray()
        ];
    }
}