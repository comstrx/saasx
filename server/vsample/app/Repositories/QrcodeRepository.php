<?php

namespace App\Repositories;
use App\Models\Qrcode;

class QrcodeRepository extends BaseRepository {

    public function __construct( Qrcode $model ) { parent::__construct($model); }

}
