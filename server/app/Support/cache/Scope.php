<?php

declare(strict_types=1);

namespace App\Support\Cache;
use App\Support\Context;

class Scope {

    public static function prefix (): string {

        return 't:' . (Context::tenantId() ?? 'platform');

    }

}
