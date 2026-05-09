<?php

namespace App\Doctrine;

use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

class SoftDeleteFilter extends SQLFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        // Les entités qui utilisent le trait SoftDeletableTrait
        $softDeletableClasses = [
            'App\Entity\User',
            'App\Entity\ProviderProfile',
            'App\Entity\ProviderService',
            'App\Entity\Portfolio',
            'App\Entity\Conversation',
            'App\Entity\Message',
            'App\Entity\Review',
            'App\Entity\Notification',
        ];

        if (!in_array($targetEntity->getName(), $softDeletableClasses)) {
            return '';
        }

        return $targetTableAlias . '.deleted_at IS NULL';
    }
}
