<?php

declare(strict_types=1);

namespace App\Traits\Bases;
use App\Support\Context;
use App\Support\Response;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;
use Illuminate\Validation\Rules\Unique;

trait HasBaseRequest {

    /** @return array<string, mixed> */
    public function rules (): array {

        return [];

    }
    public function authorize (): bool {

        return true;

    }
    protected function uniqueInTenant ( string $table, string $column = 'NULL', mixed $ignore = null ): Unique {

        $rule = Rule::unique($table, $column)->where('tenant_id', Context::tenantId());

        return $ignore === null ? $rule : $rule->ignore($ignore);

    }
    protected function existsInTenant ( string $table, string $column = 'NULL' ): Exists {

        return Rule::exists($table, $column)->where('tenant_id', Context::tenantId());

    }
    protected function failedValidation ( Validator $validator ): void {

        throw new HttpResponseException(Response::fail($validator->errors()->toArray(), 422));

    }
    protected function failedAuthorization (): void {

        throw new HttpResponseException(Response::error('authorization', 'This action is unauthorized.', 403));

    }

}
