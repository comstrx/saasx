<?php

namespace App\Http\Resources;

class NotificationResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function data () {

        $config = optional($this->currentAction());

        return [
            'type'    => $this->type,
            'title'   => $this->title,
            'content' => $this->content,
            'read'    => $config->read ?? false,
            'pinned'  => $config->pinned ?? false,
            'deleted' => $config->deleted ?? false,
        ];

    }
    public function relations () {

        return [
            $this->getRelatedName() => $this->makeRelatedResource(),
        ];
        
    }

}
