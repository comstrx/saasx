<?php

namespace App\Repositories;
use App\Models\Ticket;

class TicketRepository extends BaseRepository {

    public function __construct( Ticket $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'user_id'        => integer($data['user_id']),
            'order_id'       => integer($data['order_id']),
            'name'           => string($data['name']),
            'email'          => string($data['email']),
            'phone'          => string($data['phone']),
            'language'       => string($data['language']),
            'country'        => string($data['country']),
            'state'          => string($data['state']),
            'city'           => string($data['city']),
            'zip_code'       => string($data['zip_code']),
            'address'        => string($data['address']),
            'classification' => string($data['classification']),
            'title'          => string($data['title']),
            'content'        => string($data['content']),
            'ip'             => ip(),
            'agent'          => agent(),
        ];

    }

}
