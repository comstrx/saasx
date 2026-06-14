<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\ReportService;

class ReportController extends Controller {

    public function __construct ( protected ReportService $reportService ) {
        
        parent::__construct($reportService);
        $this->applyScopes(strict: true);
    
    }

}
