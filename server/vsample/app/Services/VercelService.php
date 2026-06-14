<?php

namespace App\Services;
use GuzzleHttp\Client;

class VercelService {
   
    protected $client, $project;

    public function __construct() {

        $apiToken = config('settings.default.vercel.token');
        $this->project = config("settings.default.vercel.projects.client.id");

        $headers = ['Authorization' => "Bearer {$apiToken}", 'Content-Type' => 'application/json'];
        $uri = 'https://api.vercel.com';

        $this->client = new Client(['base_uri' => $uri, 'headers'  => $headers]);

    }
    public function dnsNames () {
    
        return ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];
    
    }
    public function setProject ( string $name = null ) {

        $name = $name ?: 'client';
        $this->project = config("settings.default.vercel.projects.{$name}.id");
        return $this;

    }
    public function allDomains ( array $query = [] ) {

        try{
    
            $response = $this->client->get("/v10/projects/{$this->project}/domains", ['query' => $query]);
            $response = json_decode($response->getBody(), true);
            return $response['domains'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function addDomain ( string $name ) {

        try{
    
            $response = $this->client->post("/v10/projects/{$this->project}/domains", ['json' => ['name' => $name]]);
            $response = json_decode($response->getBody(), true);
            return $response['name'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function deleteDomain ( string $name ) {

        try{
    
            $response = $this->client->delete("/v10/projects/{$this->project}/domains/{$name}");
            $response = json_decode($response->getBody(), true);
            return is_array($response);

        } catch ( \Exception $e ) {}

    }
    public function getDomain ( string $name ) {

        try{
    
            $response = $this->client->get("/v6/domains/{$name}/config");
            $response = json_decode($response->getBody(), true);
            return $response;

        } catch ( \Exception $e ) {}

    }
    public function domainExists ( string $name ) {

        try { return $this->getDomain( $name ) !== null; }
        catch ( \Exception $e ) {}

    }
    public function domainLinked ( string $name ) {
        
        try {

            $response = $this->client->head("https://{$name}", ['allow_redirects' => true, 'timeout' => 5]);
            return isset($response->getHeaders()['X-Vercel-Id']);

        } catch ( \Exception $e ) {}

    }
    public function domainAvailable ( string $name ) {

        try{
    
            $response = $this->client->get("/v10/domains/status?name=$name");
            $response = json_decode($response->getBody(), true);
            return $response['available'] ?? false;

        } catch ( \Exception $e ) {}

    }
    public function buyDomain ( string $name, array $details = [] ) {

        if ( !$this->available($name) ) return null;

        try{
    
            $params = array_merge([
                'name'          => $name,
                'expectedPrice' => 11.5,
                'renew'         => true,
                'country'       => 'US',
                'orgName'       => 'Acme Inc.',
                'firstName'     => 'Coding',
                'lastName'      => 'Master',
                'address1'      => '123 Main St',
                'city'          => 'New York',
                'state'         => 'NY',
                'postalCode'    => '10001',
                'phone'         => '+1.1111111111',
                'email'         => 'info@example.com'
            ], $details);

            $response = $this->client->post('/v5/domains/buy', ['json' => $params]);
            $response = json_decode($response->getBody(), true);
            return $response['domain'] ?? null;

        } catch ( \Exception $e ) {}

    }

}
