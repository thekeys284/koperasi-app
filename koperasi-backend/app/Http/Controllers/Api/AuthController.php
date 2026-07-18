<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    
    public function register(Request $request)
    {
        // 1. Validasi input dari React
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username', // Pastikan tidak kembar
            'email' => 'required|string|email|max:255|unique:users,email',   // Pastikan tidak kembar
            'password' => 'required|string|min:6', // Minimal 6 karakter demi keamanan
        ]);

        // 2. Simpan data ke tabel users
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password), // 💡 KUNCI: Di-hash menjadi Bcrypt
            'role' => 'user', // 💡 DEFAULT: Otomatis diset sebagai anggota biasa
        ]);

        // 3. Otomatis buatkan token Sanctum supaya setelah register bisa langsung otomatis login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran akun anggota berhasil!',
            'token' => $token,
            'user' => $user
        ], 201); // Status code 201 artinya Created
    }
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string', // Bisa email atau username
            'password' => 'required',
        ]);

        $loginField = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginField, $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email/Username atau Password salah'], 401);
        }

        // Hapus token lama jika ada
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout, token telah dihapus'], 200);
    }
}