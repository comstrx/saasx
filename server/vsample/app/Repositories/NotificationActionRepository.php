<?php

namespace App\Repositories;
use App\Models\NotificationAction;

class NotificationActionRepository extends BaseRepository {

    public function __construct( NotificationAction $model ) { parent::__construct($model); }

}
