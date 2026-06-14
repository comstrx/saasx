<?php

namespace App\Traits\Bases;

trait HasBaseRequest {

    use HasRequestRules;

    protected array $requiredFields = [];

    protected function prepareForValidation () {

        if ( $this->has('_meta') ) $this->merge( json_decode($this->_meta, true) );
        $this->merge( collect($this->all())->mapWithKeys(fn($value, $key) => [$key => !is_string($value) ? $value : trim($value)])->all() );

    }
    public function required ( string $name, bool $status = false ) {

        $isCorrectMethod = in_array(request()->method(), ['POST', 'PUT', 'GET']);
        $isUpdateOnField = request()->route('field');

        return $isCorrectMethod &&
            ( $status || in_array($name, $this->requiredFields) ) &&
            ( $isUpdateOnField ? $name === $isUpdateOnField : true );

    }
    public function authorize () {
        
        return true;
    
    }
    public function rules () {

        return array_merge($this->baseRules(), method_exists($this, 'setRules') ? $this->setRules() : []);

    }
    public function baseRules () {

        return [];
        
        return [
            'name'          => $this->nameRule( $this->required('name') ),
            'phone'         => $this->phoneRule( $this->required('phone') ),
            'email'         => $this->emailRule( $this->required('email') ),
            'password'      => $this->passwordRule( $this->required('password') ),
            'gender'        => $this->genderRule( $this->required('gender') ),
            'slug'          => $this->slugRule( $this->required('slug') ),
            'type'          => $this->stringRule( $this->required('type') ),
            'code'          => $this->stringRule( $this->required('code') ),
            'title'         => $this->stringRule( $this->required('title') ),
            'reason'        => $this->stringRule( $this->required('reason') ),
            'company'       => $this->stringRule( $this->required('company') ),
            'status'        => $this->stringRule( $this->required('status') ),
            'duration'      => $this->stringRule( $this->required('duration') ),
            'content'       => $this->textRule( $this->required('content') ),
            'message'       => $this->textRule( $this->required('message') ),
            'notes'         => $this->textRule( $this->required('notes') ),
            'cancel_notes'  => $this->textRule( $this->required('cancel_notes') ),
            'description'   => $this->textRule( $this->required('description') ),
            'longitude'     => $this->longitudeRule( $this->required('longitude') ),
            'latitude'      => $this->latitudeRule( $this->required('latitude') ),
            'theme'         => $this->themeRule( $this->required('theme') ),
            'currency'      => $this->currencyRule( $this->required('currency') ),
            'language'      => $this->languageRule( $this->required('language') ),
            'country'       => $this->countryRule( $this->required('country') ),
            'state'         => $this->stringRule( $this->required('state') ),
            'city'          => $this->stringRule( $this->required('city') ),
            'street'        => $this->stringRule( $this->required('street') ),
            'address'       => $this->stringRule( $this->required('address') ),
            'location'      => $this->stringRule( $this->required('location') ),
            'zip_code'      => $this->zipRule( $this->required('zip_code') ),
            'postal'        => $this->zipRule( $this->required('postal') ),
            'birth_date'    => $this->dateRule( $this->required('birth_date') ),
            'date'          => $this->dateRule( $this->required('date') ),
            'expires_at'    => $this->dateRule( $this->required('expires_at') ),
            'started_at'    => $this->dateRule( $this->required('started_at') ),
            'last_used_at'  => $this->dateRule( $this->required('last_used_at') ),
            'check_in'      => $this->dateRule( $this->required('check_in') ),
            'check_out'     => $this->dateRule( $this->required('check_out') ),
            'max_quantity'  => $this->integerRule( $this->required('max_quantity') ),
            'max_usages'    => $this->integerRule( $this->required('max_usages') ),
            'quantity'      => $this->integerRule( $this->required('quantity') ),
            'days'          => $this->integerRule( $this->required('days') ),
            'refund_days'   => $this->integerRule( $this->required('refund_days') ),
            'url'           => $this->urlRule( $this->required('url') ),
            'path'          => $this->stringRule( $this->required('path') ),
            'size'          => $this->floatRule( $this->required('size') ),
            'rating'        => $this->floatRule( $this->required('rating') ),
            'image_file'    => $this->fileRule( $this->required('image_file') ),
            'amount'        => $this->amountRule( $this->required('amount') ),
            'price'         => $this->amountRule( $this->required('price') ),
            'new_price'     => $this->amountRule( $this->required('new_price') ),
            'old_price'     => $this->amountRule( $this->required('old_price') ),
            'cancel_cost'   => $this->amountRule( $this->required('cancel_cost') ),
            'discount'      => $this->amountRule( $this->required('discount') ),
            'percentage'    => $this->amountRule( $this->required('percentage') ),
        ];

    }

}
