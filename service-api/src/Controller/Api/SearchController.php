<?php

namespace App\Controller\Api;

use App\Repository\ServiceCategoryRepository;
use App\Service\GeoSearchService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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
    public function search(Request $request): JsonResponse
    {
        $categorySlug = $request->query->get('category');
        $lat          = (float) $request->query->get('lat');
        $lng          = (float) $request->query->get('lng');
        $radius       = (int) $request->query->get('radius', 50000);
        $page         = (int) $request->query->get('page', 1);
        $limit        = (int) $request->query->get('limit', 10);
        $country      = $request->query->get('country');

        $category = null;
        if ($categorySlug) {
            $category = $this->categoryRepository->findOneBy(['slug' => $categorySlug]);
        }

        $searchData = $this->geoSearchService->findNearby($category, $lat, $lng, $radius, $page, $limit, $country);
        $results = $searchData['results'];
        $total = $searchData['total'];

        $formatted = [];
        foreach ($results as $item) {
            $profile = $item['provider'];
            $user = $profile->getUser();
            
            $services = [];
            $categories = [];
            foreach ($profile->getProviderServices() as $ps) {
                $serv = $ps->getService();
                if ($serv) {
                    $services[] = [
                        'id' => $serv->getId(),
                        'name' => $serv->getName(),
                        'description' => $serv->getDescription(),
                        'categoryId' => $serv->getCategory() ? $serv->getCategory()->getId() : null
                    ];
                }
                
                $cat = $ps->getCategory();
                if ($cat && !in_array($cat->getId(), array_column($categories, 'id'))) {
                    $categories[] = [
                        'id' => $cat->getId(),
                        'name' => $cat->getName(),
                        'slug' => $cat->getSlug(),
                        'iconUrl' => $cat->getIconUrl()
                    ];
                }
            }

            $formatted[] = [
                'id' => $profile->getId(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'avatarUrl' => $user->getAvatarUrl(),
                'city' => $user->getCity(),
                'country' => $user->getCountry(),
                'isOnline' => $user->isOnline(),
                'bio' => $profile->getBio(),
                'experienceYears' => $profile->getYearsExperience(),
                'status' => $profile->getStatus(),
                'averageRating' => $profile->getRatingAverage(),
                'reviewCount' => $profile->getTotalReviews(),
                'isVerified' => $profile->isVerified(),
                'distance' => $item['distance_km'],
                'location' => [
                    'lat' => $user->getLatitude(),
                    'lng' => $user->getLongitude(),
                    'city' => $user->getCity(),
                    'address' => $user->getCity()
                ],
                'services' => $services,
                'categories' => $categories,
                'portfolio' => [],
                'reviews' => []
            ];
        }

        $lastPage = (int) ceil($total / $limit);

        return $this->json([
            'success' => true,
            'data' => $formatted,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'lastPage' => $lastPage > 0 ? $lastPage : 1,
                'limit' => $limit
            ]
        ]);
    }

    #[Route('/categories', name: 'api_categories_list', methods: ['GET'])]
    public function categories(): JsonResponse
    {
        $categories = $this->categoryRepository->findBy(['isActive' => true], ['displayOrder' => 'ASC']);

        $data = array_map(fn ($c) => [
            'id'           => $c->getId(),
            'name'         => $c->getName(),
            'slug'         => $c->getSlug(),
            'iconUrl'      => $c->getIconUrl(),
            'displayOrder' => $c->getDisplayOrder(),
        ], $categories);

        return $this->json($data);
    }
}