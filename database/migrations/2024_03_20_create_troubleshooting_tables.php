<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('troubleshooting_guides', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->text('solution');
            $table->string('image_path')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
            
            // Add fulltext indexes only for text columns
            $table->fullText(['title', 'description', 'solution']);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('session_id');
            $table->string('title')->nullable();
            $table->text('message');
            $table->enum('type', ['user', 'bot', 'ai']);
            $table->boolean('is_faq')->default(false);
            $table->integer('frequency')->default(1);
            $table->foreignId('guide_id')->nullable()->constrained('troubleshooting_guides')->onDelete('set null');
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('troubleshooting_guides');
        Schema::dropIfExists('chat_messages');
    }
}; 