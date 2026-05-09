<?php

namespace App\Dto\Response;

use App\Entity\ProviderProfile;

class ProviderProfileResponseDto
{
    public string $id;
    public ?string $bio;
    public int $yearsExperience;
    public float $ratingAverage;
    public int $totalReviews;
    public string $status;
    public bool $isVerified;
    public ?\DateTimeImmutable $createdAt;
    public ?\DateTimeImmutable $updatedAt;

    public static function fromEntity(ProviderProfile $profile): self
    {
        $dto = new self();
        $dto->id = $profile->getId()->toString();
        $dto->bio = $profile->getBio();
        $dto->yearsExperience = $profile->getYearsExperience();
        $dto->ratingAverage = $profile->getRatingAverage();
        $dto->totalReviews = $profile->getTotalReviews();
        $dto->status = $profile->getStatus();
        $dto->isVerified = $profile->isVerified();
        $dto->createdAt = $profile->getCreatedAt();
        $dto->updatedAt = $profile->getUpdatedAt();

        return $dto;
    }
}