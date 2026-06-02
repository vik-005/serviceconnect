<?php

namespace App\Controller\Api;

use App\Entity\Portfolio;
use App\Entity\User;
use App\Service\MediaUploadService;
use App\Repository\PortfolioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/portfolio')]
class PortfolioController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PortfolioRepository $portfolioRepository,
        private MediaUploadService $mediaUploadService
    ) {}

    #[Route('', name: 'api_portfolio_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $providerProfile = $user->getProviderProfile();

        if (!$providerProfile) {
            return $this->json(['success' => false, 'message' => 'Profil prestataire non trouvé'], 404);
        }

        $items = $this->portfolioRepository->findBy(['providerProfile' => $providerProfile], ['createdAt' => 'DESC']);

        $data = array_map(fn($item) => [
            'id' => $item->getId(),
            'title' => $item->getTitle(),
            'description' => $item->getDescription(),
            'mediaUrl' => $item->getMediaUrl(),
            'mediaType' => $item->getMediaType(),
            'createdAt' => $item->getCreatedAt()?->format(\DateTimeInterface::ATOM)
        ], $items);

        return $this->json($data);
    }

    #[Route('', name: 'api_portfolio_create', methods: ['POST'])]
    #[IsGranted('ROLE_PROVIDER')]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $providerProfile = $user->getProviderProfile();

        if (!$providerProfile) {
            return $this->json(['success' => false, 'message' => 'Profil prestataire non trouvé'], 404);
        }

        $file = $request->files->get('media');
        if (!$file) {
            return $this->json(['success' => false, 'message' => 'Média manquant'], 400);
        }

        $mediaUrl = $this->mediaUploadService->upload($file, 'portfolio');

        $portfolio = new Portfolio();
        $portfolio->setProviderProfile($providerProfile);
        $portfolio->setTitle($request->request->get('title'));
        $portfolio->setDescription($request->request->get('description'));
        $portfolio->setMediaUrl($mediaUrl);
        $portfolio->setMediaType($file->getClientMimeType());

        $this->entityManager->persist($portfolio);
        $this->entityManager->flush();

        return $this->json([
            'id' => $portfolio->getId(),
            'title' => $portfolio->getTitle(),
            'mediaUrl' => $portfolio->getMediaUrl()
        ], 201);
    }

    #[Route('/{id}', name: 'api_portfolio_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_PROVIDER')]
    public function delete(string $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $providerProfile = $user->getProviderProfile();

        $portfolio = $this->portfolioRepository->find($id);

        if (!$portfolio || $portfolio->getProviderProfile() !== $providerProfile) {
            return $this->json(['success' => false, 'message' => 'Élément de portfolio non trouvé'], 404);
        }

        $this->entityManager->remove($portfolio);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Élément supprimé avec succès']);
    }
}
