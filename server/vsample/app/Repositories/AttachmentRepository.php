<?php

namespace App\Repositories;
use App\Models\Attachment;

class AttachmentRepository extends BaseRepository {

    public function __construct( Attachment $model ) { parent::__construct($model); }

}
