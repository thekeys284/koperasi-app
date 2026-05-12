<?php

namespace App\Http\Controllers\Api;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\Api\UserResource;

class UserController extends Controller
{
    public function index(){
        $users = User::latest()->get();
        return UserResource::collection($users);
    }

    public function store (Request $request){

        // Validasi Input
        $validated = $request->validate([
             'name'             => 'required|string',
             'username'         => 'required|unique:users,username',
             'email'            => 'required|email|unique:users,email',
             'password'         => 'required|min:6',
             'satker'           => 'string',
             'role'             => 'required|in:admin,operator,user,pj_toko,pj_pinjaman,ketua', 
             'profile_picture'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        // Enkripsi password
        $validated['password'] = Hash::make($request->password);

        // upload foto
        if($request->hasFile('profile_picture')){
            $file = $request->file('profile_picture');
            $filename = time().'_'.$request->username.'.'.$file->getClientOriginalExtension();
            $file->storeAs('profiles', $filename, 'public');

            $validated['profile_picture'] = $filename;
        }

        $user = User::create($validated);

        return response()->json([
            'message' => 'User berhasil dibuat',
            'user' => $user
        ],201);
    }

    public function show($id){
        // $user = User::with([
        //     'submission' => fn($q) => $q->latest(),
        //     'activityLogs' => fn($q) => $q->latest()->limit(10)
        // ])->findOrFail($id); 
        // return new UserResource($user);
        try {
        // Pakai findOrFail supaya kalau ID gak ada, langsung 404 (bukan 500)
        $user = User::with(['submission', 'activityLogs'])->findOrFail($id);

        return new UserResource($user);
        } catch (\Exception $e) {
            // Ini bakal kasih tahu kamu error aslinya apa di log Laravel
            return response()->json([
                'message' => 'Terjadi kesalahan di server',
                'error' => $e->getMessage() 
            ], 500);
        }
    }

    public function update(Request $request, $id){
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'satker' => 'sometimes|string',
            'role' => 'sometimes|in:admin,operator,user,pj_toko,pj_pinjaman,ketua',
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if($request->hasFile('profile_picture')){
            if($user->profile_picture && Storage::exists('public/profiles/'.$user->profile_picture)){
                Storage::delete('public/profiles/'.$user->profile_picture);
            }
            $file = $request->file('profile_picture');
            $filename = time().'_'.$user->username.'.'.$file->getClientOriginalExtension();
            $file->storeAs('public/profiles', $filename);
            $user->profile_picture = $filename;
        }

        $user->fill($request->except(['profile_picture', 'password','_method']));

        if($request->filled('password')){
            $user->password = Hash::make($request->password);
        }

        $user->save();

        Cache::forget('user_role_' . $user->id);
        return response()->json([
            'status' => 'success',
            'message' => 'Data anggota berhasil diperbarui',
            'data' => $user
        ],200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // cek jika user tidak ditemukan
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User dengan ID ' . $id . ' tidak ditemukan.'
            ], 404);
        }

        // hapus foto profil jika ada
        if ($user->profile_picture && Storage::exists('public/profiles/' . $user->profile_picture)) {
            Storage::delete('public/profiles/' . $user->profile_picture);
        }

        // hapus user
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus'
        ], 200);
    }
}
