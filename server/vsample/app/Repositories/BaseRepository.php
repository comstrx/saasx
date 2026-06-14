<?php

namespace App\Repositories;
use App\Traits\Bases\HasBaseRepository;
use Illuminate\Database\Eloquent\Model;

class BaseRepository {

    use HasBaseRepository;

    public function __construct( protected Model $model ) {}
    
}
