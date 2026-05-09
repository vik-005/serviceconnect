<?php

namespace App\Dto\Request\Admin;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateBannerDto
{
    #[Assert\Length(min: 3, max: 255, maxMessage: 'Le titre ne peut dépasser 255 caractères')]
    public ?string $title = null;

    #[Assert\Url(message: 'URL invalide')]
    #[Assert\Length(max: 500)]
    public ?string $targetUrl = null;

    #[Assert\Choice(choices: ['home', 'search', 'profile'], message: 'Placement invalide')]
    public ?string $placement = null;

    #[Assert\Type(type: 'integer')]
    #[Assert\Range(min: 0, max: 999)]
    public ?int $displayOrder = null;

    #[Assert\Type(type: 'bool')]
    public ?bool $isActive = null;

    #[Assert\Type(type: 'datetime', message: 'Date de début invalide')]
    public ?\DateTimeInterface $startDate = null;

    #[Assert\Type(type: 'datetime', message: 'Date de fin invalide')]
    public ?\DateTimeInterface $endDate = null;

    public ?string $imageFile = null; // For re-upload
}

