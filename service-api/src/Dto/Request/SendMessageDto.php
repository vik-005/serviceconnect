<?php

namespace App\Dto\Request;

use Symfony\Component\Validator\Constraints as Assert;

class SendMessageDto
{
    #[Assert\NotBlank(message: "Le contenu est obligatoire pour un message texte")]
    public ?string $content = null;

    #[Assert\Choice(choices: ['text', 'image', 'video', 'audio', 'call_log'], message: "Type de message invalide")]
    public string $type = 'text';

    public ?string $mediaUrl = null;
}
