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
       $path = database_path('sql' . DIRECTORY_SEPARATOR . 'schema.sql');
        
        if (!file_exists($path)) {
            throw new \Exception("File tidak ditemukan di: " . $path);
        }

        $sql = file_get_contents($path);

        // Gunakan unprepared karena file SQL mentah biasanya berisi banyak statement
        DB::unprepared($sql);
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        
        DB::statement('DROP TABLE IF EXISTS credit_payment');
        DB::statement('DROP TABLE IF EXISTS payment_methods');
        DB::statement('DROP TABLE IF EXISTS sale_items');
        DB::statement('DROP TABLE IF EXISTS sales');
        DB::statement('DROP TABLE IF EXISTS stock_batches');
        DB::statement('DROP TABLE IF EXISTS products');
        DB::statement('DROP TABLE IF EXISTS categories');
        DB::statement('DROP TABLE IF EXISTS activity_logs');
        DB::statement('DROP TABLE IF EXISTS price_logs');
        DB::statement('DROP TABLE IF EXISTS stock_adjustments');
        DB::statement('DROP TABLE IF EXISTS submissions');
        DB::statement('DROP TABLE IF EXISTS units');
        DB::statement('DROP TABLE IF EXISTS users');
        
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
