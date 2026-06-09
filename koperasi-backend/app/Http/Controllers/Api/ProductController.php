<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Unit;
use App\Models\UnitConversion;
use App\Models\Category;
use App\Http\Resources\Api\ProductResource;


class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'unit', 'unitConversion'])->latest()->get();
        return ProductResource::collection($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'unit_id'=> 'required|exists:units,id',
            'barcode' => 'required|unique:products,barcode',
            'name' => 'required|string|max:150',
            'detail' => 'nullable|string|max:150',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'is_active' => 'nullable|boolean'
        ]);

        if (isset($validated['price'])) {
            $validated['current_selling_price'] = $validated['price'];
            unset($validated['price']);
        }

        $product = Product::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dibuat',
            'data' => $product
        ], 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'unit', 'unitConversion'])->findOrFail($id);
        return new ProductResource($product);
    }
    
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'unit_id'=> 'required|exists:units,id',
            'barcode' => 'required|unique:products,barcode,' . $id,
            'name' => 'required|string|max:150',
            'detail' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'is_active' => 'nullable|boolean'
        ]);

        if (isset($validated['price'])) {
            $validated['current_selling_price'] = $validated['price'];
            unset($validated['price']);
        }

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil diperbarui',
            'data' => $product
        ], 200);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if (!$product) {
            return response()->json([
                'status' => 'error',
                'message' => 'Produk tidak ditemukan',
                'data' => null
            ], 404);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dihapus',
            'data' => null
        ], 200);
    }
}
