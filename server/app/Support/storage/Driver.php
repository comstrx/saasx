<?php

declare(strict_types=1);

namespace App\Support\Storage;

interface Driver {

    /** @param array<string, mixed> $options */
    public function put ( string $key, mixed $contents, array $options = [] ): bool;
    public function get ( string $key ): ?string;
    public function exists ( string $key ): bool;
    public function delete ( string $key ): bool;
    public function temporaryUrl ( string $key, \DateTimeInterface $expiresAt ): string;

}
