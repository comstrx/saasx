<?php

namespace App\Services;
use App\Repositories\GatewayRepository;

class GatewayService extends BaseService {
   
    public function __construct(
        protected GatewayRepository $gatewayRepository,
        protected PaymentService $paymentService
    ) { parent::__construct($gatewayRepository); }

    public function deposit ( int $id, array $scopes = [], array $data = [] ) {

        return $this->paymentService->deposit([...$data, 'gateway' => $this->find($id, $scopes)->name]);

    }

}
