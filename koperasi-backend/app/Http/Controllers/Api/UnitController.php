<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Unit;
use App\Http\Resources\Api\UnitResource;

class UnitController extends Controller
{
    public function index()
    {
        $units=Unit::latest()->get();
        return UnitResource::collection($units);
    }


    public function store(Request $request)
    {
        $validated=$request->validate([
            'name'=>'required|string|unique:units,name',
        ]);
        $unit=Unit::create($validated);
        return response()->json([
            'message' => 'Unit berhasil dibuat',
            'unit' => $unit
        ],201);
    }


    public function show($id)
    {
        try {
        $unit = Unit::findOrFail($id);

        return new UnitResource($unit);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan di server',
                'error' => $e->getMessage() 
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $unit=Unit::findOrFail($id);
        $validated=$request->validate([
            'name'=>'required|string|unique:units,name,'.$id,
        ]);
        $unit->update($validated);
        return response()->json([
            'status' => 'success',
            'message' => 'Data Unit berhasil diperbarui',
            'data' => new  UnitResource($unit)
        ],200);
    }

    public function destroy($id)
    {
        $unit=Unit::findOrFail($id);
        if ($unit->products()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unit tidak dapat dihapus karena masih memiliki produk yang terkait.'
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Unit berhasil dihapus'
        ], 200);
    }
}
