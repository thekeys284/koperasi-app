<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InitialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('sql/seed.sql');

        if (!File::exists($path)) {
            throw new \Exception("File seed.sql tidak ditemukan: {$path}");
        }

        DB::unprepared(File::get($path));
    }
}
