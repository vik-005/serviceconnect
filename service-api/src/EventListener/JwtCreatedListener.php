<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\HttpFoundation\RequestStack;

class JwtCreatedListener
{
    private RequestStack $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $request = $this->requestStack->getCurrentRequest();

        if ($request && $user = $request->attributes->get('user')) {
            $payload = $event->getPayload();

            $payload['id'] = $user->getId();
            $payload['email'] = $user->getEmail();
            $payload['role'] = $user->getRole();
            $payload['firstName'] = $user->getFirstName();
            $payload['lastName'] = $user->getLastName();

            $event->setData($payload);
        }
    }
}

