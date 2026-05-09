<?php

namespace App\Entity;

use App\Entity\Traits\SoftDeletableTrait;
use App\Entity\Traits\TimestampableTrait;
use App\Entity\Traits\UuidTrait;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Uid\Uuid;

use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
#[ORM\Index(columns: ['email'], name: 'idx_user_email')]
#[ORM\Index(columns: ['role'], name: 'idx_user_role')]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use UuidTrait;
    use TimestampableTrait;
    use SoftDeletableTrait;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Groups(['user:read', 'conv:read', 'msg:read'])]
    private string $email;

    #[ORM\Column(type: 'string', length: 20, unique: true, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $phone = null;

    #[ORM\Column(type: 'string')]
    private string $passwordHash;

    #[ORM\Column(type: 'string', length: 20, options: ['default' => 'client'])]
    #[Groups(['user:read'])]
    private string $role = 'client';

    #[ORM\Column(type: 'string', length: 100)]
    #[Groups(['user:read', 'conv:read', 'msg:read', 'provider:read'])]
    private string $firstName;

    #[ORM\Column(type: 'string', length: 100)]
    #[Groups(['user:read', 'conv:read', 'msg:read', 'provider:read'])]
    private string $lastName;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private ?string $avatarUrl = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $latitude = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $longitude = null;

    #[ORM\Column(type: 'string', length: 150, nullable: true)]
    private ?string $city = null;

    #[ORM\Column(type: 'string', length: 100, options: ['default' => 'BJ'])]
    #[Groups(['user:read', 'provider:read'])]
    private string $country = 'BJ';

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(type: 'string', length: 500, nullable: true)]
    private ?string $fcmToken = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private bool $isOnline = false;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['user:read', 'conv:read', 'provider:read'])]
    private ?\DateTimeImmutable $lastSeenAt = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $resetTokenExpiresAt = null;

    #[ORM\OneToOne(targetEntity: ProviderProfile::class, mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?ProviderProfile $providerProfile = null;

    #[ORM\OneToMany(targetEntity: Conversation::class, mappedBy: 'client')]
    private Collection $conversationsAsClient;

    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'sender')]
    private Collection $messages;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'client')]
    private Collection $reviewsAsClient;

    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user')]
    private Collection $notifications;

    public function __construct()
    {
        $this->id = Uuid::v6();
        $this->conversationsAsClient = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->reviewsAsClient = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): Uuid
    {
        return $this->id;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): self
    {
        $this->phone = $phone;
        return $this;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function setPasswordHash(string $passwordHash): self
    {
        $this->passwordHash = $passwordHash;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->passwordHash;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): self
    {
        $this->role = $role;
        return $this;
    }

    public function getRoles(): array
    {
        return ['ROLE_' . strtoupper($this->role)];
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): self
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): self
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function setAvatarUrl(?string $avatarUrl): self
    {
        $this->avatarUrl = $avatarUrl;
        return $this;
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function setLatitude(?float $latitude): self
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function setLongitude(?float $longitude): self
    {
        $this->longitude = $longitude;
        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(?string $city): self
    {
        $this->city = $city;
        return $this;
    }

    public function getCountry(): string
    {
        return $this->country;
    }

    public function setCountry(string $country): self
    {
        $this->country = $country;
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

    public function getFcmToken(): ?string
    {
        return $this->fcmToken;
    }

    public function setFcmToken(?string $fcmToken): self
    {
        $this->fcmToken = $fcmToken;
        return $this;
    }

    public function isOnline(): bool
    {
        return $this->isOnline;
    }

    public function setIsOnline(bool $isOnline): self
    {
        $this->isOnline = $isOnline;
        return $this;
    }

    public function getLastSeenAt(): ?\DateTimeImmutable
    {
        return $this->lastSeenAt;
    }

    public function setLastSeenAt(?\DateTimeImmutable $lastSeenAt): self
    {
        $this->lastSeenAt = $lastSeenAt;
        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self
    {
        $this->resetToken = $resetToken;
        return $this;
    }

    public function getResetTokenExpiresAt(): ?\DateTimeInterface
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?\DateTimeInterface $resetTokenExpiresAt): self
    {
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;
        return $this;
    }

    public function getProviderProfile(): ?ProviderProfile
    {
        return $this->providerProfile;
    }

    public function setProviderProfile(?ProviderProfile $providerProfile): self
    {
        if ($providerProfile === null && $this->providerProfile !== null) {
            $this->providerProfile->setUser(null);
        }

        if ($providerProfile !== null && $providerProfile->getUser() !== $this) {
            $providerProfile->setUser($this);
        }

        $this->providerProfile = $providerProfile;
        return $this;
    }

    /**
     * @return Collection<int, Conversation>
     */
    public function getConversationsAsClient(): Collection
    {
        return $this->conversationsAsClient;
    }

    public function addConversationAsClient(Conversation $conversation): self
    {
        if (!$this->conversationsAsClient->contains($conversation)) {
            $this->conversationsAsClient->add($conversation);
            $conversation->setClient($this);
        }
        return $this;
    }

    public function removeConversationAsClient(Conversation $conversation): self
    {
        if ($this->conversationsAsClient->removeElement($conversation)) {
            if ($conversation->getClient() === $this) {
                $conversation->setClient(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): self
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setSender($this);
        }
        return $this;
    }

    public function removeMessage(Message $message): self
    {
        if ($this->messages->removeElement($message)) {
            if ($message->getSender() === $this) {
                $message->setSender(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviewsAsClient(): Collection
    {
        return $this->reviewsAsClient;
    }

    public function addReviewAsClient(Review $review): self
    {
        if (!$this->reviewsAsClient->contains($review)) {
            $this->reviewsAsClient->add($review);
            $review->setClient($this);
        }
        return $this;
    }

    public function removeReviewAsClient(Review $review): self
    {
        if ($this->reviewsAsClient->removeElement($review)) {
            if ($review->getClient() === $this) {
                $review->setClient(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): self
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setUser($this);
        }
        return $this;
    }

    public function removeNotification(Notification $notification): self
    {
        if ($this->notifications->removeElement($notification)) {
            if ($notification->getUser() === $this) {
                $notification->setUser(null);
            }
        }
        return $this;
    }

    public function eraseCredentials(): void
    {
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }
}
