<?php

namespace App\Http\Resources;

class ContentResource extends BaseResource {

    protected bool $hasAttachments = true, $hasQrcode = true;

    public function data () {

        return [
            'type'        => $this->type,
            'location'    => $this->location,
            'sort'        => $this->sort,
            'key'         => $this->key,
            'page'        => $this->page,
            'value'       => $this->value,
            'url'         => $this->url,
            'title'       => $this->title,
            'content'     => $this->content,
            'description' => $this->description,
            'expires_at'  => $this->formatDate('expires_at'),
        ];

    }

}
