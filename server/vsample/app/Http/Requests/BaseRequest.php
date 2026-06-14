<?php

namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Traits\Bases\HasBaseRequest;

class BaseRequest extends FormRequest {

    use HasBaseRequest;

}
