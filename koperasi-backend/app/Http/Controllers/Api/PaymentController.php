<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethods;
use App\Http\Resources\Api\PaymentMethodsResource;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = PaymentMethods::all();
        return PaymentMethodsResource::collection($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $payment = PaymentMethods::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Metode pembayaran berhasil dibuat',
            'data' => $payment
        ], 201);
    }

    public function show($id)
    {
        $payment = PaymentMethods::findOrFail($id);
        return new PaymentMethodsResource($payment);
    }
    
    public function update(Request $request, $id)
    {
        $payment = PaymentMethods::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $payment->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Metode pembayaran berhasil diperbarui',
            'data' => $payment
        ], 200);
    }

    public function destroy($id)
    {
        $payment = PaymentMethods::findOrFail($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Metode pembayaran tidak ditemukan',
                'data' => null
            ], 404);
        }

        $payment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Metode pembayaran berhasil dihapus',
            'data' => null
        ], 200);
    }
}
