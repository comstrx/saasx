<?php

declare(strict_types=1);

namespace App\Support\Request;
use App\Support\Net;

class Tenant {

    public static function hint ( ?string $base = null ): ?string {

        return Net::subdomain(\Illuminate\Support\Facades\Request::getHost(), $base);

    }

}
