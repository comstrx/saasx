<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionScope: string {

    case Global = 'global';
    case Tenant = 'tenant';
    case Entity = 'entity';
    case Item = 'item';

}
