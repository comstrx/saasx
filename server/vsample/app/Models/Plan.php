<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Plan extends Model {

    use HasBaseModel;

    protected $disabledTraits = ['tenancy'];

    protected array $relationPreference = [
        'stores' => ['subscriptions.stores', ['plan_id', 'id'], ['id', 'store_id']],
    ];

    public function storesCount () { return $this->stores()->count(); }
    public function subscriptionsCount () { return $this->subscriptions()->count(); }

}
