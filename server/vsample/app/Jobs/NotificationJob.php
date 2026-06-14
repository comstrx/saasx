<?php

namespace App\Jobs;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\NotificationEvent;
use App\Models\Notification;
use App\Models\User;

class NotificationJob implements ShouldQueue {

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct( public Notification $notification ) {}

    public function canNotify ( User $user, array $permissions = [] ) {

        return $user->has('allow_notifications', ...$permissions) && (
            ( !$user->hasRole('admin') && $user->has('allow_' . plural($this->notification->getRelatedName())) ) ||
            ( $user->hasRole('admin') && $user->has('view_' . plural($this->notification->getRelatedName())) )
        );

    }
    public function sendBatch ( Builder $query, array $permissions = [] ) {

        return $query->chunk(500, fn($users) => collect($users)->each(fn($user) =>
            $this->canNotify($user, $permissions) && event(new NotificationEvent($this->notification, $user))
        ));

    }
    public function handle () {

        if ( $this->notification->type === 'admin' ) return $this->sendBatch(User::admin(), ['super']);

        return $this->sendBatch(
            match ( $this->notification->target ) {
                'private'  => User::whereIn('id', $this->notification->notificationUsers()->pluck('user_id')),
                'public'   => User::notAdmin(),
                'system'   => User::admin(),
                'client'   => User::client(),
                'delivery' => User::delivery(),
                'vendor'   => User::vendor(),
                default    => User::query()->whereRaw('1 = 0'),
            }
        );

    }

}
