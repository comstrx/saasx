<?php

declare(strict_types=1);

namespace App\Traits\Dna\Social;
use App\Models\Like;
use App\Support\Context;
use App\Support\Database;
use App\Traits\Dna\HasPermissions;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\UniqueConstraintViolationException;

/** @mixin \Illuminate\Database\Eloquent\Model */
trait HasLikes {

    use HasPermissions;

    /** @return MorphMany<Like, $this> */
    public function likes (): MorphMany {

        return $this->morphMany(Like::class, 'engageable');

    }
    public function like ( bool $value = true ): void {

        $this->hasOrFail('allow_likes');
        $this->react($value);

    }
    public function unlike (): void {

        $this->hasOrFail('allow_likes');
        $this->react(null);

    }
    public function liked (): bool {

        return $this->likes()->where('user_id', Context::userId())->where('value', true)->exists();

    }
    public function likesCount (): int {

        return $this->reactionCount('likes_count', true);

    }
    public function dislikesCount (): int {

        return $this->reactionCount('dislikes_count', false);

    }
    protected function react ( ?bool $value ): void {

        try {

            $this->toggleReaction($value);

        } catch ( UniqueConstraintViolationException ) {

            $this->toggleReaction($value);

        }

    }
    protected function toggleReaction ( ?bool $value ): void {

        $userId = Context::userId();

        Database::transaction(function () use ( $value, $userId ): void {

            $existing = $this->likes()->where('user_id', $userId)->lockForUpdate()->first();
            $previous = $existing === null ? null : (bool) $existing->getAttribute('value');

            if ( $previous === $value ) return;

            if ( $value === null ) $existing?->delete();
            elseif ( $existing === null ) $this->likes()->create(['user_id' => $userId, 'value' => $value]);
            else { $existing->setAttribute('value', $value); $existing->save(); }

            if ( $previous !== null ) $this->adjustCounter($previous ? 'likes_count' : 'dislikes_count', -1);
            if ( $value !== null ) $this->adjustCounter($value ? 'likes_count' : 'dislikes_count', 1);

        });

    }
    protected function adjustCounter ( string $column, int $delta ): void {

        if ( ! Database::hasColumn($this->getTable(), $column) ) return;

        $query = $this->newQuery()->whereKey($this->getKey())->toBase();

        $delta > 0 ? $query->increment($column, $delta) : $query->decrement($column, -$delta);

        $this->setAttribute($column, (int) $this->getAttribute($column) + $delta);

    }
    protected function reactionCount ( string $column, bool $value ): int {

        if ( Database::hasColumn($this->getTable(), $column) ) return (int) $this->getAttribute($column);

        return $this->likes()->where('value', $value)->count();

    }

}
