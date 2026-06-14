<?php

namespace App\Traits\Model;
use Illuminate\Support\Arr;
use App\Models\NotificationUser;
use App\Jobs\NotificationJob;

trait HasMorphs {

    use HasHelpers;

    public function newReport ( int $userId, array $data = [] ) {

        $report = $this->hasOrFail('allow_reports')->reports()->create([
            'ip'      => ip(),
            'agent'   => agent(),
            'user_id' => $userId,
            'reason'  => string($data['reason'] ?? request()->input('reason')),
            'title'   => string($data['title'] ?? request()->input('title')),
            'content' => string($data['content'] ?? request()->input('content')),
        ]);

        return $report->modelBooted('created');

    }
    public function newReview ( int $userId, array $data = [] ) {

        $review = $this->hasOrFail('allow_reviews')->reviews()->create([
            'ip'      => ip(),
            'agent'   => agent(),
            'user_id' => $userId,
            'title'   => string($data['title'] ?? request()->input('title')),
            'content' => string($data['content'] ?? request()->input('content')),
            'rating'  => float($data['rating'] ?? request()->input('rating')),
        ]);

        return $review->modelBooted('created');

    }
    public function newComment ( int $userId, array $data = [] ) {

        $comment = $this->hasOrFail('allow_comments')->comments()->create([
            'ip'      => ip(),
            'agent'   => agent(),
            'user_id' => $userId,
            'title'   => string($data['title'] ?? request()->input('title')),
            'content' => string($data['content'] ?? request()->input('content')),
        ]);

        return $comment->modelBooted('created');

    }
    public function newReply ( int $userId, array $data = [] ) {

        $reply = $this->hasOrFail('allow_replies')->replies()->create([
            'ip'      => ip(),
            'agent'   => agent(),
            'user_id' => $userId,
            'title'   => string($data['title'] ?? request()->input('title')),
            'content' => string($data['content'] ?? request()->input('content')),
        ]);
        
        return $reply->modelBooted('created');

    }
    public function newLike ( int $userId, bool $like = true ) {

        $action = $this->hasOrFail($like ? 'allow_likes' : 'allow_dislikes')->likes()->where('user_id', $userId)->first();
        [$canLike, $canDislike] = [$this->hasColumn('likes'), $this->hasColumn('dislikes')];

        if ( $action && $action->like !== $like ) {

            $action->update(['like' => $like]);
            if ( $like ) { $canLike && $this->increment('likes'); $canDislike && $this->dislikes > 0 && $this->decrement('dislikes'); }
            else { $canDislike && $this->increment('dislikes'); $canLike && $this->likes > 0 && $this->decrement('likes'); }

        }
        elseif ( !$action ) {

            $this->likes()->create(['user_id' => $userId, 'like' => $like]);
            if ( $like ) $canLike && $this->increment('likes');
            else $canDislike && $this->increment('dislikes');

        }

        return true;

    }
    public function newView ( int $userId ) {

        $this->hasColumn('views') && $this->increment('views');
        return $this->views()->updateOrCreate(['user_id' => $userId]);

    }
    public function newFavorite ( int $userId, bool $favorite = true ) {

        return $favorite ?
            $this->hasOrFail('allow_favorites')->favorites()->updateOrCreate(['user_id' => $userId]) :
            $this->hasOrFail('allow_favorites')->favorites()->where('user_id', $userId)->delete();

    }
    public function newLog ( int $userId, array $data = [], bool $notification = true ) {

        $event = string($data['event'] ?? 'updated');
        if ( $event === 'updated' && !$this->getChanges() ) return;

        $log = $this->logs()->create([
            'ip'      => ip(),
            'agent'   => agent(),
            'user_id' => $userId,
            'event'   => $event,
            'changes' => match ( $event ) {
                'created' => Arr::except($this->getAttributes(), ['created_at', 'updated_at']),
                'updated' => Arr::except($this->getChanges() ?: [], ['created_at', 'updated_at']),
                default => [],
            },
        ]);

        if ( $notification ) $log?->newNotification($data, [$userId]);
        return $log;
        
    }
    public function newNotification ( array $data = [], array $users = [] ) {
        
        $notification = $this->notifications()->create([
            'target'     => string($data['target'] ?? 'private'),
            'type'       => string($data['type'] ?? 'log'),
            'title'      => string($data['title'] ?? null),
            'content'    => string($data['content'] ?? null),
        ]);
        if ( $notification->target === 'private' ) {

            $users = collect(array_unique($users))->map(fn($id) => ['user_id' => $id, 'notification_id' => $notification->id])->all();
            NotificationUser::insert($users);

        }

        $notification->uploadFiles($data['attachments'] ?? null);
        dispatch(new NotificationJob($notification));

    }

}
