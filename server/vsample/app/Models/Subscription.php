<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Model\HasBaseModel;

class Subscription extends Model {

    use HasBaseModel;

    protected $disabledTraits = ['tenancy'];

}
