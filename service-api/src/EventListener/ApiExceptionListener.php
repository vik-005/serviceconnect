<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Validator\Exception\ValidationFailedException;
use Symfony\Component\Serializer\Exception\ExceptionSerializer;
use Throwable;

class ApiExceptionListener
{
    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        $request = $event->getRequest();

        // Only for API requests
        if (str_starts_with($request->getPathInfo(), '/api/') === false) {
            return;
        }

        $statusCode = 500;
        $message = 'Erreur interne du serveur';
        $errors = [];

        if ($exception instanceof ValidationFailedException) {
            $statusCode = 422;
            $message = 'Données invalides';
            $errors = array_map(fn($v) => $v->getMessage(), iterator_to_array($exception->getViolations()));
        } elseif ($exception instanceof AccessDeniedHttpException) {
            $statusCode = 403;
            $message = $exception->getMessage() ?: 'Accès refusé';
        } elseif ($exception instanceof NotFoundHttpException) {
            $statusCode = 404;
            $message = $exception->getMessage() ?: 'Ressource non trouvée';
        } elseif ($exception->getMessage()) {
            $message = $exception->getMessage();
        }

        $response = new JsonResponse([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);

        $event->setResponse($response);
    }
}
?>

