<?php

declare(strict_types=1);

namespace App\Support\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Container\Container;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class Payload implements ShouldQueue {

    use Queueable, InteractsWithQueue, SerializesModels;

    /** @param array{panel: string, role: string, tenant_id: string|null, user_id: string|null} $context */
    public function __construct ( public object $inner, public array $context ) {

    }
    public function handle (): void {

        $handler = [$this->inner, 'handle'];

        if ( ! is_callable($handler) ) throw new \RuntimeException('Queued job is not handleable: ' . $this->inner::class);

        Tenant::restore($this->context);

        try {

            Container::getInstance()->call($handler);

        } finally {

            Tenant::reset();

        }

    }
    public function backoff (): int {

        return Retry::backoff($this->attempts());

    }

}
