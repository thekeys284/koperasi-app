<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $path = database_path('sql/schema.sql');

        if (!File::exists($path)) {
            throw new Exception("schema.sql tidak ditemukan di: {$path}");
        }

        DB::unprepared(File::get($path));
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::statement('DROP TABLE IF EXISTS loan_recap_items');
        DB::statement('DROP TABLE IF EXISTS loans');
        DB::statement('DROP TABLE IF EXISTS submissions');

        DB::statement('DROP TABLE IF EXISTS debt_payments');
        DB::statement('DROP TABLE IF EXISTS debts');

        DB::statement('DROP TABLE IF EXISTS sale_items');
        DB::statement('DROP TABLE IF EXISTS sales');

        DB::statement('DROP TABLE IF EXISTS stock_adjustments');
        DB::statement('DROP TABLE IF EXISTS stock_batches');

        DB::statement('DROP TABLE IF EXISTS price_logs');
        DB::statement('DROP TABLE IF EXISTS unit_conversions');

        DB::statement('DROP TABLE IF EXISTS products');

        DB::statement('DROP TABLE IF EXISTS payment_methods');
        DB::statement('DROP TABLE IF EXISTS units');
        DB::statement('DROP TABLE IF EXISTS categories');

        DB::statement('DROP TABLE IF EXISTS activity_logs');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
