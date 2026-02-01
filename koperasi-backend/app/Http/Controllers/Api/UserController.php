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
                $query->latest()->limit(10);
            }
        ])->find($id);

        // cek jika user ditemukan
        if (!$user){
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota dengan ID '.$id.' tidak ditemukan.'
            ], 404);
        }

        // response sukses 
        return response()->jsno([
            'status' => 'success',
            'data' => [
                'profile' => [
                    'id' => $user->id,
                    'full_name' => $user->name,
                    'satker' => $user->satker,
                    'role' => $user->role, 
                    'email' => $user->email,
                    'username' => $user->username,
                    'profile_picture' => $user->profile_picture ? asset('storage/profiles'.$user->profile_picture):null,
                ],
                'finance' => [
                    'remaining_limit'=>$user->limit, 
                    'total_limit'=>$user->limit_total, 
                    'usage_percentage'=>$user->limit_total > 0 ? round((($user->limit_total - $user->limit) / $user->limit_total) * 100, 2) : 0,
                ],
                'history' => [
                    'recent_submissions' => $user->submissions,
                    'recent_activities'  => $user->activityLogs
                ]
            ]
        ],200);
    }
}
