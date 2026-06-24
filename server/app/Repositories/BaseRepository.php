<?php

declare(strict_types=1);

namespace App\Repositories;
use App\Models\BaseModel;
use App\Traits\Bases\HasBaseRepository;

class BaseRepository {

    use HasBaseRepository;

    public function __construct ( protected BaseModel $model ) {

    }

}
