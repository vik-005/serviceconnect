<?php

namespace App\Security\Voter;

use App\Entity\Message;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Bundle\SecurityBundle\Security;

class MessageVoter extends Voter
{
    public const DELETE = 'MESSAGE_DELETE';

    private Security $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    protected function supports(string $attribute, $subject): bool
    {
        return $attribute === self::DELETE && $subject instanceof Message;
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Message $message */
        $message = $subject;

        if ($this->security->isGranted('ROLE_ADMIN')) {
            return true;
        }

        // User must be sender and message < 5 min old
        $isSender = $user === $message->getSender();
        $isRecent = $message->getCreatedAt()->getTimestamp() > (time() - 300);

        return $isSender && $isRecent;
    }
}
