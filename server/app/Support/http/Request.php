<?php

declare(strict_types=1);

namespace App\Support\Http;

class Request {

    /** @param array<string, mixed> $options */
    public function __construct ( public readonly string $method, public readonly string $url, public readonly array $options = [] ) {

    }
    /** @param array<string, mixed> $options */
    public static function make ( string $method, string $url, array $options = [] ): self {

        if ( isset($options['headers']) && is_array($options['headers']) ) {

            $options['headers'] = Header::flatten($options['headers']);

        }

        return new self(strtoupper(trim($method)), trim($url), $options);

    }

}
