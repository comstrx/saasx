<?php

namespace App\Services;
use App\Repositories\DomainRepository;
use App\Models\Domain;
use App\Models\Zone;

class DomainService extends BaseService {

    public function __construct(
        protected DomainRepository $domainRepository,
        protected ZoneService $zoneService,
        protected CloudflareService $cloudflareService,
        protected VercelService $vercelService,
    ) { parent::__construct($domainRepository); }

    public function resolve ( array $data = [], bool $defaults = true, bool $filled = true ) {

        $list = collect([
            ['dest' => 'client',    'name' => data_get($data, 'client_domain_name') ?: ($defaults ? 'www' : '')],
            ['dest' => 'admin',     'name' => data_get($data, 'admin_domain_name') ?: ($defaults ? 'admin' : '')],
            ['dest' => 'vendor',    'name' => data_get($data, 'vendor_domain_name')],
            ['dest' => 'delivery',  'name' => data_get($data, 'delivery_domain_name')],
            ['dest' => 'affiliate', 'name' => data_get($data, 'affiliate_domain_name')],
            ['dest' => 'blog',      'name' => data_get($data, 'blog_domain_name')],
            ['dest' => 'app',       'name' => data_get($data, 'app_domain_name')],
            ['dest' => 'api',       'name' => data_get($data, 'api_domain_name')],
            ['dest' => 'cdn',       'name' => data_get($data, 'cdn_domain_name')],
        ]);

        return $filled ? $list->filter(fn($item) => $item['name']) : $list->filter(fn($item) => !$item['name']);

    }
    public function clean ( array $items = [] ) {

        collect($items)->each(fn($item) =>
            $this->domainRepository->query()->where('dest', $item['dest'])->get()->each(fn($d) => $this->remove($d))
        );

    }
    public function flush () {

        $this->zoneService->flush();
        $this->domainRepository->query()->get()->each(fn($d) => $this->remove($d));

    }
    public function sync ( Domain $domain ) {

        $this->domainRepository->query()->where('id', '!=', $domain->id)->where('dest', $domain->dest)->get()->each(fn($d) => $this->remove($d));

    }
    public function remove ( Domain $domain ) {

        $this->vercelService->setProject($domain->dest)->deleteDomain($domain->name);
        $this->cloudflareService->setZone($domain->zone?->provider_id)->deleteSubDomain($domain->provider_id ?? $domain->name);
        $this->delete($domain->id);

    }
    public function validate ( Zone $zone, string $name ) {

        $name = explode('.', strtolower(trim($name)))[0];
        $full = "{$name}.{$zone->name}";

        if ( $domain = $this->domainRepository->findByName($full) ) return $domain;
        if ( $this->withoutTenant(fn() => $this->domainRepository->findByName($full)) ) return null;
       
        return $this->cloudflareService->validateSubDomain($name);

    }
    public function attach ( Zone $zone, string $name, string $dest ) {
       
        $cloudflare = $this->cloudflareService->setZone($zone->provider_id);
        $domain = $zone->store_id === store_id() ? $cloudflare->syncSubDomain($name) : $cloudflare->addSubDomain($name);
       
        [$id, $name] = [data_get($domain, 'id'), data_get($domain, 'name')];
        if ( $name ) $this->vercelService->setProject($dest)->addDomain($name);

        return [$id, $name];

    }
    public function register ( Zone $zone,  string $name, string $dest ) {

        $name = $this->validate($zone, $name);
        if ( !$name || $name instanceof Domain ) return $name;

        [$id, $name] = $this->attach($zone, $name, $dest);
        if ( !$id || !$name ) return null;

        $domain = $this->domainRepository->updateOrCreate(
            ['name' => $name, 'dest' => $dest],
            ['zone_id' => $zone->id, 'provider_id' => $id]
        );
        
        $this->runJob([static::class, 'sync'], [$domain]);
        return $domain;

    }
    public function check ( string $domain = null, array $data = [] ) {

        if ( $domain && store()?->zone?->name !== $domain ) return (bool) $this->zoneService->validate($domain);
        if ( !$zone = $this->zoneService->current() ) return false;

        return $this->resolve($data, (bool) $domain)->every(fn($item) => $this->validate($zone, $item['name']));

    }
    public function apply ( array $data = [] ) {

        $domain = string(data_get($data, 'domain_name'));
   
        if ( !$this->check($domain, $data) ) return false;
        if ( !$zone = $this->zoneService->apply($domain) ) return false;

        $result = $this->resolve($data, (bool) $domain)->every(fn($item) => $this->register($zone, $item['name'], $item['dest']));
        if ( $result ) $this->runJob([static::class, 'clean'], [$this->resolve($data, (bool) $domain, false)->all()]);

        return $result;

    }

}
