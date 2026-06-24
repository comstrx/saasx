<?php

declare(strict_types=1);

namespace App\Support\Event;

class RedisDriver implements Driver {

    public function publish ( Payload $payload ): void {

        \Illuminate\Support\Facades\Redis::connection()->xadd($payload->stream(), '*', $payload->fields(), 10000, true);

    }

}
