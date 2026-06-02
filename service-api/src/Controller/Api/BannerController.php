<?php

namespace App\Controller\Api;

use App\Repository\BannerRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/banners')]
class BannerController extends AbstractController
{
    public function __construct(
        private BannerRepository $bannerRepository
    ) {}

    #[Route('', name: 'api_banners_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $placement = $request->query->get('placement');
        $banners   = $this->bannerRepository->findActiveByPlacement($placement);

        $data = array_map(fn ($b) => [
            'id'        => $b->getId(),
            'title'     => $b->getTitle(),
            'imageUrl'  => $b->getImageUrl(),
            'targetUrl' => $b->getTargetUrl(),
            'placement' => $b->getPlacement(),
        ], $banners);

        return $this->json($data);
    }
}
