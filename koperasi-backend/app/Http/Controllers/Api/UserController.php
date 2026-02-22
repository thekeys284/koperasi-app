<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(){
        return User::whereIn('role',['user','admin', 'operator'])->get();
        // return User::all();
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
            'submission' => function ($query) {
                $query->latest();
            },
            'activityLogs' => function ($query) { // samakan dengan nama relasi di model
                $query->orderBy('message_date_time', 'desc')->limit(10);
            }
        ])->find($id);

        // cek jika user tidak ditemukan
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anggota dengan ID ' . $id . ' tidak ditemukan.'
            ], 404);
        };
        // response sukses 
        return response()->json([
        'status' => 'success',
        'data' => [
            'profile' => [
                'id' => $user->id,
                'full_name' => $user->name,
                'satker' => $user->satker,
                'role' => $user->role,
                'email' => $user->email,
                'username' => $user->username,
                'profile_picture' => $user->profile_picture
                    ? asset('storage/profiles/' . $user->profile_picture) // FIX slash
                    : null,
            ],
            'finance' => [
                'remaining_limit' => $user->limit ?? 0,
                'total_limit' => $user->limit_total ?? 0,
                'usage_percentage' => ($user->limit_total ?? 0) > 0
                    ? round((($user->limit_total - $user->limit) / $user->limit_total) * 100, 2)
                    : 0,
            ],
            'history' => [
                'recent_submissions' => $user->submission ?? [],
                'recent_activities'  => $user->activityLogs ?? [] // samakan
                ]
            ]
        ], 200);
    }

    public function update(Request $request, $id){
        $user = User::findOrFail($id);

        // validasi input
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'satker' => 'sometimes|string',
            'limit_total' => 'sometimes|numeric|min:0',
            'role' => 'sometimes|in:admin,operator,user',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        // logika update limit jika limit total diubah oleh admin
        if($request->has('limit_total')){
            // hitung selisih untuk memperbarui sisa limit saat ini
            $diff = $request->limit_total - $user->limit_total;
            $user->limit +=$diff;
        }

        // logika update foto profil 
        if($request->hasFile('profile_picture')){
            // hapus foto lama jika ada dan bukan file default
            if($user->profile_picture && Storage::exist('public/profile/'.$user->profile_picture)){
                Storage::delete('public/profiles/'.$user->profile_picture);
            }

            // simpan foto baru
            $file = $request-> file('profile_picture');
            $filename = time().'_'.$user->username.'_'.$file->getClientOriginalExtension();
            $file->storeAs('public/profiles',$filename);

            $user->profile_picture=$filename;
        }

    // update sisa data (kecuali password dan profile picture yang dihandle manual)
    $user->fill($request->except(['profile_picture', 'password','_method']));

    // jika ada update password
    if($request->filled('password')){
        $user->password = bcrypt($request->password);
    }
    $user->save();

    return response()->json([
        'status' => 'success',
        'message' => 'Data anggota berhasil diperbarui',
        'data' => $user
    ],200);

    }
}
