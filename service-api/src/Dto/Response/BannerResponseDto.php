<?php

namespace App\Dto\Response;

use App\Entity\Banner;

class BannerResponseDto
{
    public function __construct(
        public string $id,
        public string $title,
        public string $imageUrl,
        public ?string $targetUrl,
        public string $placement,
        public bool $isActive,
        public ?\DateTimeInterface $startDate,
        public ?\DateTimeInterface $endDate,
        public int $displayOrder,
        public ?\DateTimeInterface $createdAt
    ) {}

    public static function fromEntity(Banner $banner): self
    {
        return new self(
            $banner->getId()->toRfc4122(),
            $banner->getTitle(),
            $banner->getImageUrl(),
            $banner->getTargetUrl(),
            $banner->getPlacement(),
            $banner->isActive(),
            $banner->getStartDate(),
            $banner->getEndDate(),
            $banner->getDisplayOrder(),
            $banner->getCreatedAt()
        );
    }
}

