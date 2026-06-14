<?php

namespace App\Repositories;
use App\Models\Message;
use App\Models\MessageAction;
use App\Models\Room;
use App\Models\User;

class MessageRepository extends BaseRepository {

    public function __construct( Message $model ) { parent::__construct($model); }

    public function sendMessage ( Room $room, User $sender, array $data = [], int $messageId = null ) {
        
        if ( $messageId ) {

            $message = parent::findOrFail($messageId);
            $oldVersion = [$message->formatDate('updated_at') => $message->only(['replied_id', 'type', 'content'])];

            $message->update([
                'edited'     => true,
                'edited_at'  => utc_date(),
                'history'    => array_merge($message->history ?? [], $oldVersion),
                'replied_id' => integer($data['replied_id'] ?? $message->replied_id),
                'product_id' => integer($data['product_id'] ?? $message->product_id),
                'type'       => string($data['type'] ?? $message->type),
                'content'    => string($data['content'] ?? $message->content),
            ]);

        }
        else {

            $message = parent::create([
                'room_id'    => $room->id,
                'sender_id'  => $sender->id,
                'replied_id' => integer($data['replied_id'] ?? 0),
                'product_id' => integer($data['product_id'] ?? 0),
                'type'       => string($data['type'] ?? 'text'),
                'content'    => string($data['content'] ?? null),
            ]);

        }

        $message->uploadFiles($data['files'] ?? $data['file'] ?? []);
        return $message;

    }
    public function findMessage ( Room $room, int $messageId ) {

        return $room->messages()->where('id', $messageId)->active()->firstOrFail();

    }
    public function setAction ( Message $message, int|array $userId = null, int|array $exceptId = null, array $data = [] ) {

        if ( is_int($userId) ) return messageAction::updateOrCreate(['message_id' => $message->id, 'user_id' => $userId], $data);

        return $message->room->roomMembers()
            ->when($userId, fn($q) => $q->whereIn('user_id', (array) $userId))
            ->when($exceptId, fn($q) => $q->whereNotIn('user_id', (array) $exceptId))
            ->cursor()
            ->each(fn($m) => messageAction::updateOrCreate(['message_id' => $message->id, 'user_id' => $m->user_id], $data));

    }
    public function markMessages ( Room $room, int $userId, string $action, bool $status = true ) {

        $data = match ( true ) {
            $action === 'read' && $status => ['delivered' => true, 'read' => true, 'read_at' => utc_date()],
            $action === 'delivered' && $status => ['delivered' => true, 'delivered_at' => utc_date()],
            default => [$action => $status],
        };
        
        $room->messages()
            ->where('sender_id', '!=', $userId)
            ->cursor()
            ->each(fn($message) => $this->setAction($message, $userId, data: $data));

    }

}
