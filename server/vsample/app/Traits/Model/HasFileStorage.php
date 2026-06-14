<?php

namespace App\Traits\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\QrCode;
use Illuminate\Support\Str;

trait HasFileStorage {

    use HasHelpers;

    public function getAttachments () {

        return $this->relationLoaded('attachments') ? $this->attachments : $this->attachments()->get();

    }
    public function getAttachmentsResource () {

        return $this->getAttachments()->toResourceCollection();

    }
    public function getAttachment ( string $type = null ) {

        return $this->getAttachments()->when($type, fn($q) => $q->where('type', $type))->last();

    }
    public function getImages ( bool $withImage = true ) {

        $images = $this->getAttachments();

        return !$withImage ?
            $images->toResourceCollection() :
            [$images->firstWhere('type', 'image')?->path, $images->toResourceCollection()];
        
    }
    public function hasImage () {

        return !!$this->getAttachment('image');

    }
    public function getImage () {

        return $this->getAttachment('image')?->path;

    }
    public function deleteImage () {
        
        $image = $this->getAttachments()->where('type', 'image')->last();
        return !$image ? false : ( Storage::delete($image->path) && $image->delete() );

    }

    public function getQrcodes () {

        return $this->relationLoaded('qrcodes') ? $this->qrcodes : $this->qrcodes()->get();

    }
    public function getQrcodesResource () {

        return $this->getQrcodes()->toResourceCollection();

    }
    public function hasQrcode ( string $name = null ) {

        return !!$this->getQrcodes()->when($name, fn($q) => $q->where('name', $name))->last();
        
    }
    public function getQrcode ( string $name = null ) {

        return $this->getQrcodes()->when($name, fn($q) => $q->where('name', $name))->last()?->path;

    }
    public function deleteQrcode () {

        $qrcode = $this->getQrcodes()->last();
        return !$qrcode ? false : ( Storage::delete($qrcode->path) && $qrcode->delete() );

    }
    
    public function uploadFile ( UploadedFile $file = null, bool $override = true ) {
        
        if ( !$file?->isValid() ) return null;
        $fileInfo = file_info($file);

        $data = [
            'name' => $fileInfo['name'] ?? null,
            'type' => $fileInfo['type'] ?? null,
            'size' => $fileInfo['size'] ?? null,
            'path' => $file->store(Str::snake($this->getModelName()) . '/' . now()->format('Y/m/d')),
        ];

        return $override ? $this->attachments()->updateOrCreate([], $data) : $this->attachments()->create($data);

    }
    public function uploadFiles ( array|UploadedFile $files = null ) {
        
        $files = collect(is_array($files) ? $files : [$files])
            ->filter(fn($file) => $file instanceof UploadedFile && $file->isValid())
            ->map(function($file) {
                $fileInfo = file_info($file);
                return [
                    'name' => $fileInfo['name'] ?? null,
                    'type' => $fileInfo['type'] ?? null,
                    'size' => $fileInfo['size'] ?? null,
                    'path' => $file->store(Str::snake($this->getModelName()) . '/' . now()->format('Y/m/d')),
                ];
            });

        $attachments = $this->attachments();
        return $files->chunk(100)->flatMap(fn($batch) => $attachments->createMany($batch->toArray()));

    }
    public function deleteFile ( int $id, string $type = null ) {
        
        $file = $this->attachments()->where('id', $id)->when($type, fn($q) => $q->where('type', $type))->first();
        if ( !$file ) return false;
       
        if ( Storage::exists($file->path) ) Storage::delete($file->path);
        return $file->delete();

    }
    public function deleteFiles ( array $ids = [], string $type = null ) {

        return collect($ids)->each(fn($id) => $this->deleteFile($id, $type));
        
    }
    public function newQrcode ( string $name = null, string $content = null, bool $override = true ) {

        $writer = new PngWriter();
        $qrCode = new QrCode(data: $content ?: '', margin: 10, size: 500);
    
        $filename = ($name ? slug($name) . '-' : '') . uniqid() . '.png';
        $path = 'qrcode/' . now()->format('Y/m/d') . '/' . Str::snake($this->getModelName()) . '/' . $filename;
        Storage::put($path, $writer->write($qrCode)->getString());

        $data = ['name' => $name, 'content' => $content, 'path' => $path];
        return $override ? $this->qrcodes()->updateOrCreate([], $data) : $this->qrcodes()->create($data);

    }

}
