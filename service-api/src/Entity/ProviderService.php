<?php

namespace App\Entity;

use App\Entity\Traits\SoftDeletableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Repository\ProviderServiceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ProviderServiceRepository::class)]
#[ORM\Table(name: 'provider_services')]
#[ORM\HasLifecycleCallbacks]
class ProviderService
{
    use TimestampableTrait;
    use SoftDeletableTrait;

    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private Uuid $id;

    #[ORM\ManyToOne(targetEntity: ProviderProfile::class, inversedBy: 'providerServices')]
    #[ORM\JoinColumn(name: 'provider_profile_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ProviderProfile $providerProfile;

    #[ORM\ManyToOne(targetEntity: ServiceCategory::class, inversedBy: 'providerServices')]
    #[ORM\JoinColumn(name: 'category_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    private ServiceCategory $category;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    public function __construct()
    {
        $this->id = Uuid::v6();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getProviderProfile(): ProviderProfile
    {
        return $this->providerProfile;
    }

    public function setProviderProfile(ProviderProfile $providerProfile): self
    {
        $this->providerProfile = $providerProfile;
        return $this;
    }

    public function getCategory(): ServiceCategory
    {
        return $this->category;
    }

    public function setCategory(ServiceCategory $category): self
    {
        $this->category = $category;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
        return $this;
    }
}
