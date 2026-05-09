<?php

namespace App\Controller\Api\Admin;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    public function list(Request $request): array
    {
        $role = $request->query->get('role');
        $users = $role ? $this->userRepository->findBy(['role' => $role]) : $this->userRepository->findAll();

        return array_map(fn($u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'firstName' => $u->getFirstName(),
            'lastName' => $u->getLastName(),
            'role' => $u->getRole(),
            'isActive' => $u->isActive(),
            'createdAt' => $u->getCreatedAt(),
            'isVerified' => $u->getProviderProfile() ? $u->getProviderProfile()->isVerified() : false
        ], $users);
    }

    #[Route('/{id}/toggle-status', name: 'api_admin_users_toggle', methods: ['POST'])]
    public function toggleStatus(User $user): array
    {
        $user->setIsActive(!$user->isActive());
        $this->entityManager->flush();

        return ['isActive' => $user->isActive(), 'message' => 'Statut mis à jour'];
    }

    #[Route('/{id}/verify', name: 'api_admin_users_verify', methods: ['POST'])]
    public function verify(User $user): array
    {
        if ($profile = $user->getProviderProfile()) {
            $profile->setIsVerified(true);
            $this->entityManager->flush();
            return ['message' => 'Prestataire vérifié'];
        }
        
        throw new \InvalidArgumentException('Cet utilisateur n\'a pas de profil prestataire');
    }

    #[Route('/{id}', name: 'api_admin_users_update', methods: ['PUT'])]
    public function update(User $user, Request $request): array
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['firstName'])) $user->setFirstName($data['firstName']);
        if (isset($data['lastName'])) $user->setLastName($data['lastName']);
        if (isset($data['email'])) $user->setEmail($data['email']);
        if (isset($data['role'])) $user->setRole($data['role']);
        if (isset($data['isActive'])) $user->setIsActive($data['isActive']);

        $this->entityManager->flush();

        return ['id' => $user->getId(), 'message' => 'Utilisateur mis à jour'];
    }

    #[Route('/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function delete(User $user): array
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();

        return ['message' => 'Utilisateur supprimé'];
    }
}
