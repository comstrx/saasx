<?php

declare(strict_types=1);

namespace App\Support\Cache;

interface Driver {

    public function get ( string $key ): mixed;
    public function has ( string $key ): bool;
    public function put ( string $key, mixed $value, ?int $ttl = null ): bool;
    public function forget ( string $key ): bool;
    public function flush (): bool;
    /** @param list<string> $members */
    public function addMembers ( string $key, array $members ): void;
    /** @return list<string> */
    public function members ( string $key ): array;
    public function forgetMembers ( string $key ): void;

}
