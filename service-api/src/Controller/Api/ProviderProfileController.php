<?php

namespace App\Controller\Api;

use App\Entity\ProviderProfile;
use App\Entity\ProviderService;
use App\Repository\ProviderProfileRepository;
use App\Repository\ServiceCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/provider/profile')]
#[IsGranted('ROLE_PROVIDER')]
class ProviderProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ProviderProfileRepository $profileRepository,
        private ServiceCategoryRepository $categoryRepository
    ) {}

    #[Route('', name: 'api_provider_profile_update', methods: ['PATCH'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $profile = $user->getProviderProfile();
        
        if (!$profile) {
            return $this->json(['success' => false, 'message' => 'Profil prestataire non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (isset($data['bio'])) $profile->setBio($data['bio']);
        if (isset($data['yearsExperience'])) $profile->setYearsExperience((int) $data['yearsExperience']);
        
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Profil mis à jour']);
    }

    #[Route('/services', name: 'api_provider_services_add', methods: ['POST'])]
    public function addService(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $profile = $user->getProviderProfile();
        
        $data = json_decode($request->getContent(), true);
        $categoryId = $data['categoryId'] ?? null;
        
        if (!$categoryId) {
            return $this->json(['success' => false, 'message' => 'ID catégorie manquant'], 400);
        }

        $category = $this->categoryRepository->find($categoryId);
        if (!$category) {
            return $this->json(['success' => false, 'message' => 'Catégorie non trouvée'], 404);
        }

        // Check if service already exists
        foreach ($profile->getProviderServices() as $existingService) {
            if ($existingService->getCategory()->getId() === $category->getId()) {
                return $this->json(['success' => false, 'message' => 'Ce service est déjà enregistré'], 400);
            }
        }

        $service = new ProviderService();
        $service->setProviderProfile($profile);
        $service->setCategory($category);
        $service->setDescription($data['description'] ?? null);
        $service->setIsActive(true);

        $this->entityManager->persist($service);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Service ajouté']);
    }

    #[Route('/services/{id}', name: 'api_provider_services_remove', methods: ['DELETE'])]
    public function removeService(string $id): JsonResponse
    {
        $user = $this->getUser();
        $profile = $user->getProviderProfile();
        
        $service = null;
        foreach ($profile->getProviderServices() as $s) {
            if ($s->getId()->toString() === $id) {
                $service = $s;
                break;
            }
        }

        if (!$service) {
            return $this->json(['success' => false, 'message' => 'Service non trouvé'], 404);
        }

        $this->entityManager->remove($service);
        $this->entityManager->flush();

        return $this->json(['success' => true, 'message' => 'Service supprimé']);
    }
}
