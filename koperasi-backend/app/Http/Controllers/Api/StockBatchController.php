<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StockBatch;
use App\Http\Resources\Api\StockBatchResource;


class StockBatchController extends Controller
{
    public function index(){
        $stockbatches = StockBatch::with(['product', 'receivedUnit'])
                        ->latest('received_at')
                        ->get();
        return StockBatchResource::collection($stockbatches);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'received_unit_id' => 'required|exists:units,id',       
            'received_qty_in_unit' => 'required|integer|min:1',
            'multiplier_used' => 'required|integer',
            'purchase_price' => 'required|numeric|min:0',
            'initial_qty' => 'required|integer|min:1',
            'remaining_qty' => 'required|integer|min:1',
            'expiry_date' => 'nullable|date',
            'received_at' => 'required|date'
        ]);

        $stockbatch = StockBatch::create($validated);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Stock Batch berhasil dibuat',
            'data' => $stockbatch
        ], 201);
    }

    public function show($id){
        $stockbatches = StockBatch::findOrFail($id);
        return new StockBatchResource($stockbatches);
    }

    public function update(Request $request, $id){
        $stockbatches = StockBatch::findOrFail($id);
        $validated=$request->validate([
            'product_id' => 'required|exists:products,id',
            'received_unit_id' => 'required|exists:units,id',       
            'received_qty_in_unit' => 'required|integer|min:1',
            'multiplier_used' => 'required|integer',
            'purchase_price' => 'required|numeric|min:0',
            'initial_qty' => 'required|integer|min:1',
            'remaining_qty' => 'required|integer|min:1',
            'expiry_date' => 'nullable|date',
            'received_at' => 'required|date'
        ]);

        $stockbatches->update($validated);
        return response()->json([
            'status'=>'success',
            'message'=>'Stock Batches berhasil diperbarui',
            'data'=>$stockbatches
        ],200);
    }

    public function destroy($id){
        try {
            $stockbatches=StockBatch::findOrFail($id);
            $stockbatches->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Stock telah berhasil dihapus',
                'data' => null
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak dapat dihapus karena mungkin masih terkait dengan transaksi penjualan.',
                'data' => null
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus data stock: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
