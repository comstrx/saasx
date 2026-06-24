<?php

declare(strict_types=1);

namespace App\Support\Storage;
use App\Support\File;
use Illuminate\Http\UploadedFile;

class Upload {

    public static function key ( UploadedFile $file, ?string $dir ): string {

        $name = File::unique(File::sanitize($file->getClientOriginalName()));

        return ObjectKey::in($dir, $name);

    }

}
