<?php

namespace App\Services;
use App\Repositories\ReportRepository;

class ReportService extends BaseService {
   
    public function __construct(
        protected ReportRepository $reportRepository
    ) { parent::__construct($reportRepository); }

}
