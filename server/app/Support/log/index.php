<?php

declare(strict_types=1);

namespace App\Support;
use App\Support\Log\Entry;
use App\Support\Log\Context;
use App\Support\Log\Channel;

class Log {

    public static function debug ( string $message, array $context = [] ): void {

        Entry::write('debug', $message, $context);

    }
    public static function info ( string $message, array $context = [] ): void {

        Entry::write('info', $message, $context);

    }
    public static function warning ( string $message, array $context = [] ): void {

        Entry::write('warning', $message, $context);

    }
    public static function error ( string $message, array $context = [] ): void {

        Entry::write('error', $message, $context);

    }
    public static function critical ( string $message, array $context = [] ): void {

        Entry::write('critical', $message, $context);

    }
    public static function log ( string $level, string $message, array $context = [], ?string $channel = null ): void {

        Entry::write($level, $message, $context, $channel);

    }
    /** @return array<string, mixed> */
    public static function context ( array ...$contexts ): array {

        return Context::merge(...$contexts);

    }
    public static function channel ( ?string $channel = null ): \Psr\Log\LoggerInterface {

        return Channel::to($channel);

    }

}
