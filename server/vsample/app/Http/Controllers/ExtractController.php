<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Store;
use App\Models\Category;

class ExtractController extends Controller {

    public bool $global_route = false;
    
    protected $all;
    protected $categories;
    protected $games;
    protected $products;
    protected $update;

    public function __construct () {
        
        // $id = request()->route('store');
        // $ids = parse(request()->ids);
        // $this->update = bool(request()->input('update'));

        // $store = Store::active()->findOrFail($id);
        // $this->all = $store->categories()->where('allow_imports', true);
        // $this->categories = $store->categories()->where('allow_imports', true);
        // $this->games = $store->games()->where('allow_imports', true);
        // $this->products = $store->products()->where('allow_imports', true);

        // if ( $ids ) {

        //     $this->categories = $this->categories->whereIn('id', $ids);
        //     $this->games = $this->games->whereIn('id', $ids);
        //     $this->products = $this->products->whereIn('id', $ids);

        // }

    }
    public function all ( Request $req ) {

        sync_categories($this->all->get(), $this->update);
        return success();

    }
    public function categories ( Request $req ) {

        sync_categories($this->categories->get(), $this->update);
        return success();

    }
    public function games ( Request $req ) {

        sync_games($this->games->get(), $this->update);
        return success();

    }
    public function products ( Request $req ) {
        
        sync_products($this->products->get(), $this->update);
        return success();

    }

}
