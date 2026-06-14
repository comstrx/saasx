<?php

namespace App\Services;
use App\Traits\Bases\HasBaseService;
use App\Repositories\BaseRepository;

class BaseService {

    use HasBaseService;

    public function __construct ( protected BaseRepository $baseRepository ) { $this->initialize(); }

}
