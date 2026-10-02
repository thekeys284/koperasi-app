<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('cash_daily_sessions', function (Blueprint $table) {
            $table->id();
            $table->date('cash_date')->unique();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('actual_opening_balance', 15, 2)->nullable();
            $table->decimal('actual_closing_balance', 15, 2)->nullable();
            $table->text('opening_note')->nullable();
            $table->text('closing_note')->nullable();
            $table->unsignedBigInteger('opened_by')->nullable();
            $table->unsignedBigInteger('closed_by')->nullable();
            $table->timestamps();
        });
        Schema::create('cash_daily_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_daily_session_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('description');
            $table->decimal('cash_in', 15, 2)->default(0);
            $table->decimal('cash_out', 15, 2)->default(0);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('cash_daily_entries');
        Schema::dropIfExists('cash_daily_sessions');
    }
};
