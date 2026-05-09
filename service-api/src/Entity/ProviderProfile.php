<?php

namespace App\Entity;

use App\Entity\Traits\SoftDeletableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Repository\ProviderProfileRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ProviderProfileRepository::class)]
#[ORM\Table(name: 'provider_profiles')]
#[ORM\Index(columns: ['status'], name: 'idx_provider_status')]
#[ORM\HasLifecycleCallbacks]
class ProviderProfile
{
    use TimestampableTrait;
    use SoftDeletableTrait;

    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private Uuid $id;

    #[ORM\OneToOne(targetEntity: User::class, inversedBy: 'providerProfile')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['conv:read', 'provider:read'])]
    private User $user;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private ?string $bio = null;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Groups(['user:read', 'provider:read'])]
    private int $yearsExperience = 0;

    #[ORM\Column(type: 'float', options: ['default' => 0.0])]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private float $ratingAverage = 0.0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Groups(['user:read', 'provider:read'])]
    private int $totalReviews = 0;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => 'active'])]
    #[Groups(['user:read', 'provider:read'])]
    private string $status = 'active';

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['user:read', 'provider:read'])]
    private bool $isVerified = false;

    #[ORM\OneToMany(targetEntity: ProviderService::class, mappedBy: 'providerProfile')]
    private Collection $providerServices;

    #[ORM\OneToMany(targetEntity: Portfolio::class, mappedBy: 'providerProfile')]
    private Collection $portfolios;

    #[ORM\OneToMany(targetEntity: Conversation::class, mappedBy: 'providerProfile')]
    private Collection $conversationsAsProvider;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'providerProfile')]
    private Collection $reviewsAsProvider;

    public function __construct()
    {
        $this->id = Uuid::v6();
        $this->providerServices = new ArrayCollection();
        $this->portfolios = new ArrayCollection();
        $this->conversationsAsProvider = new ArrayCollection();
        $this->reviewsAsProvider = new ArrayCollection();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): self
    {
        $this->bio = $bio;
        return $this;
    }

    public function getYearsExperience(): int
    {
        return $this->yearsExperience;
    }

    public function setYearsExperience(int $yearsExperience): self
    {
        $this->yearsExperience = $yearsExperience;
        return $this;
    }

    public function getRatingAverage(): float
    {
        return $this->ratingAverage;
    }

    public function setRatingAverage(float $ratingAverage): self
    {
        $this->ratingAverage = $ratingAverage;
        return $this;
    }

    public function getTotalReviews(): int
    {
        return $this->totalReviews;
    }

    public function setTotalReviews(int $totalReviews): self
    {
        $this->totalReviews = $totalReviews;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;
        return $this;
    }

    /**
     * @return Collection<int, ProviderService>
     */
    public function getProviderServices(): Collection
    {
        return $this->providerServices;
    }

    public function addProviderService(ProviderService $providerService): self
    {
        if (!$this->providerServices->contains($providerService)) {
            $this->providerServices->add($providerService);
            $providerService->setProviderProfile($this);
        }
        return $this;
    }

    public function removeProviderService(ProviderService $providerService): self
    {
        if ($this->providerServices->removeElement($providerService)) {
            if ($providerService->getProviderProfile() === $this) {
                $providerService->setProviderProfile(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Portfolio>
     */
    public function getPortfolios(): Collection
    {
        return $this->portfolios;
    }

    public function addPortfolio(Portfolio $portfolio): self
    {
        if (!$this->portfolios->contains($portfolio)) {
            $this->portfolios->add($portfolio);
            $portfolio->setProviderProfile($this);
        }
        return $this;
    }

    public function removePortfolio(Portfolio $portfolio): self
    {
        if ($this->portfolios->removeElement($portfolio)) {
            if ($portfolio->getProviderProfile() === $this) {
                $portfolio->setProviderProfile(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getConversationsAsProvider(): Collection
    {
        return $this->conversationsAsProvider;
    }

    public function addConversationAsProvider(Conversation $conversation): self
    {
        if (!$this->conversationsAsProvider->contains($conversation)) {
            $this->conversationsAsProvider->add($conversation);
            $conversation->setProviderProfile($this);
        }
        return $this;
    }

    public function removeConversationAsProvider(Conversation $conversation): self
    {
        if ($this->conversationsAsProvider->removeElement($conversation)) {
            if ($conversation->getProviderProfile() === $this) {
                $conversation->setProviderProfile(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviewsAsProvider(): Collection
    {
        return $this->reviewsAsProvider;
    }

    public function addReviewAsProvider(Review $review): self
    {
        if (!$this->reviewsAsProvider->contains($review)) {
            $this->reviewsAsProvider->add($review);
            $review->setProviderProfile($this);
        }
        return $this;
    }

    public function removeReviewAsProvider(Review $review): self
    {
        if ($this->reviewsAsProvider->removeElement($review)) {
            if ($review->getProviderProfile() === $this) {
                $review->setProviderProfile(null);
            }
        }
        return $this;
    }
}
