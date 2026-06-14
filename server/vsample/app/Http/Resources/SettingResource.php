<?php

namespace App\Http\Resources;

class SettingResource extends BaseResource {

    public function data () {

        return [
            'group'      => $this->group,
            'key'        => $this->key,
            'value'      => $this->value,
            'json_value' => $this->json_value,
        ];

    }
    public function relations () {

        return [
            $this->getRelatedName() => $this->getRelatedResource(),
        ];

    }

}
