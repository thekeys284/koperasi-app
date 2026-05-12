<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UnitConversion;
use App\Http\Resources\Api\UnitConversionResource;

class UnitConversionController extends Controller
{
    public function index()
    {
        $unitconv=UnitConversion::latest()->get();
        return UnitConversionResource::collection($unitconv);
    }


    public function store(Request $request)
    {
        $validated=$request->validate([
            'product_id'=>'required|integer',
            'from_unit_id'=> 'required|integer',
            'to_unit_id'=>'required|integer',
            'multiplier'=>'required|integer'
        ]);
        $unitconv=UnitConversion::create($validated);
        return response()->json([
            'status' => 'success',
            'message' => 'Konversi unit berhasil dibuat',
            'data' => new UnitConversionResource($unitconv)
        ],201);
    }


    public function show($id)
    {
        try {
        $unitconv = UnitConversion::findOrFail($id);

        return new UnitConversionResource($unitconv);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan di server',
                'error' => $e->getMessage() 
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $unitconv=UnitConversion::findOrFail($id);
        $validated=$request->validate([
            'product_id'=>'required|integer',
            'from_unit_id'=> 'required|integer',
            'to_unit_id'=>'required|integer',
            'multiplier'=>'required|integer'
        ]);
        $unitconv->update($validated);
        return response()->json([
            'status' => 'success',
            'message' => 'Data Unit berhasil diperbarui',
            'data' => new  UnitConversionResource($unitconv)
        ],200);
    }

    public function destroy($id)
    {
        $unitconv=UnitConversion::findOrFail($id);
        
        $unitconv->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Konversi berhasil dihapus'
        ], 200);
    }
}
