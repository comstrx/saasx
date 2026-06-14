<?php

namespace App\Repositories;
use App\Models\RoomMember;

class RoomMemberRepository extends BaseRepository {

    public function __construct( RoomMember $model ) { parent::__construct($model); }

}
