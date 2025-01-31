<?php

use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

Route::prefix('chat')->group(function () {
    Route::post('/troubleshoot', [ChatController::class, 'troubleshoot']);
    Route::post('/ai', [ChatController::class, 'ai']);
    Route::get('/suggestions', [ChatController::class, 'suggestions']);
    Route::get('/top-faqs', [ChatController::class, 'topFAQs']);
}); 