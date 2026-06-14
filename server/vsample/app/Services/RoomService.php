<?php

namespace App\Services;
use App\Repositories\RoomRepository;
use App\Repositories\UserRepository;
use App\Events\ChatEvent;
use App\Enums\ChatEventType;

class RoomService extends BaseService {

    public function __construct ( protected RoomRepository $roomRepository, protected UserRepository $userRepository ) {
        
        parent::__construct($roomRepository);
    
    }
    public function supportId () {

        return $this->remember(
            key: ['support_id' => user_id()],
            callback: fn() => $this->roomRepository->supportRoomId(user()),
        );

    }
    public function authorize ( int $id ) {

        return $this->remember(
            key: ['authorize_id' => $id],
            callback: fn() =>
                $this->roomRepository->validateMember($this->roomRepository->findOrFail($id), user())
                ?? $this->failNow()
        );

    }
    public function newRoom ( int $userId ) {

        $user = $this->userRepository->findOrFail($userId)->hasOrFail('allow_chats');
        if ( $user->id === user_id() || $user->hasRole('admin') ) return permissionFailed();

        $room = $this->roomRepository->startRoom(is_admin() ? 'support' : 'p2p', user_id(), $userId);
        event(new ChatEvent(ChatEventType::ROOM_CREATED->value, room: $room));

        $this->deleteCache();
        return success(['item' => $room->toResource()]);

    }
    public function typing ( int $id ) {

        $this->authorize($id);
        event(new ChatEvent(ChatEventType::ROOM_TYPING->value, roomId: $id, user: user()));
        return success();
        
    }
    public function refresh ( int $id ) {

        $this->roomRepository->setAction($this->roomRepository->findOrFail($id), data: ['deleted' => false], create: false);
        $this->deleteCache();
        return success();

    }
    public function setConfig ( int $id, int $userId = null, int $exceptId = null, array $data = [] ) {

        $this->roomRepository->setAction($this->authorize($id), $userId, $exceptId, $data);
        $this->deleteCache();
        return success();

    }
    public function archive ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['archived' => true]);

    }
    public function unarchive ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['archived' => false]);

    }
    public function mute ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['muted' => true]);

    }
    public function unmute ( int $id ) {

        return $this->setConfig($id, user_id(), data: ['muted' => false]);

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

        if ( in_array($type, ['all', 'others']) ) event(new ChatEvent(ChatEventType::ROOM_DELETED->value, roomId: $id));
        return success();

    }
    public function destroy ( int $id ) {

        if ( !$this->authorize($id) || !is_admin() ) return $this->failNow();
        event(new ChatEvent(ChatEventType::ROOM_DELETED->value, roomId: $id));
        return $this->delete($id);

    }

}
