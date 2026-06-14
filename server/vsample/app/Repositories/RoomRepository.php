<?php

namespace App\Repositories;
use App\Models\Room;
use App\Models\RoomMember;
use App\Models\RoomAction;
use App\Models\User;

class RoomRepository extends BaseRepository {

    public function __construct( Room $model ) { parent::__construct($model); }

    public function newRoom ( int $creator, int|array $members = [], array $data = [] ) {

        $room = parent::create([
            'name' => $data['name'] ?? null,
            'type' => $data['type'] ?? 'support',
            'creator_id' => $creator
        ]);
        
        $this->addMembers($room, $members);
        $this->setAction($room, data: ['deleted' => false], create: false);

        return $room;

    }
    public function startRoom ( string $type, int $creator, int $userId ) {

        return match ( strtolower(string($type)) ) {
            'p2p' =>
                $this->query()->forMember([$creator, $userId], 'p2p')->first() ??
                $this->newRoom($creator, [$creator, $userId], ['type' => 'p2p']),
            default =>
                $this->query()->forMember($userId, 'support')->first() ??
                $this->newRoom($creator, $userId, ['type' => 'support']),
        };

    }
    public function setAction ( Room $room, int|array $userId = null, int|array $exceptId = null, array $data = [], bool $create = true ) {

        if ( is_int($userId) ) return RoomAction::updateOrCreate(['room_id' => $room->id, 'user_id' => $userId], $data);

        return $room->roomMembers()
            ->when($userId, fn($q) => $q->whereIn('user_id', (array) $userId))
            ->when($exceptId, fn($q) => $q->whereNotIn('user_id', (array) $exceptId))
            ->cursor()
            ->each(fn($m) =>
                $create ?
                    RoomAction::updateOrCreate(['room_id' => $m->room_id, 'user_id' => $m->user_id], $data) :
                    RoomAction::where(['room_id' => $m->room_id, 'user_id' => $m->user_id])->update($data)
            );

    }
    public function addMembers ( Room $room, int|array $userIds = null ) {

        return collect((array) $userIds)
            ->filter(fn($id) => RoomMember::firstOrCreate(['room_id' => $room->id, 'user_id' => $id]))
            ->count();

    }
    public function validateMember ( Room $room, User $user ) {

        return $user->hasRole('admin') || $room->activeMembers()->where('user_id', $user->id)->exists() ? $room : null;

    }
    public function supportRoomId ( User $user ) {

        return $user->hasRole('admin') ? null : $this->startRoom('support', $user->id, $user->id)?->id;

    }

}
