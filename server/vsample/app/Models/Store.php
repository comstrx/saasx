<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Store extends Model {

    use HasBaseModel;

    protected array $disabledTraits = ['tenancy'];

    protected array $relationPreference = [
        'attachments' => 'attachments',
        'logs' => 'logs',
        'views' => 'views',
        'plan' => ['subscriptions.plans', ['store_id', 'id'], ['id', 'plan_id']],
    ];

    public function countriesCount () { return $this->countries()->count(); }
    public function citiesCount () { return $this->cities()->count(); }
    public function categoriesCount () { return $this->categories()->count(); }
    public function gamesCount () { return $this->games()->count(); }
    public function productsCount () { return $this->products()->count(); }
    public function couponsCount () { return $this->coupons()->count(); }
    public function ordersCount () { return $this->orders()->count(); }
    public function giftCodesCount () { return $this->giftCodes()->count(); }
    public function platformsCount () { return $this->platforms()->count(); }
    public function regionsCount () { return $this->regions()->count(); }
    public function blogsCount () { return $this->blogs()->count(); }
    public function commentsCount () { return $this->comments()->count(); }
    public function reviewsCount () { return $this->reviews()->count(); }
    public function repliesCount () { return $this->replies()->count(); }

}
