<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Resources\Api\CategoryResource;

class CategoryController extends Controller
{
    public function index()
    {
        $categories=Category::latest()->get();
        return CategoryResource::collection($categories);
    }


    public function store(Request $request)
    {
        $validated=$request->validate([
            'name'=>'required|string|unique:categories,name',
            'description'=>'nullable|string'
        ]);
        $category=Category::create($validated);
        return response()->json([
            'message' => 'Kategori berhasil dibuat',
            'category' => $category
        ],201);
    }


    public function show($id)
    {
        try {
        $category = Category::findOrFail($id);

        return new CategoryResource($category);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan di server',
                'error' => $e->getMessage() 
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $category=Category::findOrFail($id);
        $validated=$request->validate([
            'name'=>'required|string|unique:categories,name,'.$id,
            'description'=>'nullable|string'
        ]);
        $category->update($validated);
        return response()->json([
            'status' => 'success',
            'message' => 'Data Category berhasil diperbarui',
            'data' => new  CategoryResource($category)
        ],200);
    }

    public function destroy($id)
    {
        $category=Category::findOrFail($id);
        if ($category->products()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki produk yang terkait.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category berhasil dihapus'
        ], 200);
    }
}
