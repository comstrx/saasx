<?php

declare(strict_types=1);

namespace App\Support\Database;

class Uuid {

    public static function generate (): string {

        return (new \Symfony\Component\Uid\UuidV7())->toRfc4122();

    }
    public static function isValid ( string $uuid ): bool {

        return \Symfony\Component\Uid\Uuid::isValid($uuid)
            && \Symfony\Component\Uid\Uuid::fromString($uuid) instanceof \Symfony\Component\Uid\UuidV7;

    }

}
