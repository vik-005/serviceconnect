<?php

namespace App\Service;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

class MercurePublisher
{
    public function __construct(
        private HubInterface $hub
    ) {}

    public function publish(string $topic, array $data): void
    {
        $update = new Update(
            $topic,
            json_encode($data)
        );

        try {
            $this->hub->publish($update);
        } catch (\Exception $e) {
            // Silently fail in test/dev if hub is not available
            // but we could log it
        }
    }
}
