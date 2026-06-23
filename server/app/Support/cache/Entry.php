<?php

declare(strict_types=1);

namespace App\Support\Cache;

class Entry {

    /** @param list<string> $tags */
    public function __construct ( public readonly mixed $value, public readonly ?int $ttl = null, public readonly array $tags = [] ) {

    }

}
