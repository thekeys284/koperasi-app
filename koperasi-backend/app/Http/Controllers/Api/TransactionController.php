<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sale;
use App\Models\StockBatch;
use App\Http\Resources\Api\TransactionResource;
use Exception;


class TransactionController extends Controller
{
    public function index(){
        $sales = Sale::with([
                'cashier:id,name', 
                'member:id,name',
                'paymentMethod:id,name',
                'items.product:id,name,barcode'])
                ->orderBy('id', 'desc')
                ->get();
        return response()->json([
            'status' => 'success',
            'data' => TransactionResource::collection($sales)
        ],200);
    }

    public function show($id){
        $sale = Sale::with([
                'cashier:id,name', 
                'member:id,name',
                'paymentMethod:id,name',
                'items.product:id,name,barcode',
                'items.unit:id,name'
            ])->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => new TransactionResource($sale)
        ],200);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'total_discount' => 'required|numeric|min:0',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'transaction_date' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty_input' => 'required|integer|min:1',
            'items.*.unit_id' => 'nullable|exists:units,id',
            'items.*.selling_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function() use ($validated) {
            $sale = Sale::create([
                'invoice_number' => 'INV-' . date('YmdHis'),
                'user_id' => $validated['user_id'],
                'cashier_id' => auth()->id() ?? 1,
                'total_bill' => 0, // Will be updated later
                'total_discount' => $validated['total_discount'] ?? 0,
                'payment_method_id' => $validated['payment_method_id'],
                'payment_status' => 'unpaid',
                'transaction_date' => $validated['transaction_date'] ?? now()
            ]);
            
            $totalBill = 0;
            
            foreach ($validated['items'] as $item) {
                $qtyNeeded = $item['qty_input'];
                $batches = StockBatch::where('product_id', $item['product_id'])
                            ->where('remaining_qty', '>', 0)
                            ->orderByRaw('expiry_date IS NULL ASC')
                            ->orderBy('expiry_date', 'asc')
                            ->orderBy('received_at', 'asc')
                            ->get();
                foreach ($batches as $batch) { 
                    if ($qtyNeeded <= 0) break;
                    // qty yang bisa diambil dari batch ini
                    $take = min($qtyNeeded, $batch->remaining_qty);
                    // potong sisa batch yang barusan ditentukan 
                    $batch->decrement('remaining_qty', $take);

                    $subtotal = $take * $item['selling_price'];
                    $totalBill += $subtotal;
                    
                    // Hitung nilai profit kotor
                    $costOfGoods = $take * $batch->purchase_price;
                    $calculatedProfit = $subtotal - $costOfGoods;

                    // simpan ke sale_item
                    $sale->items()->create([
                        'product_id' => $item['product_id'],
                        'batch_id' => $batch->id,
                        'qty_input' => $take,
                        'unit_id' => $item['unit_id'] ?? 1,
                        'qty_in_base_unit' => $take,
                        'normal_price' => $item['selling_price'],
                        'discount_amount' => 0,
                        'final_price' => $subtotal,
                        'hpp_at_sale' => $batch->purchase_price,
                        'item_profit' => $calculatedProfit
                    ]);
                    $qtyNeeded -= $take;
                }

                // Pengaman jika kasir memasukkan jumlah melebihi total stok gudang
                if ($qtyNeeded > 0) {
                    throw new \Exception("Stok barang dengan ID " . $item['product_id'] . " tidak mencukupi!");
                }
            }
            $grandTotal = max(0, $totalBill - ($validated['total_discount'] ?? 0));
            $sale->update(['total_bill' => $grandTotal]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Transaksi kasir berhasil disimpan!',
                'invoice' => $sale->invoice_number
            ], 201);
        });
    }

    public function update(Request $request, $id){
        $validatedData = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'payment_status' => 'nullable|in:paid,unpaid',
            'total_discount' => 'nullable|numeric|min:0',
            'transaction_date' => 'nullable|date',
            'items' => 'nullable|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.qty_input' => 'nullable|integer|min:1',
            'items.*.unit_id' => 'nullable|exists:units,id',
            'items.*.selling_price' => 'nullable|numeric|min:0'
        ]);

        $sale = Sale::with(['items'])->findOrFail($id);
        $userRole = auth()->user()->role ?? 'operator';

        if ($sale->payment_status === 'paid' && $userRole !== 'admin'){
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi yang sudah lunas hanya bisa diubah oleh Admin'
            ], 403);
        }

        // mengembalikan data barang ke batch stock
        return DB::transaction(function() use ($validatedData, $sale) {
            // Mengembalikan sisa stock 
            foreach ($sale->items as $oldItem) {
                StockBatch::where('id', $oldItem->batch_id)
                ->increment('remaining_qty', $oldItem->qty_input);
            }
            // hapus rincian barang lama di tabel sale_items
            $sale->items()->delete();
            $sale->update([
                'user_id' => $request->user_id ?? $sale->user_id,
                'payment_method_id' => $validatedData['payment_method_id'] ?? $sale->payment_method_id,
                'payment_status' => $validatedData['payment_status'] ?? $sale->payment_status,
                'total_discount' => $validatedData['total_discount'] ?? $sale->total_discount ?? 0,
                'transaction_date' => $validatedData['transaction_date'] ?? $sale->transaction_date,
                'total_bill' => 0
            ]);

            $totalBill = 0;
            foreach ($validatedData['items'] as $item) {
                $qtyNeeded = $item['qty_input'];
                // menggunakan urutan ganda FEFO makanan dan FIFO non makanan
                $batches = StockBatch::where('product_id', $item['product_id'])
                            ->where('remaining_qty', '>', 0)
                            ->orderByRaw('expiry_date IS NULL ASC')
                            ->orderBy('expiry_date', 'asc')
                            ->orderBy('received_at', 'asc')
                            ->get();
                foreach($batches as $batch) {
                    if ($qtyNeeded <= 0) break;
                    $take = min($qtyNeeded, $batch->remaining_qty);
                    // potong stok baru
                    $batch->decrement('remaining_qty', $take);
                    $subtotal = $take * $item['selling_price'];
                    $totalBill += $subtotal;

                    $costOfGoods = $take * $batch->purchase_price;
                    $calculatedProfit = $subtotal - $costOfGoods;
                    
                    // tulis rincian baru di sale_items
                    $sale->items()->create([
                        'product_id' => $item['product_id'],
                        'batch_id' => $batch->id,
                        'qty_input' => $take,
                        'unit_id' => $item['unit_id'] ?? 1,
                        'qty_in_base_unit' => $take,
                        'normal_price' => $item['selling_price'],
                        'discount_amount' => 0,
                        'final_price' => $subtotal,
                        'item_profit' => $calculatedProfit,
                        'hpp_at_sale' => $batch->purchase_price
                    ]);

                    $qtyNeeded -= $take;
                }
                if ($qtyNeeded > 0) {
                    throw new \Exception("Stock barang dengan ID " . $item['product_id'] . " tidak mencukupi setelah kalkulasi ulang");
                }
            }

            // update total bill
            $grandTotal = max(0, $totalBill - ($validatedData['total_discount'] ?? 0));
            $sale->update(['total_bill' => $grandTotal]);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil diperbarui dan stok telah disesuaikan',
                'invoice'=>$sale->invoice_number
            ], 200);
        });
    }

    public function destroy($id){
        $sale = Sale::with(['items'])->findOrFail($id);
        // role operator?
        $userRole = auth()->user()->role ?? 'operator';
        if ($sale->payment_status === 'paid' && userRole !== 'admin'){
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi yang sudah lunas hanya bisa dihapus oleh Admin' 
            ], 403);
        }

        return DB::transaction(function() use ($sale) {
            foreach ($sale->items as $item){
                StockBatch::where('id', $item->batch_id)
                ->increment('remaining_qty', $item->qty_input);

            }
            
            $sale->items()->delete();
            $sale->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dihapus dan seluruh stok telah dikembalikan ke batch semula'
            ], 200);
        });
    }
}
