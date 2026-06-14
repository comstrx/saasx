<?php

namespace App\Services;
use Illuminate\Support\Facades\DB;
use App\Repositories\GatewayRepository;
use App\Repositories\TransactionRepository;
use App\Models\Transaction;
use App\Models\Order;

class PaymentService {

    public function __construct (
        protected GatewayRepository $gatewayRepository,
        protected TransactionRepository $transactionRepository,
    ) {}

    public function getGateways () {

        return [
            'paypal' => \App\Payments\PaypalPayment::class,
            'stripe' => \App\Payments\StripePayment::class,
        ];

    }
    public function setPayment ( string $method = null ) {
        
        $payments = $this->getGateways();

        if ( !isset($payments[$method]) ) throwError('gateway', 'gateway not supported');
        if ( !$this->gatewayRepository->findByName($method) ) throwError('gateway', 'gateway not allowed');

        return app()->make($payments[$method]);
        
    }
    public function deposit ( array $params = [] ) {

        $params = array_merge($params, ['wallet_id' => client()?->wallet?->id]);

        try { return success( DB::transaction(fn() => $this->setPayment($params['gateway'] ?? null)->deposit($params)) ); }
        catch ( \Exception $e ) { return throwErrorFailed($e->getMessage()); }

    }
    public function withdraw ( array $params = [] ) {

        $params = array_merge($params, ['wallet_id' => client()?->wallet?->id]);

        try { return success( DB::transaction(fn() => $this->setPayment($params['gateway'] ?? null)->withdraw($params)) ); }
        catch ( \Exception $e ) { return throwErrorFailed($e->getMessage()); }

    }
    public function refund ( Transaction $transaction, array $params = [] ) {

        $params = array_merge($params, [
            'wallet_id' => $transaction->wallet_id,
            'gateway' => $transaction->payment,
            'transaction_id' => $transaction->id
        ]);

        try { return success( DB::transaction(fn() => $this->setPayment($params['gateway'] ?? null)->refund($params)) ); }
        catch ( \Exception $e ) { return throwErrorFailed($e->getMessage()); }

    }
    public function payOrder ( Order $order, array $params = [] ) {

        $params = array_merge($params, ['order_id' => $order->id]);

        try { return success( DB::transaction(fn() => $this->setPayment($params['gateway'] ?? null)->payOrder($params)) ); }
        catch ( \Exception $e ) { return throwErrorFailed($e->getMessage()); }

    }

}
