<?php

namespace App\Events;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Transaction;

class TransactionEvent implements ShouldBroadcastNow {

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct ( protected Transaction $transaction ) {}

    public function broadcastOn () {

        return [
            new PrivateChannel("transaction.{$this->transaction->wallet?->user_id}"),
            new PrivateChannel("transaction.admin")
        ];

    }
    public function broadcastWith () {

        return ['transaction' => $this->transaction->toResource()];

    }
    public function broadcastAs () {

        return 'transaction.event';

    }
    public function broadcastWhen () {

        return true;

    }
    
}
