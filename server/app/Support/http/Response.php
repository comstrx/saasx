<?php

declare(strict_types=1);

namespace App\Support\Http;

class Response {

    public function __construct ( protected \Illuminate\Http\Client\Response $response ) {

    }
    public function status (): int {

        return $this->response->status();

    }
    public function body (): string {

        return $this->response->body();

    }
    public function json ( ?string $key = null ): mixed {

        return $this->response->json($key);

    }
    public function header ( string $name ): ?string {

        $value = $this->response->header($name);

        return $value === '' ? null : $value;

    }
    /** @return array<string, array<string>> */
    public function headers (): array {

        return $this->response->headers();

    }
    public function successful (): bool {

        return Status::successful($this->status());

    }
    public function failed (): bool {

        return Status::failed($this->status());

    }

}
