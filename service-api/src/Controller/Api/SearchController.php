<?php

namespace App\Controller\Api;

use App\Repository\ServiceCategoryRepository;
use App\Service\GeoSearchService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/search')]
class SearchController extends AbstractController
{
    public function __construct(
        private GeoSearchService $geoSearchService,
        private ServiceCategoryRepository $categoryRepository
    ) {}

    #[Route('/providers', name: 'api_search_providers', methods: ['GET'])]
    public function search(Request $request): array
    {
        $categorySlug = $request->query->get('category');
        $lat = (float) $request->query->get('lat');
        $lng = (float) $request->query->get('lng');
        $radius = (int) $request->query->get('radius', 50000);
        $page = (int) $request->query->get('page', 1);
        $limit = (int) $request->query->get('limit', 10);

        $country = $request->query->get('country');

        $category = null;
        if ($categorySlug) {
            $category = $this->categoryRepository->findOneBy(['slug' => $categorySlug]);
        }

        $request->attributes->set('_groups', ['provider:read']);
        return $this->geoSearchService->findNearby($category, $lat, $lng, $radius, $page, $limit, $country);
    }

    #[Route('/categories', name: 'api_categories_list', methods: ['GET'])]
    public function categories(): array
    {
        $categories = $this->categoryRepository->findBy(['isActive' => true], ['displayOrder' => 'ASC']);
        
        return array_map(fn($c) => [
            'id' => $c->getId(),
            'name' => $c->getName(),
            'slug' => $c->getSlug(),
            'iconUrl' => $c->getIconUrl(),
            'displayOrder' => $c->getDisplayOrder()
        ], $categories);
    }
}