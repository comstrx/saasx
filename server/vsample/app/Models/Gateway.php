<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Gateway extends Model {

    use HasBaseModel;

    public function credential ( $key ) { return $this->credentials[$key] ?? null; }
    public function webhook_id ( $event ) { return $this->webhooks[$event]['id'] ?? null; }
    public function webhook_secret ( $event ) { return $this->webhooks[$event]['secret'] ?? null; }
    public function publicCredentials () { return collect((array) $this->credentials)->filter(fn($v, $k) => str_contains($k, 'public'))->all(); }

}
