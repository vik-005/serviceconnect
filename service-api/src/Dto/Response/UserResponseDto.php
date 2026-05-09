<?php

namespace App\Dto\Response;

use App\Entity\User;

class UserResponseDto
{
    public string $id;
    public string $email;
    public ?string $phone;
    public string $firstName;
    public string $lastName;
    public ?string $avatarUrl;
    public ?float $latitude;
    public ?float $longitude;
    public ?string $city;
    public string $country;
    public bool $isActive;
    public string $role;
    public ?\DateTimeImmutable $createdAt;
    public ?\DateTimeImmutable $updatedAt;

    // Pour les prestataires
    public ?ProviderProfileResponseDto $providerProfile = null;

    public static function fromEntity(User $user): self
    {
        $dto = new self();
        $dto->id = $user->getId()->toString();
        $dto->email = $user->getEmail();
        $dto->phone = $user->getPhone();
        $dto->firstName = $user->getFirstName();
        $dto->lastName = $user->getLastName();
        $dto->avatarUrl = $user->getAvatarUrl();
        $dto->latitude = $user->getLatitude();
        $dto->longitude = $user->getLongitude();
        $dto->city = $user->getCity();
        $dto->country = $user->getCountry();
        $dto->isActive = $user->isActive();
        $dto->role = $user->getRole();
        $dto->createdAt = $user->getCreatedAt();
        $dto->updatedAt = $user->getUpdatedAt();

        if ($user->getProviderProfile()) {
            $dto->providerProfile = ProviderProfileResponseDto::fromEntity($user->getProviderProfile());
        }

        return $dto;
    }
}