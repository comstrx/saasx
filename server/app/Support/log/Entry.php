<?php

declare(strict_types=1);

namespace App\Support\Log;

class Entry {

    public static function write ( string $level, string $message, array $context = [], ?string $channel = null ): void {

        Channel::to($channel)->log($level, $message, Redact::apply($context));

    }

}
