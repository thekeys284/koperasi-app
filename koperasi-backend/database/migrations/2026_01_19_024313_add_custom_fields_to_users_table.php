<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
        $table->string('username')->unique()->after('name');
        $table->string('satker')->nullable()->after('email');
        $table->enum('role', ['admin', 'operator', 'user'])->default('user')->after('password');
        $table->bigInteger('limit')->default(0)->after('role');
        $table->bigInteger('limit_total')->default(0)->after('limit');
        $table->string('profile_picture')->nullable()->after('limit_total');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
