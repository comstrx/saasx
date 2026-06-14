<?php

namespace App\Services;
use App\Repositories\WithdrawTransactionRepository;
use App\Repositories\WithdrawMethodRepository;
use App\Repositories\WalletRepository;
use App\Models\WithdrawMethod;

class WithdrawTransactionService extends BaseService {

    public function __construct (
        protected WithdrawTransactionRepository $withdrawTransactionRepository,
        protected WithdrawMethodRepository $withdrawMethodRepository,
        protected WalletRepository $walletRepository
    ) { parent::__construct($withdrawTransactionRepository); }

    public function validate ( WithdrawMethod $method, float $amount, array $recipient = [] ) {

        $missing = collect((array) $method->fields)
            ->where('required', true)
            ->pluck('name')
            ->first(fn($name) => !array_key_exists($name, $recipient) || blank($recipient[$name]));

        return match ( true ) {
            $method->min_amount > $amount => throwError('amount', "The minimum amount is : {$method->min_amount}"),
            $method->max_amount < $amount => throwError('amount', "The maximum amount is : {$method->max_amount}"),
            $missing => throwError('recipient', "Missing required field: {$missing}"),
            default => null,
        };

    }
    public function store ( array $data = [], array $scopes = [] ) {
        
        return $this->withdrawTransactionRepository->dbTransaction(function () use ( $data, $scopes ) {

            $methodId  = integer(data_get($data, 'withdraw_method_id'));
            $recipient = parse(data_get($data, 'recipient'));
            $amount    = positive(data_get($data, 'amount'));

            $method = $this->withdrawMethodRepository->find($methodId) ?? throwError('method', 'not found method');
            $wallet = client()?->wallet ?? throwError('wallet', 'not found wallet');

            $taxAmount = positive($method->tax_value + ($amount * $method->tax_rate / 100));
            $netAmount = positive($amount - $taxAmount);

            $this->validate($method, $amount, $recipient);

            $suspended = $this->walletRepository->suspend($wallet, $amount, 'withdraw');
            if ( !$suspended ) throwError('balance', 'not enouph balance');
            
            return parent::store([
                ...$data,
                'withdraw_method_id' => $method->id,
                'user_id'    => $wallet->user_id,
                'currency'   => $method->currency,
                'tax_value'  => $method->tax_value,
                'tax_rate'   => $method->tax_rate,
                'tax_amount' => $taxAmount,
                'amount'     => $netAmount,
                'recipient'  => $recipient,
            ]);

        });

    }

}
