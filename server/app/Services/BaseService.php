<?php

declare(strict_types=1);

namespace App\Services;
use App\Repositories\BaseRepository;
use App\Traits\Bases\HasBaseService;

class BaseService {

    use HasBaseService;

    public function __construct ( protected BaseRepository $repository ) {

    }

}
