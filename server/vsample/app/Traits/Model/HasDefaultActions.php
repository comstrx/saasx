<?php

namespace App\Traits\Model;
use Illuminate\Database\Eloquent\Builder;

trait HasDefaultActions {

    use HasHelpers;
    
    public function related () {
        
        return $this->morphTo();
    
    }
    public function scopeActive ( Builder $query ) {
        
        return $query->whereScope('active');
    
    }
    public function scopeDeleted ( Builder $query ) {
        
        return $query->whereScope('deleted');
    
    }
    public function scopePaid ( Builder $query ) {
        
        return $query->whereScope('paid');
    
    }
    public function scopeRead ( Builder $query ) {
        
        return $query->whereScope('read');
    
    }
    public function scopeNotActive ( Builder $query ) {
        
        return $query->whereScope(['active' => false]);
    
    }
    public function scopeUnread ( Builder $query ) {
        
        return $query->whereScope(['read' => false]);
    
    }
    public function scopeAllow ( Builder $query ) {
        
        return $query->whereScope(['active', 'allow']);
    
    }
    public function scopeDeny ( Builder $query ) {
        
        return $query->whereScope(['active', 'allow' => false]);
    
    }
    public function scopeNotDeleted ( Builder $query ) {
        
        return $query->whereScope(['deleted' => false]);
    
    }
    public function scopePending ( Builder $query ) {
        
        return $query->whereScope(['status' => 'pending']);
    
    }
    public function scopeCompleted ( Builder $query ) {
        
        return $query->whereScope(['status' => 'completed']);
    
    }
    public function scopeConfirmed ( Builder $query ) {
        
        return $query->whereScope(['status' => 'confirmed']);
    
    }
    public function scopeCancelled ( Builder $query ) {
        
        return $query->whereScope(['status' => 'cancelled']);
    
    }
    public function scopeApproved ( Builder $query ) {
        
        return $query->whereScope(['status' => 'approved']);
    
    }
    public function scopeRejected ( Builder $query ) {
        
        return $query->whereScope(['status' => 'rejected']);
    
    }
    public function scopeClosed ( Builder $query ) {
        
        return $query->whereScope(['status' => 'closed']);
    
    }
    public function scopeReviewed ( Builder $query ) {
        
        return $query->whereScope(['status' => 'reviewed']);
    
    }
    public function scopeUsed ( Builder $query ) {
        
        return $query->whereNotNull('used_at');
    
    }
    public function scopeNotUsed ( Builder $query ) {
        
        return $query->whereNull('used_at');
    
    }
    public function scopeExpired ( Builder $query ) {
        
        return $query->whereDate('expires_at', '<', now());
    
    }
    public function scopeNotExpired ( Builder $query ) {
        
        return $query->where(fn($q) => $q->whereNull('expires_at')->orWhereDate('expires_at', '>', now()));
    
    }
    public function storeAdmin ( int $storeId = null ) {
        
        return \App\Models\User::withoutTenant()->where('store_id', $storeId ?? store_id())->where('role', 'admin')->first();
    
    }
    public function storeOwner ( int $storeId = null ) {
        
        return \App\Models\User::withoutTenant()->where('id', store_owner_id())->where('role', 'client')->first();
    
    }

    public function activate () {

        return $this->hasColumn('active') && $this->update(['active' => true]);
    
    }
    public function deactivate () {

        return $this->hasColumn('active') && $this->update(['active' => false]);
    
    }
    public function setDeleted () {

        return $this->hasColumn('deleted') && $this->update(['deleted' => true]);
    
    }
    public function setNotDeleted () {

        return $this->hasColumn('deleted') && $this->update(['deleted' => false]);
    
    }
    public function setUsed () {

        return $this->hasColumn('used_at') && $this->update(['used_at' => utc_date()]);
    
    }
    public function setExpired () {

        return $this->hasColumn('expires_at') && $this->update(['expires_at' => utc_date()]);
    
    }
    public function isActive () {

        return $this->hasColumn('active') ? $this->active : true;

    }
    public function isDeleted () {

        return $this->hasColumn('deleted') && $this->deleted;
        
    }
    public function isUsed () {

        return $this->hasColumn('used_at') && $this->used_at;

    }
    public function isExpired () {

        return $this->hasColumn('expires_at') && $this->expires_at && now()->greaterThan($this->expires_at);

    }
    public function isPublic () {

        return (
            ($this->hasColumn('type') && strtolower($this->type) === 'public') ||
            ($this->hasColumn('public') && $this->public)
        );

    }
    public function isPrivate () {

        return (
            ($this->hasColumn('type') && strtolower($this->type) === 'private') ||
            ($this->hasColumn('private') && $this->private) ||
            !$this->isPublic()
        );

    }

    public function isFavorite () {
        
        return $this->favorites()->where('user_id', user_id())->active()->exists();
    
    }
    public function isCart () {
        
        return $this->carts()->where('user_id', user_id())->active()->exists();
    
    }
    public function isAvailable ( string $usageColumn = null ) {

        $usage = $this->hasColumn($usageColumn) ? $this->$usageColumn >= 1 : true;
        return $this->isActive() && !$this->isDeleted() && !$this->isExpired() && $usage;

    }
    public function newUsage ( string $column, int $quantity = 1 ) {
        
        return $this->$column < $quantity ? $this->update([$column => 0]) : $this->decrement($column, $quantity);
    
    }

}
