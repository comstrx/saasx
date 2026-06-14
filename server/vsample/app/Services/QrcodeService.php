<?php

namespace App\Services;
use App\Repositories\QrcodeRepository;

class QrcodeService extends BaseService {
   
    public function __construct(
        protected QrcodeRepository $qrcodeRepository
    ) { parent::__construct($qrcodeRepository); }

}
