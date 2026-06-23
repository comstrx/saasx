<?php

declare(strict_types=1);

namespace App\Support\Log;

class Channel {

    public static function to ( ?string $channel = null ): \Psr\Log\LoggerInterface {

        return \Illuminate\Support\Facades\Log::channel($channel);

    }

}
