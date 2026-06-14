<?php

namespace App\Services;
use App\Repositories\WithdrawMethodRepository;
use App\Repositories\WalletRepository;
use App\Models\WithdrawMethod;
use App\Models\Wallet;

class WithdrawMethodService extends BaseService {

    public function __construct (
        protected WithdrawMethodRepository $withdrawMethodRepository,
        protected WalletRepository $walletRepository,
        protected TransactionService $transactionService
    ) { parent::__construct($withdrawMethodRepository); }

    public function validate ( WithdrawMethod $method, Wallet $wallet, float $amount, array $recipient = [] ) {

        $missing = collect((array) $method->fields)
            ->where('required', true)
            ->pluck('name')
            ->first(fn($name) => !array_key_exists($name, $recipient) || blank(string($recipient[$name])));

        if ( $missing ) throwError('recipient', "Missing required field: {$missing}");
        if ( $amount < $method->min_amount ) throwError('amount', "The minimum amount is : {$method->min_amount}");
        if ( $amount > $method->max_amount ) throwError('amount', "The maximum amount is : {$method->max_amount}");
        if ( !$this->walletRepository->suspend($wallet, $amount, 'withdraw') ) throwError('balance', 'not enouph balance');

    }
    public function withdraw ( int $id, array $scopes = [], array $data = [] ) {
        
        $method = $this->find($id, $scopes);
        $wallet = client()?->wallet ?? $this->failNow('wallet');

        return $this->withdrawMethodRepository->dbTransaction(function () use ( $method, $wallet, $data ) {

            $recipient = parse(data_get($data, 'recipient'));
            $amount    = positive(data_get($data, 'amount'));
            $taxAmount = positive($method->tax_value + ($amount * $method->tax_rate / 100));
            $netAmount = positive($amount - $taxAmount);

            $this->validate($method, $wallet, $amount, $recipient);

            return $this->transactionService->store([
                ...$data,
                'type'               => 'withdraw',
                'wallet_id'          => $wallet->id,
                'withdraw_method_id' => $method->id,
                'payment'            => $method->code,
                'currency'           => $method->currency,
                'paid_currency'      => $method->currency,
                'amount'             => $netAmount,
                'tax_amount'         => $taxAmount,
                'recipient'          => $recipient,
            ]);

        });

    }

}
