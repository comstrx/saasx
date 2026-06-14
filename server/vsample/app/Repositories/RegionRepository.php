<?php

namespace App\Repositories;
use App\Models\Region;
use App\Models\GameRegion;
use App\Models\Game;

class RegionRepository extends BaseRepository {

    public function __construct( Region $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'code'        => string($data['code']),
            'notes'       => string($data['notes']),
            'name'        => $data['name'],
            'description' => $data['description'],
        ];

    }
    public function attacheGame ( Game $game, int|array $regionIds = null ) {

        $regions = parent::query()->whereIn('id', (array) $regionIds)->active()->get();
        GameRegion::where('game_id', $game->id)->whereNotIn('region_id', (array) $regionIds)->forceDelete();
        return $regions->each(fn($region) => GameRegion::firstOrCreate(['game_id' => $game->id, 'region_id' => $region->id]));

    }

}
