<?php

namespace App\Dto\Response;

class AuthResponseDto
{
    public bool $success = true;
    public ?string $message = null;
    public ?array $errors = [];
    public ?UserResponseDto $user = null;
    public ?string $token = null;
    public ?string $refreshToken = null;
    public ?int $expiresIn = null; // en secondes
}