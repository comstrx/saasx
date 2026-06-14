<?php

namespace App\Services;
use App\Repositories\TransactionRepository;
use App\Repositories\WalletRepository;
use App\Models\Transaction;

class TransactionService extends BaseService {
   
    public function __construct(
        protected TransactionRepository $transactionRepository,
        protected WalletRepository $walletRepository,
        protected PaymentService $paymentService,
    ) { parent::__construct($transactionRepository); }
    
    public function refund ( int|Transaction $transaction, array $data = [], array $scopes = [] ) {

        $tran = is_int($transaction) ? $this->find($transaction, $scopes) : $transaction;
        return $this->paymentService->refund($tran, $data);

    }
    public function withdraw ( int|Transaction $transaction, array $data = [], array $scopes = [] ) {

        $tran   = is_int($transaction) ? $this->find($transaction, $scopes) : $transaction;
        $wallet = $tran->wallet;
       
        $status = string(data_get($data, 'status'));
        if ( !$status || !$wallet ) return;

        if ( $status === 'successful' ) {

            $amount = positive($tran->amount - $tran->paid_amount - $tran->released_amount);
            if ( !$amount ) return;

            $this->walletRepository->withdraw($wallet, $amount + $tran->tax_amount);
            parent::update($tran->id, ['paid_amount' => $tran->paid_amount + $amount, 'status' => $status], $scopes);

        }
        elseif ( in_array($status, ['cancelled', 'refunded', 'failed']) ) {

            $amount = positive($tran->amount - $tran->paid_amount - $tran->released_amount);
            if ( !$amount ) return;

            $this->walletRepository->release($wallet, $amount + $tran->tax_amount, 'withdraw');
            parent::update($tran->id, ['released_amount' => $tran->released_amount + $amount, 'status' => $status], $scopes);

        }

    }
    public function update ( int $id, array $data = [], array $scopes = [] ) {
        
        $tran = $this->find($id, $scopes);

        return $this->transactionRepository->dbTransaction(function () use ( $tran, $data, $scopes ) {

            $status = string(data_get($data, 'status'));

            if ( $status === 'refunded' && $tran->type === 'deposit' ) $this->refund($tran, $data);
            elseif ( $status !== 'pending' && $tran->type === 'withdraw' ) $this->withdraw($tran, $data);
           
            return parent::update($tran->id, $data);

        });

    }

}
