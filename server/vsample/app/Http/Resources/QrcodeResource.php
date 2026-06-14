<?php

namespace App\Http\Resources;

class QrcodeResource extends BaseResource {

    public function data () {

        return [
            'name'    => $this->name,
            'path'    => $this->path,
            'content' => $this->content,
        ];

    }
    public function relations () {

        return [
            $this->getRelatedName() => $this->getRelatedResource(),
        ];
        
    }

}
