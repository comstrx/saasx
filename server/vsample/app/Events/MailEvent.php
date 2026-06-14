<?php

namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MailEvent implements ShouldBroadcast {

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user_id;
    public $mail;

    public function __construct ( $user_id, $mail ) {

        $this->user_id = $user_id;
        $this->mail = $mail;

    }
    public function broadcastOn () {

        return new PrivateChannel("mail.{$this->user_id}");

    }
    public function broadcastWith () {

        return ['mail' => $this->mail];

    }
    public function broadcastAs () {

        return 'mail.event';

    }
    public function broadcastWhen () {

        return true;

    }
    
}
