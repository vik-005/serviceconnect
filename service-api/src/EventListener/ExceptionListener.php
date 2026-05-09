<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

#[AsEventListener(event: KernelEvents::EXCEPTION, method: 'onKernelException')]
class ExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $response = [
            'success' => false,
            'data' => null,
            'message' => $exception->getMessage(),
            'errors' => []
        ];

        $statusCode = JsonResponse::HTTP_INTERNAL_SERVER_ERROR;

        if ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
        }

        // Handle validation errors specifically if needed
        if ($exception->getPrevious() instanceof ValidationFailedException) {
            $statusCode = 422;
            $response['message'] = 'Validation failed';
            foreach ($exception->getPrevious()->getViolations() as $violation) {
                $response['errors'][] = [
                    'property' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage()
                ];
            }
        }

        $event->setResponse(new JsonResponse($response, $statusCode));
    }
}
