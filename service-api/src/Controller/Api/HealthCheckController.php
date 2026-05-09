<?php

namespace App\Controller\Api;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/health')]
class HealthCheckController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('', name: 'api_health', methods: ['GET'])]
    public function check(): JsonResponse
    {
        $checks = [
            'status' => 'ok',
            'timestamp' => time(),
            'database' => $this->checkDatabase(),
            'php_version' => PHP_VERSION,
        ];

        return new JsonResponse($checks, $checks['database'] === 'up' ? 200 : 503);
    }

    private function checkDatabase(): string
    {
        try {
            $this->entityManager->getConnection()->connect();
            return 'up';
        } catch (\Exception $e) {
            return 'down';
        }
    }
}
