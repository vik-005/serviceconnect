<?php

namespace App\Controller\Api\Admin;

use App\Entity\ServiceCategory;
use App\Repository\ServiceCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/admin/categories')]
#[IsGranted('ROLE_ADMIN')]
class CategoryManagementController extends AbstractController
{
    public function __construct(
        private ServiceCategoryRepository $categoryRepository,
        private EntityManagerInterface $entityManager,
        private SluggerInterface $slugger
    ) {}

    #[Route('', name: 'api_admin_categories_list', methods: ['GET'])]
    public function list(): array
    {
        $categories = $this->categoryRepository->findAll();

        return array_map(fn($c) => [
            'id' => $c->getId(),
            'name' => $c->getName(),
            'slug' => $c->getSlug(),
            'iconUrl' => $c->getIconUrl(),
            'displayOrder' => $c->getDisplayOrder(),
            'isActive' => $c->isActive(),
            'createdAt' => $c->getCreatedAt(),
        ], $categories);
    }

    #[Route('', name: 'api_admin_categories_create', methods: ['POST'])]
    public function create(Request $request): array
    {
        $data = json_decode($request->getContent(), true);
        
        $category = new ServiceCategory();
        $category->setName($data['name']);
        $category->setSlug(strtolower($this->slugger->slug($data['name'])));
        $category->setIconUrl($data['iconUrl'] ?? null);
        $category->setDisplayOrder($data['displayOrder'] ?? 0);
        $category->setIsActive(true);

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return ['id' => $category->getId(), 'message' => 'Catégorie créée'];
    }

    #[Route('/{id}', name: 'api_admin_categories_update', methods: ['PUT'])]
    public function update(ServiceCategory $category, Request $request): array
    {
        $data = json_decode($request->getContent(), true);
        
        if (isset($data['name'])) {
            $category->setName($data['name']);
            $category->setSlug(strtolower($this->slugger->slug($data['name'])));
        }
        if (isset($data['iconUrl'])) $category->setIconUrl($data['iconUrl']);
        if (isset($data['displayOrder'])) $category->setDisplayOrder($data['displayOrder']);
        if (isset($data['isActive'])) $category->setIsActive($data['isActive']);

        $this->entityManager->flush();

        return ['id' => $category->getId(), 'message' => 'Catégorie mise à jour'];
    }

    #[Route('/{id}', name: 'api_admin_categories_delete', methods: ['DELETE'])]
    public function delete(ServiceCategory $category): array
    {
        $this->entityManager->remove($category);
        $this->entityManager->flush();

        return ['message' => 'Catégorie supprimée'];
    }

    #[Route('/reorder', name: 'api_admin_categories_reorder', methods: ['POST'])]
    public function reorder(Request $request): array
    {
        $data = json_decode($request->getContent(), true);
        $orders = $data['orders'] ?? [];

        foreach ($orders as $item) {
            $category = $this->categoryRepository->find($item['id']);
            if ($category) {
                $category->setDisplayOrder($item['order']);
            }
        }

        $this->entityManager->flush();

        return ['message' => 'Ordre mis à jour'];
        
        
    }
}
