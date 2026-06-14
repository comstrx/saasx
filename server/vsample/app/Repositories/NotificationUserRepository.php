<?php

namespace App\Repositories;
use App\Models\NotificationUser;

class NotificationUserRepository extends BaseRepository {

    public function __construct( NotificationUser $model ) { parent::__construct($model); }

}
