<?php

use Illuminate\Support\Facades\Route;

Route::middleware(tenantMiddleware())->namespace('\App\Http\Controllers')->prefix('v1')->group(function(){

    Route::prefix('countries')->name('countries.')->controller(CountryController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{country}')->whereNumber('country')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('cities', 'relatedCities')->name('cities');
            Route::get('categories', 'relatedCategories')->name('categories');
            Route::get('games', 'relatedGames')->name('games');
            Route::get('products', 'relatedProducts')->name('products');
            Route::get('reviews', 'relatedReviews')->name('reviews');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
            });
        });
    });
    Route::prefix('cities')->name('cities.')->controller(CityController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{city}')->whereNumber('city')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('categories', 'relatedCategories')->name('categories');
            Route::get('games', 'relatedGames')->name('games');
            Route::get('products', 'relatedProducts')->name('products');
            Route::get('reviews', 'relatedReviews')->name('reviews');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
            });
        });
    });
    Route::prefix('categories')->name('categories.')->controller(CategoryController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{category}')->whereNumber('category')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('items', 'items')->name('items');
            Route::get('games', 'relatedGames')->name('games');
            Route::get('products', 'relatedProducts')->name('products');
            Route::get('gift-cards', 'relatedGiftCards')->name('gift_cards');
            Route::get('reviews', 'relatedReviews')->name('reviews');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
            });
        });
    });
    Route::prefix('games')->name('games.')->controller(GameController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{game}')->whereNumber('game')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('products', 'relatedProducts')->name('products');
            Route::get('reviews', 'relatedReviews')->name('reviews');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
            });
        });
    });
    Route::prefix('gift-cards')->name('gift_cards.')->controller(GameController::class)->group(function(){
        Route::get('', 'giftCardIndex')->name('index');

        Route::prefix('{gift_card}')->whereNumber('gift_card')->group(function(){
            Route::get('', 'giftCardShow')->name('show');
            Route::get('products', 'relatedProducts')->name('products');
            Route::get('reviews', 'relatedReviews')->name('reviews');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
            });
        });
    });
    Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{product}')->whereNumber('product')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('reviews', 'relatedReviews')->name('reviews');
            Route::get('order', 'order')->name('order');
            Route::get('coupon/{coupon}', 'coupon')->name('coupon');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
                Route::post('cart', 'cart')->name('cart')->middleware('has:allow_carts');
                Route::post('discart', 'discart')->name('discart')->middleware('has:allow_carts');
                Route::post('checkout', 'checkout')->name('checkout')->middleware('has:allow_orders');
            });
        });
    });
    Route::prefix('blogs')->name('blogs.')->controller(BlogController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{blog}')->whereNumber('blog')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('comments', 'relatedComments')->name('comments');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('favorite', 'favorite')->name('favorite')->middleware('has:allow_favorites');
                Route::post('unfavorite', 'unfavorite')->name('unfavorite')->middleware('has:allow_favorites');
                Route::post('comment', 'comment')->name('comment')->middleware('has:allow_comments');
            });
        });
    });
    Route::prefix('plans')->name('plans.')->controller(PlanController::class)->group(function(){
        Route::get('', 'index')->name('index');

        Route::prefix('{plan}')->whereNumber('plan')->group(function(){
            Route::get('', 'show')->name('show');

            Route::middleware(authMiddleware())->group(function(){
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
    });
    Route::prefix('comments')->name('comments.')->controller(CommentController::class)->group(function(){
        Route::delete('', 'setDeletedMultiple')->name('delete.all')->middleware([...authMiddleware(), 'has:allow_comments']);

        Route::prefix('{comment}')->whereNumber('comment')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('replies', 'relatedReplies')->name('replies');

            Route::middleware(authMiddleware())->group(function(){
                Route::put('', 'update')->name('update')->middleware('has:allow_comments');
                Route::delete('', 'setDeleted')->name('delete')->middleware('has:allow_comments');
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('reply', 'reply')->name('reply')->middleware('has:allow_replies');
            });
        });
    });
    Route::prefix('reviews')->name('reviews.')->controller(ReviewController::class)->group(function(){
        Route::delete('', 'setDeletedMultiple')->name('delete.all')->middleware([...authMiddleware(), 'has:allow_reviews']);

        Route::prefix('{review}')->whereNumber('review')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('replies', 'relatedReplies')->name('replies');

            Route::middleware(authMiddleware())->group(function(){
                Route::put('', 'update')->name('update')->middleware('has:allow_reviews');
                Route::delete('', 'setDeleted')->name('delete')->middleware('has:allow_reviews');
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('reply', 'reply')->name('reply')->middleware('has:allow_replies');
            });
        });
    });
    Route::prefix('replies')->name('replies.')->controller(ReplyController::class)->group(function(){
        Route::delete('', 'setDeletedMultiple')->name('delete.all')->middleware([...authMiddleware(), 'has:allow_replies']);

        Route::prefix('{reply}')->whereNumber('reply')->group(function(){
            Route::get('', 'show')->name('show');
            Route::get('replies', 'relatedReplies')->name('replies');

            Route::middleware(authMiddleware())->group(function(){
                Route::put('', 'update')->name('update')->middleware('has:allow_replies');
                Route::delete('', 'setDeleted')->name('delete')->middleware('has:allow_replies');
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('reply', 'reply')->name('reply')->middleware('has:allow_replies');
            });
        });
    });
    Route::prefix('home')->name('home.')->controller(HomeController::class)->group(function(){
        Route::get('recently-offers', 'recentlyOffers')->name('recently-offers');
        Route::get('recently-categories', 'recentlyCategories')->name('recently.categories');
        Route::get('recently-games', 'recentlyGames')->name('recently.games');
        Route::get('recently-products', 'recentlyProducts')->name('recently.products');
        Route::get('recently-gift-cards', 'recentlyGiftCards')->name('recently.gift_cards');
    });
    Route::prefix('search')->name('search.')->controller(SearchController::class)->group(function(){
        Route::get('', 'index')->name('index');
    });
    Route::prefix('content')->name('content.')->controller(ContentController::class)->group(function(){
        Route::get('site-info', 'siteInfo')->name('site_info');
        Route::get('{page?}/{key?}', 'pageInfo')->name('page_info');
    });
    Route::prefix('auth')->controller(AuthController::class)->group(function(){
        Route::post('register', 'register')->name('register');
        Route::post('login', 'login')->name('login');
        Route::post('social-login', 'socialLogin')->name('auth.social');
        Route::post('confirm/{code}', 'confirmCode')->name('auth.confirm');
        Route::post('recovery/{email}', 'recoveryAccount')->name('auth.recovery');
        Route::post('reset/{token}', 'resetPassword')->name('auth.reset');
        Route::post('check-email/{email}', 'checkEmail')->name('auth.check.email');
        Route::post('check-token/{token}', 'checkResetToken')->name('auth.check.token');
    });
    Route::middleware(authMiddleware())->group(function(){
    
        require base_path('routes/apis/shared.php');

        Route::prefix('wallet')->name('wallet.')->middleware('has:allow_wallets')->controller(WalletController::class)->group(function(){
            Route::get('{field?}', 'balance')->name('balance');
        });
        Route::prefix('gateways')->name('gateways.')->controller(GatewayController::class)->group(function(){
            Route::get('', 'index')->name('index');
          
            Route::prefix('{gateway}')->whereNumber('gateway')->group(function(){
                Route::get('', 'show')->name('show');
                Route::post('deposit', 'deposit')->name('deposit')->middleware('has:allow_deposits');
            });
        });
        Route::prefix('withdraw-methods')->name('withdraw_methods.')->controller(WithdrawMethodController::class)->group(function(){
            Route::get('', 'index')->name('index');
           
            Route::prefix('{method}')->whereNumber('method')->group(function(){
                Route::get('', 'show')->name('show');
                Route::post('withdraw', 'withdraw')->name('withdraw')->middleware('has:allow_withdraws');
            });
        });
        Route::prefix('api-tokens')->name('api_tokens.')->controller(ApiTokenController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::get('current', 'current')->name('current');
            Route::post('', 'new')->name('store');
            Route::post('reset', 'reset')->name('reset');

            Route::prefix('{token}')->whereNumber('token')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'delete')->name('delete');
            });
        });
        Route::prefix('transactions')->name('transactions.')->controller(TransactionController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');
            
            Route::prefix('{transaction}')->whereNumber('transaction')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'setDeleted')->name('delete');
                Route::post('refund', 'refund')->name('refund')->middleware('has:allow_refunds');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('orders')->name('orders.')->middleware('has:allow_orders')->controller(OrderController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');
    
            Route::prefix('{order}')->whereNumber('order')->group(function(){
                Route::get('', 'show')->name('show');
                Route::put('', 'update')->name('update');
                Route::delete('', 'setDeleted')->name('delete');
                Route::get('reviews', 'relatedReviews')->name('reviews');
                Route::post('pay', 'pay')->name('pay')->middleware('has:allow_payments');
                Route::post('cancel', 'cancel')->name('cancel')->middleware('has:allow_cancellations');
                Route::post('ticket', 'ticket')->name('ticket')->middleware('has:allow_tickets');
                Route::post('verify', 'verify')->name('verify')->middleware('has:allow_verifications');
                Route::post('confirm/{code}', 'confirm')->name('confirm')->middleware('has:allow_verifications');
                Route::post('review', 'review')->name('review')->middleware('has:allow_reviews');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
            });
        });
        Route::prefix('coupons')->name('coupons.')->middleware('has:allow_coupons')->controller(CouponController::class)->group(function(){
            Route::get('', 'available')->name('available');
    
            Route::prefix('user')->name('user.')->controller(CouponUserController::class)->group(function(){
                Route::get('', 'index')->name('index');
                Route::delete('', 'setDeletedMultiple')->name('delete.all');
        
                Route::prefix('{coupon}')->whereNumber('coupon')->group(function(){
                    Route::get('', 'show')->name('show');
                    Route::delete('', 'setDeleted')->name('delete');
                });
            });
            Route::prefix('{coupon}')->group(function(){
                Route::get('', 'show')->whereNumber('coupon')->name('show');
                Route::post('redeem', 'redeem')->name('redeem');
                Route::post('validate', 'validate')->name('validate');
                Route::post('report', 'report')->whereNumber('coupon')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('levels')->name('levels.')->middleware('has:allow_levels')->controller(LevelController::class)->group(function(){
            Route::get('', 'index')->name('index');
    
            Route::prefix('{level}')->whereNumber('level')->group(function(){
                Route::get('', 'show')->name('show');
                Route::get('features', 'relatedLevelFeatures')->name('features');
                Route::post('like', 'like')->name('like')->middleware('has:allow_likes');
                Route::post('dislike', 'dislike')->name('dislike')->middleware('has:allow_dislikes');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('reports')->name('reports.')->middleware('has:allow_reports')->controller(ReportController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');
    
            Route::prefix('{report}')->whereNumber('report')->group(function(){
                Route::get('', 'show')->name('show');
                Route::put('', 'update')->name('update');
                Route::delete('', 'setDeleted')->name('delete');
            });
        });
        Route::prefix('favorites')->name('favorites.')->middleware('has:allow_favorites')->controller(FavoriteController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'deleteMultiple')->name('delete.all');
    
            Route::prefix('{favorite}')->whereNumber('favorite')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'delete')->name('delete');
            });
        });
        Route::prefix('stores')->name('stores.')->middleware('has:allow_stores')->controller(StoreController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::post('', 'store')->name('store');
            Route::delete('', 'deleteMultiple')->name('delete.all');
    
            Route::prefix('{store}')->whereNumber('store')->group(function(){
                Route::get('', 'show')->name('show');
                Route::put('', 'update')->name('update');
                Route::delete('', 'delete')->name('delete');
                Route::post('renew', 'renew')->name('renew');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('cart')->name('cart.')->middleware('has:allow_carts')->controller(CartController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'deleteMultiple')->name('delete.all');
            Route::post('checkout', 'checkoutAll')->name('checkout.all');
    
            Route::prefix('{cart}')->whereNumber('cart')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'delete')->name('delete');
                Route::get('coupon/{coupon}', 'coupon')->name('coupon');
                Route::post('increment', 'increment')->name('increment');
                Route::post('decrement', 'decrement')->name('decrement');
                Route::post('checkout', 'checkout')->name('checkout');
            });
        });
        Route::prefix('tickets')->name('tickets.')->middleware('has:allow_tickets')->controller(TicketController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::post('', 'store')->name('store');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');

            Route::prefix('{ticket}')->whereNumber('ticket')->group(function(){
                Route::get('', 'show')->name('show');
                Route::put('', 'update')->name('update');
                Route::delete('', 'setDeleted')->name('delete');
                Route::get('replies', 'relatedReplies')->name('replies');
                Route::post('close', 'close')->name('close');
                Route::post('resolve', 'resolve')->name('resolve');
                Route::post('reopen', 'reopen')->name('reopen');
                Route::post('reply', 'reply')->name('reply')->middleware('has:allow_replies');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('referrals')->name('referrals.')->middleware('has:allow_referrals')->controller(ReferralController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');

            Route::prefix('{referral}')->whereNumber('referral')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'setDeleted')->name('delete');
                Route::post('report', 'report')->name('report')->middleware('has:allow_reports');
            });
        });
        Route::prefix('gift-codes')->name('gift_codes.')->middleware('has:allow_gift_codes')->controller(GiftCodeUsageController::class)->group(function(){
            Route::get('', 'index')->name('index');
            Route::delete('', 'setDeletedMultiple')->name('delete.all');

            Route::prefix('{gift_code}')->whereNumber('gift_code')->group(function(){
                Route::get('', 'show')->name('show');
                Route::delete('', 'setDeleted')->name('delete');
            });
        });
       
    });

});
