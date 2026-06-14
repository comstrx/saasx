<?php

namespace App\Events;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use App\Models\User;

class NotificationEvent implements ShouldBroadcastNow {

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct ( protected Notification $notification, protected User $user ) {}

    public function broadcastOn () {

        return new PrivateChannel("notification.{$this->user->id}");

    }
    public function broadcastWith () {

        return ['notification' => $this->notification->toResource()];

    }
    public function broadcastAs () {

        return 'notification.event';

    }
    public function broadcastWhen () {

        return true;

    }
    
}
