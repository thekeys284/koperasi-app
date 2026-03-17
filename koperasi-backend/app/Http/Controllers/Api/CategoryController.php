<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories=Category::select('id','category_name')->get();
        return response()->json([
            'status'=> 'success',
            'data'=>$categories
        ],200);
    }


    public function store(Request $request)
    {
        $validated=$request->validate([
            'category_name'=>'required|string|unique:categories, category_name'
        ]);
        $category=Category::create($validated);
        return response()->json([
            'status'=>'success',
            'data'=>$category,
            'message'=>"Kategori berhasil dibuat"
        ],201);
    }


    public function show($id)
    {
        $category=Category::findOrFail($id);
        return response()->json([
            'status'=>'success',
            'data'=>$category
        ],200);
    }


    public function update(Request $request, $id)
    {
        $category=Category::findOrFail($id);
        $validated=$request->validate([
            'category_name'=>'required|string|unique:categories, category_name,'.$id
        ]);
        $category->update($validated);
        return response()->json([
            'status'=>'success',
            'data'=>$category,
            'message'=>'Kategori berhasil diperbarui'
        ],200);
    }

    public function destroy($id)
    {
        $category=Category::findOrFail($id);
        if($category->products()->count()>0){
            return response()->json([
                'status'=>error,
                'message'=>'Kategori tidak bisa dihapus karena masih memiliki produk.'
            ],422);
        }
        $category->delete();
        return response()->json([
            'status'=>'success',    
            'message'=>'Kategori berhasil dihapus'
        ],200);
    }
}
