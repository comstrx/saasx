<?php

namespace App\Http\Controllers;
use App\Traits\Bases\HasBaseController;
use App\Http\Requests\BaseRequest;
use App\Services\BaseService;

class Controller {

    use HasBaseController;

    protected function requestForm () { return BaseRequest::class; }

    public function __construct ( protected BaseService $baseService ) { $this->initialize(); }

}
