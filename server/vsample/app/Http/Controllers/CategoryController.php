<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\CategoryService;

class CategoryController extends Controller {

    public function __construct ( protected CategoryService $categoryService ) {
        
        parent::__construct($categoryService);
    
    }
    public function items ( Request $req, int $id ) {

        return $this->categoryService->items($id, $req->all(), $this->scopes, $this->permissions);

    }

}
