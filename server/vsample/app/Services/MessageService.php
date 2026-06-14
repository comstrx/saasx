<?php

namespace App\Services;
use App\Repositories\MessageRepository;
use App\Events\ChatEvent;
use App\Enums\ChatEventType;
use App\Jobs\ExecuteJob;
use App\Models\Message;
use App\Models\Room;

class MessageService extends BaseService {

    protected ?Room $room = null;

    public function __construct ( protected MessageRepository $messageRepository, protected RoomService $roomService ) {
        
        parent::__construct($messageRepository);
    
    }
    public function setRoom ( int $roomId ) {

        $this->room = $this->roomService->authorize($roomId);
        $this->setCacheTag("message_room_{$roomId}");
        return $this;
        
    }
    public function sent ( int $roomId, Message $message ) {

        $this->roomService->refresh($roomId);
        event(new ChatEvent(ChatEventType::MESSAGE_CREATED->value, message: $message));
        return success();

    }
    public function send ( array $data = [], int $messageId = null ) {

        $message = $this->messageRepository->sendMessage($this->room, user(), $data, $messageId);
        $this->runJob([static::class, 'sent'], [$this->room->id, $message]);

        $this->deleteCache();
        return success(['item' => $message->toResource()]);
        
    }
    public function read () {

        if ( !$this->room->unreadMessages(user_id())->count() ) return success();

        $this->runJob([$this->messageRepository, 'markMessages'], [$this->room, user_id(), 'read']);
        event(new ChatEvent(ChatEventType::MESSAGE_READ->value, roomId: $this->room->id));

        $this->deleteCache();
        return success();

    }
    public function delivered () {

        if ( !$this->room->undeliveredMessages(user_id())->count() ) return success();

        $this->runJob([$this->messageRepository, 'markMessages'], [$this->room, user_id(), 'delivered']);
        event(new ChatEvent(ChatEventType::MESSAGE_DELIVERED->value, roomId: $this->room->id));
        
        $this->deleteCache();
        return success();
        
    }
    public function setConfig ( int $id, int $userId = null, int $exceptId = null, array $data = [] ) {

        $message = $this->messageRepository->findMessage($this->room, $id);
        $this->messageRepository->setAction($message, $userId, $exceptId, $data);

        $this->deleteCache();
        return success();

    }
    public function reaction ( int $id, string $reaction = null ) {

        $this->setConfig($id, user_id(), data: ['reaction' => string($reaction)]);
       
        $message = $this->messageRepository->findMessage($this->room, $id);
        event(new ChatEvent(ChatEventType::MESSAGE_REACTION->value, message: $message));

        return success();

    }
    public function unreaction ( int $id ) {

        $this->setConfig($id, user_id(), data: ['reaction' => null]);
       
        $message = $this->messageRepository->findMessage($this->room, $id);
        event(new ChatEvent(ChatEventType::MESSAGE_REACTION_DELETED->value, message: $message));

        return success();

    }
    public function star ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['starred' => true]);

    }
    public function unstar ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['starred' => false]);

    }
    public function pin ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['pinned' => true]);

    }
    public function unpin ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['pinned' => false]);

    }
    public function remove ( int $id, string $type = null ) {

        match ( $type ) {
            'all' && is_admin() => $this->setConfig($id, data: ['deleted' => true]),
            'others' && is_admin() => $this->setConfig($id, exceptId: user_id(), data: ['deleted' => true]),
            default => $this->setConfig($id, user_id(), data: ['deleted' => true]),
        };

        $hasEvent = in_array($type, ['all', 'others']);
        if ( $hasEvent ) event(new ChatEvent(ChatEventType::MESSAGE_DELETED->value, roomId: $this->room->id, messageId: $id));
        
        return success();

    }
    public function destroy ( int $id  ) {

        if ( !is_admin() ) return notFoundFailed('room');
        $message = $this->messageRepository->findMessage($this->room, $id);

        $this->messageRepository->delete($id);
        event(new ChatEvent(ChatEventType::MESSAGE_DELETED->value, roomId: $this->room->id, messageId: $id));

        $this->deleteCache();
        return success();
        
    }

}
