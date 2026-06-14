<?php

namespace App\Events;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Http\Resources\UserResource;
use App\Models\Message;
use App\Models\Room;
use App\Models\User;

class ChatEvent implements ShouldBroadcastNow {

    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        protected string $type,
        protected ?int $roomId = null,
        protected ?int $messageId = null,
        protected ?User $user = null,
        protected ?Room $room = null,
        protected ?Message $message = null,
    ) {}

    public function broadcastOn () {

        $room = $this->room ?? Room::findOrFail($this->roomId ?? $this->message?->room_id ?? 0);
        $userIds = remember('model:room', "event_{$room->id}", callback: fn() => $room->activeMembers()->pluck('user_id'));

        return collect($userIds)
            ->map(fn($id) => new PresenceChannel("chat.{$id}"))
            ->push(new PresenceChannel("chat.admin"))
            ->all();

    }
    public function broadcastWith () {

        return [
            'event' => $this->type,
            'room'  => $this->room?->toResource() ?? ['id' => $this->roomId ?? $this->message?->room_id],
            ...($this->user ? ['user' => UserResource::info($this->user)] : []),
            ...($this->message || $this->messageId ? ['message' => $this->message?->toResource() ?? ['id' => $this->messageId]] : []),
        ];

    }
    public function broadcastAs () {

        return 'chat.event';

    }
    public function broadcastWhen () {

        return true;

    }

}
