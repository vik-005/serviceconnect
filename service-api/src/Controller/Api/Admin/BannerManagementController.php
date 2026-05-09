<?php

namespace App\Controller\Api\Admin;

use App\Dto\Request\Admin\CreateBannerDto;
use App\Dto\Request\Admin\UpdateBannerDto;
use App\Dto\Response\BannerResponseDto;
use App\Entity\Banner;
use App\Repository\BannerRepository;
use App\Service\MediaUploadService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use OpenApi\Attributes as OA;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

#[Route('/api/admin/banners')]
#[IsGranted('ROLE_ADMIN')]
class BannerManagementController
{
    public function __construct(
        private BannerRepository $bannerRepository,
        private EntityManagerInterface $entityManager,
        private MediaUploadService $mediaUploadService,
        private ValidatorInterface $validator
    ) {}

    #[Route('', methods: ['GET'])]
    #[OA\Get(
        summary: "Liste des bannières",
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'limit', in: 'query', schema: new OA\Schema(type: 'integer', default: 10)),
            new OA\Parameter(name: 'placement', in: 'query', schema: new OA\Schema(type: 'string', enum: ['home', 'search', 'profile'])),
            new OA\Parameter(name: 'active', in: 'query', schema: new OA\Schema(type: 'boolean')),
        ]
    )]
    public function list(int $page = 1, int $limit = 10, ?string $placement = null, ?bool $active = null): JsonResponse
    {
        $qb = $this->bannerRepository->createQueryBuilder('b')
            ->orderBy('b.displayOrder', 'ASC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        if ($placement) {
            $qb->andWhere('b.placement = :placement')->setParameter('placement', $placement);
        }

        if ($active !== null) {
            $qb->andWhere('b.isActive = :active')->setParameter('active', $active);
        }

        $banners = $qb->getQuery()->getResult();
        $total = $this->bannerRepository->createQueryBuilder('b')->select('COUNT(b.id)')->getQuery()->getSingleScalarResult();

        return new JsonResponse([
            'success' => true,
            'data' => array_map(BannerResponseDto::fromEntity(...), $banners),
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int) $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    #[Route('', methods: ['POST'])]
    #[OA\Post(summary: 'Créer une bannière')]
    public function create(
        #[MapRequestPayload] CreateBannerDto $dto,
        Request $request
    ): JsonResponse {
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'errors' => array_map(fn($v) => (string) $v, iterator_to_array($errors))
            ], 422);
        }

        $banner = new Banner();
        $banner->setTitle($dto->title);
        $banner->setPlacement($dto->placement);
        $banner->setDisplayOrder($dto->displayOrder);
        $banner->setIsActive(true);

        if ($dto->startDate) $banner->setStartDate($dto->startDate);
        if ($dto->endDate) $banner->setEndDate($dto->endDate);

        // Handle file upload
        if ($request->files->get('imageFile')) {
            $imageUrl = $this->mediaUploadService->upload($request->files->get('imageFile'), 'banners');
            $banner->setImageUrl($imageUrl);
        } elseif ($dto->imageFile) {
            $banner->setImageUrl($dto->imageFile);
        } else {
            return new JsonResponse(['success' => false, 'error' => 'Image requise'], 400);
        }

        if ($dto->targetUrl) {
            $banner->setTargetUrl($dto->targetUrl);
        }

        $this->entityManager->persist($banner);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'data' => BannerResponseDto::fromEntity($banner),
            'message' => 'Bannière créée avec succès'
        ], 201);
    }

    #[Route('/{id}', methods: ['PUT'])]
    #[OA\Put(summary: 'Modifier une bannière')]
    public function update(
        Banner $banner,
        #[MapRequestPayload] UpdateBannerDto $dto,
        Request $request
    ): JsonResponse {
        $errors = $this->validator->validate($dto);

        if (count($errors) > 0) {
            return new JsonResponse([
                'success' => false,
                'errors' => array_map(fn($v) => (string) $v, iterator_to_array($errors))
            ], 422);
        }

        if (isset($dto->title)) $banner->setTitle($dto->title);
        if (isset($dto->targetUrl)) $banner->setTargetUrl($dto->targetUrl);
        if (isset($dto->placement)) $banner->setPlacement($dto->placement);
        if (isset($dto->displayOrder)) $banner->setDisplayOrder($dto->displayOrder);
        if (isset($dto->isActive)) $banner->setIsActive($dto->isActive);
        if ($dto->startDate) $banner->setStartDate($dto->startDate);
        if ($dto->endDate) $banner->setEndDate($dto->endDate);

        // Handle file re-upload
        if ($request->files->get('imageFile')) {
            $imageUrl = $this->mediaUploadService->upload($request->files->get('imageFile'), 'banners');
            $banner->setImageUrl($imageUrl);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'data' => BannerResponseDto::fromEntity($banner),
            'message' => 'Bannière mise à jour'
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    #[OA\Delete(summary: 'Supprimer une bannière')]
    public function delete(Banner $banner): JsonResponse
    {
        $this->entityManager->remove($banner);
        $this->entityManager->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Bannière supprimée avec succès'
        ]);
    }
}

