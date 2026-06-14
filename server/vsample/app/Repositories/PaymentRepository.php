<?php

namespace App\Repositories;
use App\Models\Gateway;

class PaymentRepository {

    public function __construct(
        protected TransactionRepository $transactionRepository,
        protected GatewayRepository $gatewayRepository,
        protected WalletRepository $walletRepository,
        protected OrderRepository $orderRepository,
    ) {}
    
    public function findTransaction ( string $reference ) {

        $transaction = $this->transactionRepository->findByReference($reference);
        if ( !$transaction ) throwError('transaction', 'transaction not found');
        return $transaction;

    }
    public function startTransaction ( array $params ) {

        if ( !data_get($params, 'reference') ) throwError('refused', 'gateway refused transaction');
        if ( !$this->transactionRepository->create($params) ) throwError('transaction', 'cannot start transaction');

        $this->transactionRepository->getModel()->deleteCacheTag();
        return ['reference' => data_get($params, 'reference'), 'pay_data' => data_get($params, 'pay_data')];

    }

    public function initialize ( Gateway $gateway, string $process, float $amount, array $params = [] ) {

        [$exchange_amount, $exchange_rate] = $this->gatewayRepository->exchange($gateway, $amount);

        $currency    = $this->gatewayRepository->baseCurrency();
        $tax_amount  = $this->gatewayRepository->calculateTax($gateway, $exchange_amount, $process);
        $paid_amount = $this->gatewayRepository->withTax($gateway, $exchange_amount, $process);

        if ( !$this->gatewayRepository->validateProcess($gateway, $process) ) throwError('process', 'invalid process');
        if ( !$this->gatewayRepository->validateAmount($gateway, $exchange_amount, $process) ) throwError('amount', 'invalid amount');

        return [
            'unique_id'       => uniqid(),
            'payment'         => $gateway->name,
            'type'            => $process,
            'amount'          => $amount,
            'currency'        => $currency,
            'tax_amount'      => $tax_amount,
            'paid_amount'     => $paid_amount,
            'exchange_amount' => $exchange_amount,
            'exchange_rate'   => $exchange_rate,
            'paid_currency'   => $gateway->currency,
            'allow_refund'    => $gateway->allow_refund,
            'refund_days'     => $gateway->refund_days,
            'redirect_url'    => string($params['redirect_url'] ?? null),
            'failed_url'      => string($params['failed_url'] ?? null),
            'description'     => string($params['description'] ?? null),
            'wallet_id'       => integer($params['wallet_id'] ?? 0),
            'order_id'        => integer($params['order_id'] ?? 0),
            'recipient'       => $params['recipient'] ?? [],
            'webhook_url'     => rtrim(env('APP_URL'), '/') . "/v1/webhook/payment/$gateway->name/$process",
        ];

    }
    public function initializeDeposit ( Gateway $gateway, array $params = [] ) {

        $amount = positive($params['amount'] ?? 0);
        if ( !$amount ) throwError('amount', 'invalid amount');

        $wallet = $this->walletRepository->query()->find($params['wallet_id'] ?? 0);
        if ( !$wallet?->active ) throwError('wallet', 'invalid wallet');

        return $this->initialize( $gateway, 'deposit', $amount, $params );

    }
    public function initializeWithdraw ( Gateway $gateway, array $params = [] ) {

        $amount = positive($params['amount'] ?? 0);
        if ( !$amount ) throwError('amount', 'invalid amount');

        $wallet = $this->walletRepository->query()->find($params['wallet_id'] ?? 0);
        if ( !$wallet?->active ) throwError('wallet', 'invalid wallet');

        $suspended = $this->walletRepository->suspend($wallet, $amount, 'withdraw');
        if ( !$suspended ) throwError('balance', 'not enough balance');

        return $this->initialize( $gateway, 'withdraw', $amount, $params );

    }
    public function initializePayOrder ( Gateway $gateway, array $params = [] ) {

        $order = $this->orderRepository->find($params['order_id'] ?? 0);
        if ( !$order ) return throwError('order', 'invalid order');

        $amount = $order->payAmount($params['amount'] ?? 0);
        if ( !$amount || !$order->canPay() ) throwError('pay', 'cannot pay order');

        return $this->initialize( $gateway, 'pay', $amount, $params );

    }
    public function initializeRefund ( Gateway $gateway, array $params = [] ) {
       
        $transaction = $this->transactionRepository->find($params['transaction_id'] ?? 0);
        if ( !$transaction ) throwError('transaction', 'invalid transaction');

        $amount      = $transaction->refundAmount($params['amount'] ?? 0);
        $paid_amount = $transaction->refundPaidAmount($amount);

        if ( !$amount || !$transaction->canRefund() ) throwError('refund', 'refund not allowed');
        if ( !$transaction->wallet?->active ) throwError('wallet', 'invalid wallet');

        $suspended = $this->walletRepository->suspend($transaction->wallet, $amount, 'available');
        if ( !$suspended ) throwError('balance', 'not enough balance');

        return [
            'type'           => 'refund',
            'transaction_id' => $transaction->id,
            'reference'      => $transaction->reference,
            'payment'        => $transaction->payment,
            'wallet_id'      => $transaction->wallet->id,
            'currency'       => $transaction->currency,
            'paid_currency'  => $transaction->paid_currency,
            'exchange_rate'  => $transaction->exchange_rate,
            'amount'         => $amount,
            'paid_amount'    => $paid_amount,
            'description'    => string($params['reason'] ?? $params['description'] ?? null),
            'webhook_url'    => rtrim(env('APP_URL'), '/') . "/v1/webhook/payment/$transaction->payment/refund",
        ];

    }

    public function webhook ( array $params = [], $type = null ) {

        $transaction = $this->findTransaction($params['reference'] ?? '');

        $checkType = is_array($type) ? in_array($transaction->type, $type) : $transaction->type === $type;
        if ( $transaction->status !== 'pending' || !$checkType ) return;
        
        $this->transactionRepository->getModel()->deleteCacheTag();

        return $this->transactionRepository->update($transaction->id, [
            'reference' => $params['new_reference'] ?? $transaction->reference,
            'recipient' => $params['recipient'] ?? $transaction->recipient,
            'status'    => ($params['status'] ?? null) ? 'successful' : 'failed',
        ]);

    }
    public function depositWebhook ( array $params = [] ) {

        $transaction = $this->webhook($params, ['deposit', 'pay']);
        if ( !$transaction?->amount || $transaction->status !== 'successful' ) return;
        
        if ( $transaction->type === 'deposit' && $transaction->wallet ) $this->walletRepository->deposit($transaction->wallet, $transaction->amount);
        elseif ( $transaction->type === 'pay' && $transaction->order ) $this->orderRepository->setPaid($transaction->order, $transaction->amount);

    }
    public function withdrawWebhook ( array $params = [] ) {

        $transaction = $this->webhook($params, 'withdraw');
        if ( !$transaction?->wallet ) return;

        if ( $transaction->status === 'successful' ) $this->walletRepository->withdraw($transaction->wallet, $transaction->amount);
        else $this->walletRepository->release($transaction->wallet, $transaction->amount, 'withdraw');

    }
    public function refundWebhook ( array $params = [] ) {

        $transaction = $this->webhook($params, 'refund');
        if ( !$transaction?->wallet ) return;
        $transaction->transaction?->update(['status' => 'refunded']);

        if ( $transaction->status === 'successful' ) $this->walletRepository->refund($transaction->wallet, $transaction->amount);
        else $this->walletRepository->release($transaction->wallet, $transaction->amount, 'buy');

    }

}
