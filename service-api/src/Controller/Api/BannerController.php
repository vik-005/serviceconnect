<?php

namespace App\Controller\Api;

use App\Repository\BannerRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/banners')]
class BannerController extends AbstractController
{
    public function __construct(
        private BannerRepository $bannerRepository
    ) {}

    #[Route('', name: 'api_banners_list', methods: ['GET'])]
    public function list(Request $request): array
    {
        $placement = $request->query->get('placement');
        $banners = $this->bannerRepository->findActiveByPlacement($placement);

        return array_map(fn($b) => [
            'id' => $b->getId(),
            'title' => $b->getTitle(),
            'imageUrl' => $b->getImageUrl(),
            'targetUrl' => $b->getTargetUrl(),
            'placement' => $b->getPlacement()
        ], $banners);
    }
}
