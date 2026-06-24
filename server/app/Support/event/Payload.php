<?php

declare(strict_types=1);

namespace App\Support\Event;
use App\Support\Context;
use App\Support\Date;
use App\Support\Json;

class Payload {

    /** @param array<string, mixed> $data */
    public function __construct ( public readonly string $event, public readonly array $data, public readonly ?string $key, public readonly ?string $tenantId, public readonly string $at ) {

    }
    /** @param array<string, mixed> $data */
    public static function make ( string $event, array $data, ?string $key ): self {

        return new self($event, $data, $key, Context::tenantId(), Date::iso(Date::now()));

    }
    public function stream (): string {

        return 't:' . ($this->tenantId ?? 'platform') . ':events';

    }
    public function scopedKey (): ?string {

        return $this->key === null ? null : 't:' . ($this->tenantId ?? 'platform') . ':' . $this->key;

    }
    /** @return array<string, string> */
    public function fields (): array {

        return [
            'event' => $this->event,
            'key'   => (string) $this->scopedKey(),
            'data'  => Json::encode($this->data),
            'at'    => $this->at,
        ];

    }

}
