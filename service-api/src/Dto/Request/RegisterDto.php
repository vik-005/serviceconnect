<?php

namespace App\Dto\Request;

use Symfony\Component\Validator\Constraints as Assert;

class RegisterDto
{
    #[Assert\NotBlank(message: "L'email est obligatoire")]
    #[Assert\Email(message: "Format d'email invalide")]
    public string $email;

    #[Assert\NotBlank(message: "Le mot de passe est obligatoire")]
    #[Assert\Length(
        min: 8,
        minMessage: "Le mot de passe doit contenir au moins {{ limit }} caractères",
        max: 255
    )]
    #[Assert\Regex(
        pattern: "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/",
        message: "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    )]
    public string $password;

    #[Assert\NotBlank(message: "Le prénom est obligatoire")]
    #[Assert\Length(min: 2, max: 100)]
    public string $firstName;

    #[Assert\NotBlank(message: "Le nom est obligatoire")]
    #[Assert\Length(min: 2, max: 100)]
    public string $lastName;

    #[Assert\Regex(
        pattern: "/^\+?[0-9\s\-\(\)]+$/",
        message: "Format de téléphone invalide"
    )]
    public ?string $phone = null;

    #[Assert\Choice(choices: ['client', 'provider'], message: "Le rôle doit être 'client' ou 'provider'")]
    public string $role = 'client';

    #[Assert\NotBlank(message: "Le pays est obligatoire")]
    #[Assert\Country(message: "Pays invalide")]
    public string $country = 'BJ';
}
