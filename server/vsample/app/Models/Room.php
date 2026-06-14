<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Room extends Model {

    use HasBaseModel;

    protected array $callbackSearchable = ['applyFilters'];

    protected array $withRelations = [
        'attachments',
        'activeMembers',
        'activeActions',
        'lastMessage',
        'activeMembers.user',
        'activeMembers.user.attachments',
    ];
    protected array $withAggregates = [
        ['unreadMessages', 'count', 'unread_count'],
        ['undeliveredMessages', 'count', 'undelivered_count'],
    ];

    public function activeMembers () {
        
        return $this->roomMembers()->active()->whereHas('user', fn($q) =>
            $q->active()->where(fn($q) =>
                $q->whereDoesntHave('roomActions', fn($q) => $q->whereColumn('room_actions.room_id', 'room_members.room_id'))
                ->orWhereHas('roomActions', fn($q) =>
                    $q->where('deleted', false)->whereColumn('room_actions.room_id', 'room_members.room_id')
                )
            )
        );
    
    }
    public function activeActions () {

        return $this->roomActions()->active();

    }
    public function lastMessage () {
        
        return $this->message()->doesntHaveAction(user_id(), 'deleted')->latestOfMany();
    
    }
    public function unreadMessages ( int $userId = null ) {
        
        return $this->messages()
            ->where('sender_id', '!=', $userId ?? user_id())
            ->when(user_role(), fn($q) => $q->whereHas('sender', fn($q) => $q->where('role', '!=', user_role())))
            ->doesntHaveAction($userId ?? user_id(), ['deleted', 'read']);
    
    }
    public function undeliveredMessages ( int $userId = null ) {
        
        return $this->messages()
            ->where('sender_id', '!=', $userId ?? user_id())
            ->doesntHaveAction($userId ?? user_id(), ['deleted', 'delivered']);
    
    }
    public function lastUsedAt () {
        
        return $this->lastMessage?->formatDate('updated_at') ??
            $this->currentMember()?->formatDate('updated_at') ??
            $this->formatDate('updated_at');

    }

    public function currentMember () {
        
        return $this->activeMembers->firstWhere('user_id', user_id());
    
    }
    public function anotherMembers () {
        
        return $this->activeMembers->where('user_id', '!=', user_id())->values();
    
    }
    public function currentAction () {
        
        return $this->activeActions->firstWhere('user_id', user_id());
    
    }
    public function anotherActions () {
        
        return $this->activeActions->where('user_id', '!=', user_id())->values();

    }

    public function scopeForMember ( Builder $query, int|array $member = null, string $type = null ) {

        return $query->active()
            ->when($type, fn($q) => $q->where('type', $type))
            ->whereHas('activeMembers', fn($q) => $q->whereIn('user_id', (array) $member));

    }
    public function scopeHasAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->whereHas('roomActions', function ($q) use ( $userId, $action ) {
            $q->where('user_id', $userId);
            foreach ( (array) $action as $action ) $q->where($action, true);
        });

    }
    public function scopeDoesntHaveAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->where(fn($query) =>
            $query->whereDoesntHave('roomActions', fn($q) => $q->where('user_id', $userId))
            ->orWhereHas('roomActions', function ($q) use ( $userId, $action ) {
                $q->where('user_id', $userId);
                foreach ( (array) $action as $action ) $q->where($action, false);
            })
        );

    }
    public function applyFilters ( Builder $query, array $filters = [] ) {
        
        [$userId, $isAdmin] = [integer(data_get($filters, 'user_id')), data_get($filters, 'user_role') === 'admin'];

        $filters = [
            'read'     => data_get($filters, 'read'),
            'muted'    => data_get($filters, 'muted'),
            'pinned'   => data_get($filters, 'pinned'),
            'archived' => data_get($filters, 'archived'),
            'deleted'  => bool(data_get($filters, 'deleted')) && $isAdmin,
        ];
        foreach ( $filters as $key => $value ) {

            if ( !isset($value) ) continue;

            if ( $key === 'read' ) $query = bool($value) ?
                $query->whereHas('messages', fn($q) => $q->hasAction($userId, $key)) :
                $query->whereHas('messages', fn($q) => $q->doesntHaveAction($userId, $key));

            else $query = bool($value) ?
                $query->hasAction($userId, $key) :
                $query->doesntHaveAction($userId, $key);

        }

        return $isAdmin ? $query : $query->forMember($userId);

    }

}
