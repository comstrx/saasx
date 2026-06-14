<?php

namespace App\Http\Resources;

class RegionResource extends BaseResource {

    protected bool $hasImage = true;

    public function tiny ( $data ) {

        return [
            'code' => $data->code,
            'name' => $data->name,
        ];
        
    }
    public function data () {

        return [
            'description' => $this->description,
            'views'       => $this->views,
            'likes'       => $this->likes,
            'dislikes'    => $this->dislikes,
        ];

    }

}
