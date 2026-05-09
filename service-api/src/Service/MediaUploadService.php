<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Uid\Uuid;

class MediaUploadService
{
    private string $uploadDir;

    public function __construct(ParameterBagInterface $params)
    {
        $this->uploadDir = $params->get('kernel.project_dir') . '/public/uploads';
    }

    public function upload(UploadedFile $file, string $context = 'general'): string
    {
        $fileName = Uuid::v4()->toString() . '.' . $file->guessExtension();
        $subDir = $context . '/' . date('Y/m');
        $fullPath = $this->uploadDir . '/' . $subDir;

        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0777, true);
        }

        $file->move($fullPath, $fileName);

        return '/uploads/' . $subDir . '/' . $fileName;
    }
}
