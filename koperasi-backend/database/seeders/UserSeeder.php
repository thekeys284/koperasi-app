<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        \App\Models\User::create([
            'name' => 'Admin Minimarket',
            'username' => 'admin',
            'email' => 'admin@mini.local',
            'password' => bcrypt('admin123'), // Laravel butuh password terenkripsi
            'satker' => 'Pusat',
            'role' => 'admin',
            'limit_total' => 1500000
        ]);
    }
}
