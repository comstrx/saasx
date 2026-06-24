<?php

declare(strict_types=1);

namespace App\Support\Storage;

class S3Driver implements Driver {

    /** @param array<string, mixed> $options */
    public function put ( string $key, mixed $contents, array $options = [] ): bool {

        if ( ! is_string($contents) && ! is_resource($contents) && ! $contents instanceof \Psr\Http\Message\StreamInterface && ! $contents instanceof \Illuminate\Http\File && ! $contents instanceof \Illuminate\Http\UploadedFile ) {

            throw new \InvalidArgumentException('Unsupported storage contents type: ' . get_debug_type($contents));

        }

        return (bool) $this->disk()->put($key, $contents, $this->options($options));

    }
    public function get ( string $key ): ?string {

        $disk = $this->disk();

        return $disk->exists($key) ? $disk->get($key) : null;

    }
    public function exists ( string $key ): bool {

        return $this->disk()->exists($key);

    }
    public function delete ( string $key ): bool {

        return $this->disk()->delete($key);

    }
    public function temporaryUrl ( string $key, \DateTimeInterface $expiresAt ): string {

        return $this->disk()->temporaryUrl($key, $expiresAt);

    }
    /**
     * @param  array<string, mixed> $options
     * @return array<string, mixed>
     */
    protected function options ( array $options ): array {

        return array_merge($options, ['visibility' => 'private']);

    }
    protected function disk (): \Illuminate\Filesystem\FilesystemAdapter {

        return \Illuminate\Support\Facades\Storage::disk((string) config('filesystems.cloud', 's3'));

    }

}
