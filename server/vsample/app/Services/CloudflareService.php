<?php

namespace App\Services;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;

class CloudflareService {
   
    protected $client, $zoneId;

    public function __construct() {

        $apiToken = config('settings.default.cloudflare.token');
        $this->zoneId = config('settings.default.cloudflare.domain.id');
        
        $headers = ['Authorization' => "Bearer {$apiToken}", 'Content-Type' => 'application/json'];
        $this->client = new Client(['base_uri' => "https://api.cloudflare.com", 'headers' => $headers, 'timeout'  => 10]);

    }
    public function dnsNames () {

        return $this->findDomain($this->zoneId)['name_servers'] ?? [];

    }
    public function setZone ( string $name = null ) {

        $name = $name ?: $this->zoneId;
        $this->zoneId = !str_contains($name, '.') ? $name : $this->getDomain($name)['id'] ?? null;
        return $this;

    }

    public function allDomains ( array $query = [] ) {

        try{
    
            $response = $this->client->get("/client/v4/zones", ['query' => $query]);
            $response = json_decode($response->getBody(), true);
            return $response['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function addDomain ( string $name, array $data = [] ) {

        try{
    
            $default = ['name' => $name, 'jump_start' => true];
            $response = $this->client->post("/client/v4/zones", ['json' => array_merge($default, $data)]);

            $response = json_decode($response->getBody(), true);
            return $response['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function getDomain ( string $name ) {

        try{
    
            $response = $this->client->get("/client/v4/zones?name={$name}");
            $response = json_decode($response->getBody(), true);
            return $response['result'][0] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function findDomain ( string $id ) {

        try{
    
            $response = $this->client->get("/client/v4/zones/{$id}");
            $response = json_decode($response->getBody(), true);
            return $response['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function deleteDomain ( string $name ) {

        try{

            $id = preg_match('/^[a-f0-9]{32}$/', $name) === 1 ? $name : ($this->getDomain($name)['id'] ?? null);
            if ( !$id ) return;

            $response = $this->client->delete("/client/v4/zones/{$id}");
            $response = json_decode($response->getBody(), true);
            return $response['success'] ?? false;

        } catch ( \Exception $e ) {}

    }
    public function domainStatus ( string $name ) {

        return $this->getDomain($name)['status'] ?? null;

    }
    public function domainVerified ( string $name ) {

        return ($this->getDomain($name)['status'] ?? null) === 'active';

    }
    public function domainExists ( string $name ) {

        return $this->getDomain($name) !== null;

    }
    public function validateDomain ( string $name ) {

        $name = strtolower(trim($name));

        $params = [
            'required', 'string', 'min:3', 'max:253',
            'regex:/^(?!-)([a-zA-Z0-9-]{1,63})(?<!-)(\.[a-zA-Z]{2,})+$/',
        ];

        return Validator::make(['domain' => $name], ['domain' => $params])->passes() ? $name : null;

    }

    public function allSubDomains ( array $query = [] ) {

        try{
    
            $response = $this->client->get("/client/v4/zones/{$this->zoneId}/dns_records", ['query' => $query]);
            $response = json_decode($response->getBody(), true);
            return $response['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function addSubDomain ( string $name, string $type = 'cname' ) {

        try{
    
            $content = strtoupper($type) === 'CNAME' ? config('settings.default.vercel.cname') : config('settings.default.vercel.ip');
            $data = ['name' => $name, 'type' => strtoupper($type), 'content' => $content];

            $response = $this->client->post("/client/v4/zones/{$this->zoneId}/dns_records", ['json' => $data]);
            return json_decode($response->getBody(), true)['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function syncSubDomain ( string $name, string $type = 'cname' ) {

        try {

            $content = strtoupper($type) === 'CNAME' ? config('settings.default.vercel.cname') : config('settings.default.vercel.ip');
            $data = ['name' => $name, 'type' => strtoupper($type), 'content' => $content];

            $id = $this->getSubDomain($name)['id'] ?? null;
            if ( !$id ) return $this->addSubDomain($name, $type);

            $response = $this->client->put("/client/v4/zones/{$this->zoneId}/dns_records/{$id}", ['json' => $data]);
            return json_decode($response->getBody(), true)['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function getSubDomain ( string $name ) {
      
        try {

            $baseName = $this->findDomain($this->zoneId)['name'] ?? null;
            $fullName = str_contains($name, $baseName) ? $name : "{$name}.{$baseName}";

            $response = $this->client->get("/client/v4/zones/{$this->zoneId}/dns_records", ['query' => ['name' => $fullName]]);
            return json_decode($response->getBody(), true)['result'][0] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function findSubDomain ( string $id ) {

        try{
    
            $response = $this->client->get("/client/v4/zones/{$this->zoneId}/dns_records/{$id}");
            $response = json_decode($response->getBody(), true);
            return $response['result'] ?? null;

        } catch ( \Exception $e ) {}

    }
    public function deleteSubDomain ( string $name ) {

        try{
    
            $id = preg_match('/^[a-f0-9]{32}$/', $name) === 1 ? $name : ($this->getSubDomain($name)['id'] ?? null);
            if ( !$id ) return;

            $response = $this->client->delete("/client/v4/zones/{$this->zoneId}/dns_records/{$id}");
            $response = json_decode($response->getBody(), true);
            return $response['success'] ?? false;

        } catch ( \Exception $e ) {}

    }
    public function subDomainExists ( string $name ) {

        return $this->getSubDomain( $name ) !== null;

    }
    public function validateSubDomain ( string $name ) {

        $name = strtolower(trim($name));

        $params = [
            'required', 'string', 'min:1', 'max:63',
            'regex:/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/',
            'not_in:http,https',
        ];
    
        return Validator::make(['domain' => $name], ['domain' => $params])->passes() ? $name : null;

    }

}
