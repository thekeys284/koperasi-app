<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $date = $this->transaction_date;
        if ($date && !$date instanceof Carbon) {
            $date = Carbon::parse($date);
        }
        return[
            'id'=>$this->id,
            'invoice_number' => $this->invoice_number,
            'total_bill' => (float) $this->total_bill,
            'total_discount' => (float) $this->total_discount,
            'payment_status' => $this->payment_status,
            'transaction_date'=> $date ? $date->format('d-m-Y H:i') : null,

            // Relasi 1: Metode Pembayaran
            'payment-method' => $this->payment_method ? [
                'id' => $this->payment_method->id,
                'name' => $this->payment_method->name,
            ] : null,

            // Relasi 2: Kasir
            'cashier' => $this->cashier ? [
                'id' => $this->cashier->id,
                'name' => $this->cashier->name,
            ] : null,

            // Relasi 3: Member
            'member' => $this->member ? [
                'id' => $this->member->id,
                'name' => $this->member->name,
            ] : null,

            // Relasi 4: Item Transaksi
            'items' => $this->relationLoaded('items') ? $this->items->map(function($item){
                return [
                    'id' => $item->id,
                    'qty_input' => (int) $item->qty_input,
                    'qty_in_base_unit' => (int) $item->qty_in_base_unit,
                    'normal_price' => (float) $item->normal_price,
                    'discount_amount' => (float) $item->discount_amount,
                    'final_price' => (float) $item->final_price,
                    'hpp_at_sale' => (float) $item->hpp_at_sale,
                    'item_profit' => (float) $item->item_profit,
                    'unit_id' => $item->unit_id,
                    'unit_name' => $item->unit ? $item->unit->name : 'Pcs',
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'barcode' => $item->product->barcode,
                    ] : null,   
                ];
            }) : [],
        ];
    }
}
