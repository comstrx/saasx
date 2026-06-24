<?php

declare(strict_types=1);

namespace App\Http\Requests;
use App\Traits\Bases\HasBaseRequest;
use Illuminate\Foundation\Http\FormRequest;

class BaseRequest extends FormRequest {

    use HasBaseRequest;

}
