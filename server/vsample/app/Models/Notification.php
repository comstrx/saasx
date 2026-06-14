<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Traits\Model\HasBaseModel;

class Notification extends Model {

    use HasBaseModel;

    protected array $callbackSearchable = ['applyFilters'];
    protected array $withRelations = ['related', 'attachments'];

    public function currentAction () {

        return $this->notificationActions()->where('user_id', user_id())->active()->first();

    }
    public function scopeForUser ( Builder $query, int $userId, string $userRole = null ) {
        
        return $query->where(fn($q) =>
            $q->whereIn('target', ['public', $userRole])
            ->orWhere(fn($q1) =>
                $q1->where('target', 'private')
                ->whereHas('notificationUsers', fn($q2) => $q2->where('user_id', $userId))
            )
        );
    
    }
    public function scopeHasAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->whereHas('notificationActions', function ($q) use ( $userId, $action ) {
            $q->where('user_id', $userId);
            foreach ( (array) $action as $action ) $q->where($action, true);
        });

    }
    public function scopeDoesntHaveAction ( Builder $query, int $userId, string|array $action = null ) {

        return $query->active()->where(fn($query) =>
            $query->whereDoesntHave('notificationActions', fn($q) => $q->where('user_id', $userId))
            ->orWhereHas('notificationActions', function ($q) use ( $userId, $action ) {
                $q->where('user_id', $userId);
                foreach ( (array) $action as $action ) $q->where($action, false);
            })
        );

    }
    public function applyFilters ( Builder $query, array $filters = [] ) {
        
        [$userId, $userRole] = [integer(data_get($filters, 'user_id')), string(data_get($filters, 'user_role'))];

        $filters = [
            'read'    => data_get($filters, 'read'),
            'pinned'  => data_get($filters, 'pinned'),
            'deleted' => data_get($filters, 'deleted')
        ];
        foreach ( $filters as $key => $value ) {

            if ( !isset($value) ) continue;
            
            $query = bool($value) ?
                $query->hasAction($userId, $key) :
                $query->doesntHaveAction($userId, $key);

        }

        return $query->forUser($userId, $userRole);

    }

}
