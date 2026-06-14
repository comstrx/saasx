<?php

namespace App\Traits\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Model\Search\Workflow as Search;
use App\Traits\Model\Permissions\Workflow as Permissions;

trait HasBaseModel {

    use
        HasFactory,
        SoftDeletes,
        HasHelpers,
        HasDefaultActions,
        HasFillable,
        Search,
        Permissions,
        HasRelations,
        HasDeepRelations,
        HasMorphs,
        HasFileStorage,
        HasMultiTenancy,
        HasBootedLogs;

}
