<?php

namespace App\Controller\Api;

use App\Entity\Review;
use App\Entity\User;
use App\Repository\ProviderProfileRepository;
use App\Service\RatingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/reviews')]
class ReviewController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface    $entityManager,
        private ProviderProfileRepository $providerProfileRepository,
        private RatingService             $ratingService
    ) {}

    #[Route('', name: 'api_reviews_create', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['providerId'])) {
            return $this->json(['success' => false, 'message' => 'providerId est obligatoire'], 400);
        }

        if (!isset($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
            return $this->json(['success' => false, 'message' => 'La note doit être entre 1 et 5'], 400);
        }

        /** @var User $user */
        $user            = $this->getUser();
        $providerProfile = $this->providerProfileRepository->find($data['providerId']);

        if (!$providerProfile) {
            return $this->json(['success' => false, 'message' => 'Prestataire non trouvé'], 404);
        }

        $review = new Review();
        $review->setClient($user);
        $review->setProviderProfile($providerProfile);
        $review->setRating((int) $data['rating']);
        $review->setComment($data['comment'] ?? null);

        $this->entityManager->persist($review);
        $this->entityManager->flush();

        $this->ratingService->recalculateAverage($providerProfile);

        return $this->json([
            'id'        => $review->getId(),
            'rating'    => $review->getRating(),
            'comment'   => $review->getComment(),
            'createdAt' => $review->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ], 201);
    }
}
