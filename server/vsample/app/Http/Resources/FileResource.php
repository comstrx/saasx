<?php

namespace App\Http\Resources;

class FileResource extends BaseResource {

    public function data () {

        return [
            'name' => $this->name,
            'type' => $this->type,
            'size' => $this->size,
            'url'  => $this->url,
        ];

    }

}
