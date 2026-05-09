<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;

#[AsEventListener(event: KernelEvents::VIEW, method: 'onKernelView')]
class ApiResponseListener
{
    public function __construct(
        private SerializerInterface $serializer
    ) {}

    public function onKernelView(ViewEvent $event): void
    {
        $result = $event->getControllerResult();

        if ($result instanceof \Symfony\Component\HttpFoundation\Response) {
            return;
        }

        $request = $event->getRequest();
        $groups = $request->attributes->get('_groups', ['default']);

        $responseData = [
            'success' => true,
            'data' => $result,
            'message' => 'Success',
            'errors' => []
        ];

        // Serialize data using groups to avoid circular references and over-fetching
        $json = $this->serializer->serialize($responseData, 'json', [
            'groups' => $groups,
            'json_encode_options' => JSON_UNESCAPED_UNICODE
        ]);

        $event->setResponse(new JsonResponse($json, 200, [], true));
    }
}
