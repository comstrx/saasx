<?php

declare(strict_types=1);

namespace App\Models;
use App\Traits\Dna\HasRelations;
use App\Traits\Dna\HasTenant;

abstract class TenantModel extends BaseModel {

    use HasTenant, HasRelations;

}
