<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Message extends Model {

    use HasBaseModel;

    protected array $callbackSearchable = ['applyFilters'];

    protected array $withRelations = [
        'room',
        'product',
        'sender',
        'replied',
        'attachments',
        'activeActions',
        'replied.activeActions',
        'replied.attachments',
        'sender.attachments',
        'product.attachments',
        'room.attachments',
    ];

    public function activeActions () {

        return $this->messageActions()->active();

    }
    public function currentAction () {
        
        return $this->activeActions->firstWhere('user_id', user_id());
    
    }
    public function anotherActions () {
        
        return $this->activeActions->where('user_id', '!=', user_id())->values();
    
    }
    public function checkAction ( string $key ) {

        return $this->anotherActions()->isNotEmpty() && $this->anotherActions()->some(fn($action) => $action->{$key});

    }

    public function scopeHasAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->where(fn ($query) =>
            $query->whereHas('messageActions', function ($q) use ( $userId, $action ) {
                $q->where('user_id', $userId);
                foreach ( (array) $action as $action ) $q->where($action, true);
            })
        );

    }
    public function scopeDoesntHaveAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->where(fn($query) =>
            $query->whereDoesntHave('messageActions', fn($q) => $q->where('user_id', $userId))
            ->orWhereHas('messageActions', function ($q) use ( $userId, $action ) {
                $q->where('user_id', $userId);
                foreach ( (array) $action as $action ) $q->where($action, false);
            })
        );

    }
    public function applyFilters ( Builder $query, array $filters = [] ) {
        
        [$userId, $isAdmin] = [integer(data_get($filters, 'user_id')), data_get($filters, 'user_role') === 'admin'];

        $filters = [
            'read'      => data_get($filters, 'read'),
            'delivered' => data_get($filters, 'delivered'),
            'starred'   => data_get($filters, 'starred'),
            'pinned'    => data_get($filters, 'pinned'),
            'deleted'   => bool(data_get($filters, 'deleted')) && $isAdmin,
        ];
        foreach ( $filters as $key => $value ) {

            if ( !isset($value) ) continue;

            else $query = bool($value) ?
                $query->hasAction($userId, $key) :
                $query->doesntHaveAction($userId, $key);

        }

        return $query;

    }

}
