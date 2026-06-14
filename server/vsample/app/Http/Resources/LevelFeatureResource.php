<?php

namespace App\Http\Resources;

class LevelFeatureResource extends BaseResource {

    protected bool $hasImage = true;
    
    public function tiny ( $data ) {

        return [
            'name'        => $data->name,
            'description' => $data->description,
            'benefits'    => $data->benefits,
        ];

    }
    public function relations () {

        return [
            'level' => LevelResource::info( $this->level ),
        ];

    }

}
