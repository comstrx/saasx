<?php

namespace App\Repositories;
use App\Models\Game;

class GameRepository extends BaseRepository {

    public function __construct( Game $model, protected PlatformRepository $platformRepo, protected RegionRepository $regionRepo ) {
        
        parent::__construct($model);
    
    }
    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'country_id'      => integer($data['country_id']),
            'city_id'         => integer($data['city_id']),
            'category_id'     => integer($data['category_id']),
            'type'            => string($data['type']),
            'phone'           => string($data['phone']),
            'language'        => string($data['language']),
            'gender'          => string($data['gender']),
            'notes'           => string($data['notes']),
            'delivery_method' => string($data['delivery_method'] ?? 'automatic'),
            'name'            => $data['name'],
            'company'         => $data['company'],
            'location'        => $data['location'],
            'description'     => $data['description'],
            'details'         => $data['details'],
            'instructions'    => $data['instructions'],
            'includes'        => $data['includes'],
            'policy'          => $data['policy'],
            'fields'          => $data['fields'],
        ];

    }
    public function booted ( Game $game, array $data = [] ) {

        $platforms = collect(parse(data_get($data, 'platforms')))->map(fn($item) => is_object($item) ? $item->id : integer($item))->all();
        $regions = collect(parse(data_get($data, 'regions')))->map(fn($item) => is_object($item) ? $item->id : integer($item))->all();

        if ( isset($data['platforms']) ) $this->platformRepo->attacheGame($game, $platforms);
        if ( isset($data['regions']) ) $this->regionRepo->attacheGame($game, $regions);

    }

}
