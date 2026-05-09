<?php

namespace App\Dto\Request;

use Symfony\Component\Validator\Constraints as Assert;

class LoginDto
{
    #[Assert\NotBlank(message: "L'email est obligatoire")]
    #[Assert\Email(message: "Format d'email invalide")]
    public string $email;

    #[Assert\NotBlank(message: "Le mot de passe est obligatoire")]
    public string $password;
}