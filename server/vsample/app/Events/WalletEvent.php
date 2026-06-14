<?php

namespace App\Events;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Wallet;

class WalletEvent implements ShouldBroadcastNow {

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct ( protected Wallet $wallet ) {}

    public function broadcastOn () {

        return [
            new PrivateChannel("wallet.{$this->wallet->user_id}"),
            new PrivateChannel("wallet.admin")
        ];

    }
    public function broadcastWith () {

        return ['wallet' => $this->wallet->toResource()];

    }
    public function broadcastAs () {

        return 'wallet.event';

    }
    public function broadcastWhen () {

        return true;

    }
    
}
