<?php

namespace App\Http\Resources;

class TicketResource extends BaseResource {

    protected bool $hasAttachments = true;

    public function tiny ( $data ) {

        return [
            'title'          => $data->title,
            'content'        => $data->content,
            'status'         => $data->status,
            'classification' => $data->classification,
        ];

    }
    public function data () {

        return [
            'name'        => $this->name,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'language'    => $this->language,
            'country'     => $this->country,
            'state'       => $this->state,
            'city'        => $this->city,
            'zip_code'    => $this->zip_code,
            'address'     => $this->address,
            'ip'          => $this->ip,
            'agent'       => $this->agent,
            'views'       => $this->views,
            'likes'       => $this->likes,
            'dislikes'    => $this->dislikes,
            'deleted'     => $this->deleted,
            'resolved_at' => $this->formatDate('resolved_at'),
            'closed_at'   => $this->formatDate('closed_at'),
            'reopened_at' => $this->formatDate('reopened_at'),
        ];

    }
    public function relations () {

        return [
            'user'    => UserResource::info( $this->user ),
            'order'   => OrderResource::info( $this->order ),
            'replies' => ReplyResource::collection($this->replies()->notDeleted()->active()->get()),
        ];

    }

}
