<?php

namespace App\Controller\Api\Admin;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/users')]
#[IsGranted('ROLE_ADMIN')]
class UserManagementController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'api_admin_users_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $role = $request->query->get('role');
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);

        if ($page < 1) $page = 1;
        if ($limit < 1 || $limit > 100) $limit = 10;

        $users = $this->userRepository->findPaginatedUsers($page, $limit, $role);
        $total = $this->userRepository->countUsers($role);

        $data = array_map(fn($u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'firstName' => $u->getFirstName(),
            'lastName' => $u->getLastName(),
            'role' => $u->getRole(),
            'isActive' => $u->isActive(),
            'createdAt' => $u->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'isVerified' => $u->getProviderProfile() ? $u->getProviderProfile()->isVerified() : false
        ], $users);

        return new JsonResponse([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    #[Route('/{id}/toggle-status', name: 'api_admin_users_toggle', methods: ['POST'])]
    public function toggleStatus(User $user): JsonResponse
    {
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();
        if ($currentUser && $currentUser->getId() === $user->getId()) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Vous ne pouvez pas désactiver votre propre compte administrateur.'
            ], 400);
        }

        $user->setIsActive(!$user->isActive());
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'isActive' => $user->isActive(),
            'message' => 'Statut mis à jour avec succès'
        ]);
    }

    #[Route('/{id}/verify', name: 'api_admin_users_verify', methods: ['POST'])]
    public function verify(User $user): JsonResponse
    {
        if ($profile = $user->getProviderProfile()) {
            $profile->setIsVerified(true);
            $this->entityManager->flush();
            return new JsonResponse([
                'success' => true,
                'message' => 'Prestataire vérifié avec succès'
            ]);
        }
        
        return new JsonResponse([
            'success' => false,
            'message' => 'Cet utilisateur n\'a pas de profil prestataire'
        ], 400);
    }

    #[Route('/{id}', name: 'api_admin_users_update', methods: ['PUT'])]
    public function update(User $user, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['firstName'])) $user->setFirstName($data['firstName']);
        if (isset($data['lastName'])) $user->setLastName($data['lastName']);
        if (isset($data['email'])) $user->setEmail($data['email']);
        if (isset($data['role'])) $user->setRole($data['role']);
        if (isset($data['isActive'])) {
            /** @var User|null $currentUser */
            $currentUser = $this->getUser();
            if ($currentUser && $currentUser->getId() === $user->getId() && !$data['isActive']) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Vous ne pouvez pas désactiver votre propre compte.'
                ], 400);
            }
            $user->setIsActive($data['isActive']);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'role' => $user->getRole(),
                'isActive' => $user->isActive(),
            ],
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }

    #[Route('/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function delete(User $user): JsonResponse
    {
        /** @var User|null $currentUser */
        $currentUser = $this->getUser();
        if ($currentUser && $currentUser->getId() === $user->getId()) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte administrateur.'
            ], 400);
        }

        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}
