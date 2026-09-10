<?php

namespace App\Http\Controllers;

use App\Jobs\IndexNote;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NoteController extends Controller
{
    /**
     * Keep the note in the database, its body in storage, and let the queue index it.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $path = 'notes/'.Str::uuid().'.txt';

        Storage::put($path, $data['body']);

        $note = DB::transaction(fn () => Note::create(['title' => $data['title'], 'path' => $path]));

        IndexNote::dispatch($note)->afterCommit();

        return response()->json($note, 201);
    }

    public function show(Note $note): array
    {
        return [
            ...$note->toArray(),
            'body' => Storage::get($note->path),
            'indexed' => $note->indexed_at !== null,
        ];
    }
}
