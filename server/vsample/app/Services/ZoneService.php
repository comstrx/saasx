<?php

namespace App\Services;
use App\Repositories\ZoneRepository;
use App\Repositories\DomainRepository;
use App\Models\Zone;

class ZoneService extends BaseService {

    public function __construct(
        protected ZoneRepository $zoneRepository,
        protected DomainRepository $domainRepository,
        protected CloudflareService $cloudflareService,
        protected VercelService $vercelService,
    ) { parent::__construct($zoneRepository); }

    public function parent () {

        $zone = $this->withTenant(store_parent_id(), callback: fn() => store_parent()?->zone);
        if ( $zone ) return $zone->isValid() ? $zone : null;

        return $this->withoutTenant(fn() => $this->zoneRepository->findByName(config('settings.default.domains.base.name')));

    }
    public function current () {

        $zone = store()?->zone;
        return !$zone ? $this->parent() : ($zone->isValid() ? $zone : null);

    }
    public function flush () {

        $this->zoneRepository->query()->get()->each(fn($z) => $this->remove($z));

    }
    public function sync ( Zone $zone ) {

        $this->zoneRepository->query()->where('id', '!=', $zone->id)->get()->each(fn($z) => $this->remove($z));

    }
    public function remove ( Zone $zone ) {

        $this->vercelService->deleteDomain($zone->name);

        $this->withoutTenant(fn() =>
            $zone->domains()->get()->each(function($domain) {
                $this->vercelService->setProject($domain->dest)->deleteDomain($domain->name);
                $this->domainRepository->delete($domain->id);
            })
        );

        $this->cloudflareService->deleteDomain($zone->provider_id ?? $zone->name);
        $this->delete($zone->id);

    }
    public function validate ( string $name ) {

        if ( $zone = $this->zoneRepository->findByName($name) ) return $zone;
        if ( $this->withoutTenant(fn() => $this->zoneRepository->findByName($name)) ) return null;
  
        return $this->cloudflareService->validateDomain($name);

    }
    public function attach ( string $name ) {

        $domain = $this->cloudflareService->addDomain($name);

        [$id, $name, $ns1, $ns2] = [
            data_get($domain, 'id'),
            data_get($domain, 'name'),
            data_get($domain, 'name_servers.0'),
            data_get($domain, 'name_servers.1'),
        ];
        if ( $id && $name ) {

            $this->cloudflareService->setZone($id)->syncSubDomain('@', type: 'A');
            $this->vercelService->setProject('client')->addDomain($name);

        }

        return [$id, $name, $ns1, $ns2];

    }
    public function register ( string $name ) {

        $name = $this->validate($name);
        if ( !$name || $name instanceof Zone ) return $name;
       
        [$id, $name, $ns1, $ns2] = $this->attach($name);
        if ( !$id || !$name ) return null;

        $zone = $this->zoneRepository->updateOrCreate(
            ['name' => $name],
            ['provider_id' => $id, 'ns1' => $ns1, 'ns2' => $ns2]
        );

        $this->runJob([static::class, 'sync'], [$zone]);
        return $zone;

    }
    public function apply ( string $name = null ) {
        
        if ( $name ) return $this->zoneRepository->findBy('name', $name) ? $this->current() : $this->register($name);

        if ( store()?->zone ) $this->runJob([static::class, 'remove'], [store()->zone]);
        return $this->parent();

    }

}
