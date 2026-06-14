<?php

namespace App\Repositories;
use App\Models\MessageAction;

class MessageActionRepository extends BaseRepository {

    public function __construct( MessageAction $model ) { parent::__construct($model); }

}
