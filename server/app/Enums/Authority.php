<?php

declare(strict_types=1);

namespace App\Enums;

enum Authority: string {

    case Super = 'super';
    case Tenant = 'tenant';

}
