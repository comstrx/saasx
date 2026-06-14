<?php

namespace App\Repositories;
use App\Models\PersonalAccessToken;
use App\Models\User;

class AccessTokenRepository {

    public function __construct( protected PersonalAccessToken $model ) {}

    public function newToken ( User $user, string $name = null ) {

        return $user->createToken($name ?? 'authentication', ['*'], now()->addDays(7))->plainTextToken;

    }
    public function allTokens ( User $user, string $name = null, int $subDays = 0 ) {

        return $user->tokens()
            ->when($name, fn($q) => $q->where('name', $name))
            ->when($subDays, fn($q) => $q->where('created_at', '>=', now()->subDays($subDays)))
            ->latest()
            ->get();

    }
    public function findById ( User $user, int $id ) {
        
        return $user->tokens()->findOrFail($id);

    }
    public function deleteToken ( User $user, string $name = null, string|array $id = null ) {
        
        return $user->tokens()
            ->when($name, fn($q) => $q->where('name', $name))
            ->when(!empty($id), fn($q) => $q->whereIn('id', (array) $id))
            ->delete();

    }
    public function deleteOtherTokens ( User $user, string $name = null ) {

        return $user->tokens()
            ->when($name, fn($q) => $q->where('name', $name))
            ->where('id', '!=', $user->currentAccessToken()?->id)
            ->delete();

    }
    public function deleteCurrentToken ( User $user ) {

        return $user->currentAccessToken()?->delete();

    }

}
