<?php

namespace App\Dto\Request;

use Symfony\Component\Validator\Constraints as Assert;

class UpdateProfileDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 50)]
    public ?string $firstName = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 50)]
    public ?string $lastName = null;

    #[Assert\Length(max: 20)]
    public ?string $phone = null;

    public ?float $latitude = null;

    public ?float $longitude = null;
}
