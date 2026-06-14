<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class GiftCode extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'usages' => 'giftCodeUsages',
    ];

    public function usagesCount () { return $this->giftCodeUsages()->count(); }

}
