<?php

namespace App\Http\Resources;

class ReportResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'reason'  => $data->reason,
            'title'   => $data->title,
            'content' => $data->content,
        ];

    }
    public function data () {

        return [
            'name'    => $this->getRelatedName(),
            'ip'      => $this->ip,
            'agent'   => $this->agent,
            'status'  => $this->status,
            'deleted' => $this->deleted,
        ];

    }
    public function relations () {
        
        return [
            'user' => UserResource::info( $this->user ),
            $this->getRelatedName() => $this->getRelatedResource(),
        ];

    }

}
