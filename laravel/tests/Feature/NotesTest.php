<?php

namespace Tests\Feature;

use App\Jobs\IndexNote;
use App\Models\Note;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NotesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_note_lands_in_the_database_its_body_in_storage_and_the_queue_indexes_it(): void
    {
        Storage::fake();
        Queue::fake();

        $id = $this->postJson('/api/notes', ['title' => 'first', 'body' => 'hello'])->assertCreated()->json('id');

        $note = Note::findOrFail($id);

        Storage::assertExists($note->path);
        Queue::assertPushed(IndexNote::class, fn (IndexNote $job) => $job->note->is($note));

        (new IndexNote($note))->handle();

        $this->getJson("/api/notes/{$id}")
            ->assertOk()
            ->assertJsonPath('body', 'hello')
            ->assertJsonPath('indexed', true);
    }

    public function test_a_note_needs_a_title_and_a_body(): void
    {
        $this->postJson('/api/notes', ['title' => ''])->assertUnprocessable()->assertJsonValidationErrors(['title', 'body']);
    }

    public function test_horizon_refuses_without_the_password(): void
    {
        config(['horizon.basic.password' => 'secret']);

        $this->get('/horizon')->assertUnauthorized();
        $this->withBasicAuth('admin', 'wrong')->get('/horizon')->assertUnauthorized();
        $this->withBasicAuth('admin', 'secret')->get('/horizon')->assertOk();
    }
}
