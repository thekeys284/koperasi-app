<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(){
        return User::where('role','user')->get();
    }

    public function store (Request $request){

        // Validasi Input
        $validated = $request->validate([
             'name' => 'required|string',
             'username' => 'required|unique:users',
             'email' => 'required|email|unique:users',
             'password' => 'required|min:6',
             'satker' => 'string',
             'role' => 'string', 
             'limit_total' => 'numeric|min:0',
             'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Enkripsi password
        $validated['password'] = bcrypt($validated['password']);

        // set sisa limit awal agar sama dengan limit total
        $validated['limit'] = $request->limit_total;

        // upload foto
        if($request->hasFile('profile_picture')){
            $file = $request->file('profile_picture');
            $filename = time().'_'.$request->username.'.'.$file->getClientOriginalExtension();
            $file->storeAs('public/profiles', $filename);

            $validated['profile_picture'] = $filename;
        }

        $user = User::create($validated);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'user' => $user
        ],201);
    }

    public function show($id){
        $user = User::with([
            'submission' => function($query){
                $query->latest();
            },
            'activity_log' => function($query){
                $wuery->latest()->limit(10);
            }
        ])->find($id);
    }
}
