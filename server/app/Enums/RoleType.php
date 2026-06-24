<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleType: string {

    case Admin = 'admin';
    case Vendor = 'vendor';
    case Affiliate = 'affiliate';
    case Delivery = 'delivery';
    case Client = 'client';

}
