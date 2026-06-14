<?php

namespace App\Repositories;
use App\Models\Platform;
use App\Models\GamePlatform;
use App\Models\Game;

class PlatformRepository extends BaseRepository {

    public function __construct( Platform $model ) { parent::__construct($model); }

    public function fields ( array $data = [] ) {

        $data = optional($data);

        return [
            'code'        => string($data['code']),
            'notes'       => string($data['notes']),
            'name'        => $data['name'],
            'description' => $data['description'],
        ];

    }
    public function attacheGame ( Game $game, int|array $platformIds = null ) {

        $platforms = parent::query()->whereIn('id', (array) $platformIds)->active()->get();
        GamePlatform::where('game_id', $game->id)->whereNotIn('platform_id', (array) $platformIds)->forceDelete();
        return $platforms->each(fn($platform) => GamePlatform::firstOrCreate(['game_id' => $game->id, 'platform_id' => $platform->id]));

    }

}
