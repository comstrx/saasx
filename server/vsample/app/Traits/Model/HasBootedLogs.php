<?php

namespace App\Traits\Model;
use App\Jobs\ExecuteJob;

trait HasBootedLogs {

    use HasHelpers, HasFileStorage, HasMorphs;

    public function handleRequestFiles () {
        
        if ( app()->bound('files.handled') || !request()?->all() ) return;
        app()->instance('files.handled', true);

        if ( request()->hasFile('image') ) {

            if ( $this->getModelName() === 'store' ) $this->setTenant($this->id, callback: fn() => $this->uploadFile(request()->file('image')));
            else $this->uploadFile(request()->file('image'));

        }
        elseif ( request()->allFiles() ) {

            if ( $this->getModelName() === 'store' ) $this->setTenant($this->id, callback: fn() => $this->uploadFiles(request()->allFiles()));
            else $this->uploadFiles(request()->allFiles());

        }

        if ( bool(request('delete_image')) ) $this->deleteImage();
        if ( parse(request('deleted_files')) ) $this->deleteFiles(parse(request('deleted_files')));
        if ( request()->has('active') && is_admin() ) $this->update(['active' => bool(request('active'))]);

    }
    public function modelBooted ( string $event ) {

        if ( !user() ) return $this;
        if ( in_array($event, ['created', 'updated']) ) $this->handleRequestFiles();

        dispatch(new ExecuteJob([$this, 'newLog'], [user_id(), ['event' => $event, 'target' => is_admin() ? 'admin' : 'private']]));
        return $this;

    }

}
