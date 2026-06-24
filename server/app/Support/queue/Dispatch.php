<?php

declare(strict_types=1);

namespace App\Support\Queue;

class Dispatch implements Driver {

    public function push ( Payload $job, ?string $queue = null ): void {

        if ( $queue !== null ) $job->onQueue($queue);

        \Illuminate\Support\Facades\Bus::dispatch($job);

    }

}
