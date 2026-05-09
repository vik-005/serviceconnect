<?php

namespace App\Dto\Request\Admin;

use Symfony\Component\Validator\Constraints as Assert;

class CreateBannerDto
{
    #[Assert\NotBlank(message: 'Le titre est obligatoire')]
    #[Assert\Length(min: 3, max: 255, maxMessage: 'Le titre ne peut dépasser 255 caractères')]
    public string $title;

    #[Assert\NotBlank(message: 'L\'image est obligatoire')]
    public ?string $imageFile = null; // Multipart file path/name

    #[Assert\Url(message: 'URL invalide')]
    #[Assert\Length(max: 500)]
    public ?string $targetUrl = null;

    #[Assert\Choice(choices: ['home', 'search', 'profile'], message: 'Placement invalide')]
    public string $placement = 'home';

    #[Assert\Type(type: 'integer')]
    #[Assert\Range(min: 0, max: 999)]
    public int $displayOrder = 0;

    #[Assert\Type(type: 'datetime', message: 'Date de début invalide')]
    public ?\DateTimeInterface $startDate = null;

    #[Assert\Type(type: 'datetime', message: 'Date de fin invalide')]
    public ?\DateTimeInterface $endDate = null;
}

