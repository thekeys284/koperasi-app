<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceLog;
use App\Models\Product; 
use App\Http\Resources\Api\PriceLogResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PriceLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 💡 FIXED: Menggunakan query paginate secara bersih dan konsisten
        $priceLogs = PriceLog::with(['product', 'user'])
            ->orderBy('changed_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10); 

        return PriceLogResource::collection($priceLogs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'old_price' => 'required|numeric|min:0',
            'new_price' => 'required|numeric|min:0',
            'change_type' => 'required|in:SELLING_PRICE,PURCHASE_PRICE',
            'reason' => 'nullable|string|max:255',
            'changed_at' => 'nullable|date',
        ]);

        $priceLog = PriceLog::create([
            'product_id' => $validated['product_id'],
            'user_id' => Auth::id(), 
            'old_price' => $validated['old_price'],
            'new_price' => $validated['new_price'],
            'change_type' => $validated['change_type'],
            'reason' => $validated['reason'] ?? null,
            'changed_at' => $validated['changed_at'] ?? now(),
        ]);

        if ($priceLog->change_type === 'SELLING_PRICE') {
            $product = Product::find($priceLog->product_id);
            if ($product && $product->current_selling_price != $priceLog->new_price) {
                $product->update(['current_selling_price' => $priceLog->new_price]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Price log created successfully',
            'data' => new PriceLogResource($priceLog->load(['product', 'user']))
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $priceLog = PriceLog::with(['product', 'user'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new PriceLogResource($priceLog)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $priceLog = PriceLog::findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'sometimes|required|exists:products,id',
            'old_price' => 'sometimes|required|numeric|min:0',
            'new_price' => 'sometimes|required|numeric|min:0',
            'change_type' => 'sometimes|required|in:SELLING_PRICE,PURCHASE_PRICE',
            'reason' => 'nullable|string|max:255',
            'changed_at' => 'nullable|date',
        ]);

        $priceLog->update($validated);

        if ($priceLog->change_type === 'SELLING_PRICE') {
            $latestSellingPriceLog = PriceLog::where('product_id', $priceLog->product_id)
                ->where('change_type', 'SELLING_PRICE')
                ->orderBy('changed_at', 'desc')
                ->orderBy('id', 'desc') 
                ->first();

            if ($latestSellingPriceLog && $latestSellingPriceLog->id === $priceLog->id) {
                $product = Product::find($priceLog->product_id);
                if ($product && $product->current_selling_price != $priceLog->new_price) {
                    $product->update(['current_selling_price' => $priceLog->new_price]);
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Price log updated successfully',
            'data' => new PriceLogResource($priceLog->load(['product', 'user']))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $priceLog = PriceLog::findOrFail($id);
        $priceLog->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Price log deleted successfully'
        ]);
    }
}