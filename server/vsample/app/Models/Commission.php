<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Commission extends Model {

    use HasBaseModel;

    protected array $relationPreference = [
        'users'  => 'commissionUsers',
        'usages' => 'commissionUsages',
    ];

    public function usersCount () { return $this->commissionUsers()->count(); }
    public function usagesCount () { return $this->commissionUsages()->count(); }

}
