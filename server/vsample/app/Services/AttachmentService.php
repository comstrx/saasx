<?php

namespace App\Services;
use App\Repositories\AttachmentRepository;

class AttachmentService extends BaseService {
   
    public function __construct(
        protected AttachmentRepository $attachmentRepository
    ) { parent::__construct($attachmentRepository); }

}
