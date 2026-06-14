<?php

namespace App\Repositories;
use App\Models\Domain;
use App\Models\Store;

class DomainRepository extends BaseRepository {

    public function __construct( Domain $model, protected ZoneRepository $zoneRepository ) { parent::__construct($model); }

    public function findByName ( string $name ) {

        return parent::query()->where('name', $name)->verified()->first();

    }
    public function findStore ( string $name ) {

        $name = parse_url($name, PHP_URL_HOST) ?: $name;
        $name = trim(strtolower(explode('/', $name, 2)[0]));
        $host = preg_replace('/^www\./i', '', $name);

        $domain = $this->findByName($name);
        if ( $domain && $domain->zone?->isVerified() ) return $domain->store;

        $zone = $this->zoneRepository->findByName($host);
        if ( $zone ) return $zone->store;

    }

}
