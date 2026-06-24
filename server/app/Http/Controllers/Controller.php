<?php

declare(strict_types=1);

namespace App\Http\Controllers;
use App\Services\BaseService;
use App\Traits\Bases\HasBaseController;

abstract class Controller {

    use HasBaseController;

    public function __construct ( protected BaseService $service ) {

    }

}
