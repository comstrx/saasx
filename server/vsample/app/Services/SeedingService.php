<?php

namespace App\Services;
use Illuminate\Support\Facades\DB;
use App\Repositories\SiteInfoRepository;
use App\Repositories\ContentRepository;
use App\Repositories\SettingRepository;
use App\Repositories\GatewayRepository;
use App\Repositories\UserRepository;
use App\Models\Store;

class SeedingService {
   
    public function __construct(
        protected SiteInfoRepository $siteInfoRepository,
        protected ContentRepository $contentRepository,
        protected SettingRepository $settingRepository,
        protected GatewayRepository $gatewayRepository,
        protected UserRepository $userRepository,
    ) {}

    public function siteInfo ( Store $store ) {

        $this->siteInfoRepository->factory([
            'store_id' => $store->id,
            'name'  => $store->name,
            'email' => $store->email,
            'phone' => $store->phone
        ])->create()->attachments()->create(['path' => "content/info/logo.png", 'store_id' => $store->id]);

    }
    public function content ( Store $store ) {
        
        $factory = $this->contentRepository->factory(['store_id' => $store->id]);

        collect(['about', 'policy', 'faq'])->each(fn($page) =>
            $factory->page($page)->create()
        );
        $factory->banner('hero')->count(1)->create()->each(fn($banner) =>
            collect(range(1, 3))->each(fn($i) =>
                $banner->attachments()->create(['path' => "content/banner/{$i}.webp", 'store_id' => $store->id])
            )
        );
        $factory->banner('payment')->count(1)->create()->each(fn($banner) =>
            collect(range(1, 10))->each(fn($i) =>
                $banner->attachments()->create(['path' => "content/payment/{$i}.png", 'store_id' => $store->id])
            )
        );

    }
    public function settings ( Store $store ) {

        collect(config('settings.settings', []))->each(fn( $items, $group ) => 
            collect($items)->each(fn($item) =>
                $this->settingRepository->updateOrCreate([
                    'store_id' => $store->id,
                    'group' => $group,
                    'key' => data_get($item, 'key')
                ], $item, boot: false, strict: false)
            )
        );

    }
    public function gateways ( Store $store ) {

        collect(config('settings.gateways', []))->each(fn( $config, $name ) =>
            $this->gatewayRepository->updateOrCreate([
                'store_id' => $store->id,
                'name' => $config['name'] ?? $name
            ], $config, boot: false, strict: false)
            ->attachments()
            ->create(['path' => 'gateway/' . ($config['name'] ?? $name) . '.png', 'store_id' => $store->id])
        );

    }
    public function permissions ( Store $store ) {

        Store::syncPermissions('settings.permissions', conditions: ['store_id' => $store->id], syncAll: true, force: true);

    }
    public function admin ( Store $store, array $data = [] ) {

        $this->userRepository->createSuperAdmin([
            'store_id' => $store->id,
            'name'     => data_get($data, 'admin_name'),
            'email'    => data_get($data, 'admin_email'),
            'phone'    => data_get($data, 'admin_phone'),
            'password' => data_get($data, 'admin_password'),
        ]);

    }
    public function run ( Store $store, array $data = [] ) {

        try {

            DB::transaction(function () use ( $store, $data ) {
                $this->siteInfo( $store );
                $this->content( $store );
                $this->settings( $store );
                $this->gateways( $store );
                $this->permissions( $store );
                $this->admin( $store, $data );
            });

            if ( $store->owner ) send_email($store->owner, $store, 'store');

        } catch (\Exception $e) { report($e); }

    }

}
