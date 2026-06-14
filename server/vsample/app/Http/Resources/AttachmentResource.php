<?php

namespace App\Http\Resources;

class AttachmentResource extends BaseResource {

    public function data () {

        return [
            'name' => $this->name,
            'type' => $this->type,
            'size' => $this->size,
            'path' => $this->path,
        ];

    }

}
