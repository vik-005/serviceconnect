<?php

namespace App\Dto\Request;

use Symfony\Component\Validator\Constraints as Assert;

class LoginDto
{
    #[Assert\NotBlank(message: "L'identifiant est obligatoire")]
    public string $email;

    #[Assert\NotBlank(message: "Le mot de passe est obligatoire")]
    public string $password;
}