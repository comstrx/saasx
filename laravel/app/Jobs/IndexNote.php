<?php

namespace App\Jobs;

use App\Models\Note;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class IndexNote implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public Note $note) {}

    /**
     * A note is indexed once its body is proven to live in storage — the queue, the cache and the disk all took part.
     */
    public function handle(): void
    {
        if (! Storage::exists($this->note->path)) {
            throw new RuntimeException("Note {$this->note->id} has no body at {$this->note->path}");
        }

        $this->note->forceFill(['indexed_at' => now()])->save();

        Cache::increment('notes:indexed');
    }
}
