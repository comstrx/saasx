<?php

namespace App\Payments;
use GuzzleHttp\Client;
use App\Repositories\PaymentRepository;
use App\Repositories\GatewayRepository;

abstract class BasePayment {
    
    protected $name, $config, $client, $options;

    abstract protected function depositRequest ();
    abstract protected function withdrawRequest ();
    abstract protected function refundRequest ();

    public function __construct ( protected PaymentRepository $paymentRepository, protected GatewayRepository $gatewayRepository ) {

        $this->setConfig();
        $this->setClient();
        if ( method_exists($this, 'booted') ) $this->booted();

    }
    protected function setClient ( array $headers = [] ) {

        if ( !$this->config->credential('api_url') ) throwError("credentials", 'invalid credentials');
        
        $this->client = new Client([
            'timeout' => 10,
            'base_uri' => $this->config->credential('api_url'),
            'headers' => array_merge(['Content-Type' => 'application/json'], $headers)
        ]);

    }
    protected function setConfig ( int $store_id = null ) {

        $name = $this->name ?? str_replace('payment', '', strtolower(class_basename($this)));

        $this->config = $this->gatewayRepository->findByName($name, $store_id);
        if ( !$this->config ) throwError('gateway', 'invalid gateway');

    }
    protected function sendRequest ( string $method = 'GET', string $endpoint = null, array $data = [] ) {

        try { return json_decode($this->client->$method($endpoint, $data)->getBody(), true); }
        catch ( \Exception $e ) { logger()->error($e->getMessage()); }

    }
    protected function get ( mixed $key = null ) {
        
        return $key ? data_get($this->options, $key) : $this->options;
    
    }
    protected function set ( mixed $key, mixed $value = null ) {
        
        data_set($this->options, $key, $value); return $value;
    
    }
    public function deposit ( array $params ) {
    
        $this->options = $this->paymentRepository->initializeDeposit($this->config, $params);
        $this->depositRequest();
        return $this->paymentRepository->startTransaction($this->options);

    }
    public function withdraw ( array $params ) {
    
        $this->options = $this->paymentRepository->initializeWithdraw($this->config, $params);
        $this->withdrawRequest();
        return $this->paymentRepository->startTransaction($this->options);

    }
    public function refund ( array $params ) {
    
        $this->options = $this->paymentRepository->initializeRefund($this->config, $params);
        $this->refundRequest();
        return $this->paymentRepository->startTransaction($this->options);

    }
    public function payOrder ( array $params ) {
    
        $this->options = $this->paymentRepository->initializePayOrder($this->config, $params);
        $this->depositRequest();
        return $this->paymentRepository->startTransaction($this->options);

    }

}
