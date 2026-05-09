<?php

namespace App\Controller\Api\Admin;

use App\Repository\ConversationRepository;
use App\Repository\ProviderProfileRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/stats')]
#[IsGranted('ROLE_ADMIN')]
class StatsController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private ProviderProfileRepository $providerProfileRepository,
        private ConversationRepository $conversationRepository
    ) {}

    #[Route('', name: 'api_admin_stats', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $thirtyDaysAgo = new \DateTime('-30 days');

        return $this->json([
            'summary' => [
                'total_users'         => $this->userRepository->count([]),
                'total_providers'     => $this->userRepository->count(['role' => 'provider']),
                'active_providers'    => $this->providerProfileRepository->count(['status' => 'active']),
                'total_conversations' => $this->conversationRepository->count([]),
            ],
            'growth' => [
                'new_users_30d'         => $this->getNewUsersCount($thirtyDaysAgo),
                'new_conversations_30d' => $this->getNewConversationsCount($thirtyDaysAgo),
                'users_series'          => $this->getGrowthSeries('users'),
                'conversations_series'  => $this->getGrowthSeries('conversations'),
            ],
            'distribution' => [
                'by_role'   => $this->getRoleDistribution(),
                'by_status' => $this->getProviderStatusDistribution(),
            ]
        ]);
    }

    private function getGrowthSeries(string $type): array
    {
        $thirtyDaysAgo = new \DateTime('-30 days');
        $repo = $type === 'users' ? $this->userRepository : $this->conversationRepository;

        $results = $repo->createQueryBuilder('e')
            ->select('SUBSTRING(e.createdAt, 1, 10) as dateGroup, COUNT(e.id) as count')
            ->where('e.createdAt >= :since')
            ->setParameter('since', $thirtyDaysAgo)
            ->groupBy('dateGroup')
            ->orderBy('dateGroup', 'ASC')
            ->getQuery()
            ->getResult();

        $indexedResults = [];
        foreach ($results as $r) {
            $indexedResults[$r['dateGroup']] = (int) $r['count'];
        }

        $series = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = new \DateTime("-$i days");
            $dateStr = $date->format('Y-m-d');
            $series[] = [
                'date'  => $dateStr,
                'label' => $date->format('d M'),
                'value' => $indexedResults[$dateStr] ?? 0
            ];
        }

        return $series;
    }

    private function getNewUsersCount(\DateTime $since): int
    {
        return $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt >= :since')
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    private function getNewConversationsCount(\DateTime $since): int
    {
        return $this->conversationRepository->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.createdAt >= :since')
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    private function getRoleDistribution(): array
    {
        $results = $this->userRepository->createQueryBuilder('u')
            ->select('u.role, COUNT(u.id) as count')
            ->groupBy('u.role')
            ->getQuery()
            ->getResult();

        return array_map(fn($r) => [
            'label' => ucfirst($r['role']),
            'value' => (int) $r['count'],
            'key'   => $r['role']
        ], $results);
    }

    private function getProviderStatusDistribution(): array
    {
        $results = $this->providerProfileRepository->createQueryBuilder('pp')
            ->select('pp.status, COUNT(pp.id) as count')
            ->groupBy('pp.status')
            ->getQuery()
            ->getResult();

        return array_map(fn($r) => [
            'label' => ucfirst($r['status']),
            'value' => (int) $r['count'],
            'key'   => $r['status']
        ], $results);
    }
}
