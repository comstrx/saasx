<?php

namespace App\Jobs;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\SeedingService;
use App\Models\Store;

class SeedingStoreData implements ShouldQueue {

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct( protected Store $store, protected array $data = [] ) {}

    public function tags () {

        return ['store', 'seeding', "store:$this->store->id"];
        
    }
    public function handle ( SeedingService $seedingService ) {

        $seedingService->run($this->store, $this->data);

    }

}
