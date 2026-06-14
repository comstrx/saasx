<?php

namespace App\Repositories;
use App\Models\Transaction;
use Illuminate\Support\Str;

class TransactionRepository extends BaseRepository {

    public function __construct( Transaction $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'reference'          => string($data['reference']) ?: ('T' . now()->format('ymdHis') . strtoupper(Str::random(2))),
            'withdraw_method_id' => integer($data['withdraw_method_id']),
            'transaction_id'     => integer($data['transaction_id']),
            'wallet_id'          => integer($data['wallet_id']),
            'order_id'           => integer($data['order_id']),
            'type'               => string($data['type'] ?? 'deposit'),
            'status'             => string($data['status'] ?? 'pending'),
            'currency'           => string($data['currency'] ?? 'USD'),
            'paid_currency'      => string($data['paid_currency'] ?? 'USD'),
            'payment'            => string($data['payment']),
            'description'        => string($data['description']),
            'notes'              => string($data['notes']),
            'amount'             => float($data['amount'], 2),
            'tax_amount'         => float($data['tax_amount'], 2),
            'paid_amount'        => float($data['paid_amount'], 2),
            'released_amount'    => float($data['released_amount'], 2),
            'exchange_amount'    => float($data['exchange_amount'], 2),
            'exchange_rate'      => float($data['exchange_rate'], 2),
            'refund_days'        => float($data['refund_days']),
            'allow_refund'       => bool($data['allow_refund']),
            'recipient'          => $data['recipient'],
        ];

    }
    public function findByReference ( string $reference, string $type = null, string $status = null ) {

        return parent::query()
            ->where('reference', $reference)
            ->when(isset($type), fn($q) => $q->where('type', $type))
            ->when(isset($status), fn($q) => $q->where('status', $status))
            ->active()->first();

    }

}
