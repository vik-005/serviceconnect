<?php

namespace App\Controller\Api;

use App\Entity\Portfolio;
use App\Entity\User;
use App\Service\MediaUploadService;
use App\Repository\PortfolioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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

    #[Route('', name: 'api_portfolio_create', methods: ['POST'])]
    #[IsGranted('ROLE_PROVIDER')]
    public function create(Request $request): array
    {
        /** @var User $user */
        $user = $this->getUser();
        $providerProfile = $user->getProviderProfile();

        $file = $request->files->get('media');
        if (!$file) {
            throw new \InvalidArgumentException('Média manquant');
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

        return [
            'id' => $portfolio->getId(),
            'title' => $portfolio->getTitle(),
            'mediaUrl' => $portfolio->getMediaUrl()
        ];
    }
}
