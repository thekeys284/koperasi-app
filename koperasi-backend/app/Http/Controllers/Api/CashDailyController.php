<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashDailyController extends Controller
{
    public function members()
    {
        return response()->json(['data' => User::where('role', 'user')->select('id', 'name', 'username')->orderBy('name')->get()]);
    }

    private function sessionFor(string $date) {
        return DB::table('cash_daily_sessions')->where('cash_date', $date)->first();
    }
    public function show(Request $request) {
        $date = $request->validate(['date' => 'nullable|date'])['date'] ?? now()->toDateString();
        $session = $this->sessionFor($date);
        if (!$session) {
            $previous = DB::table('cash_daily_sessions')->where('cash_date', '<', $date)->orderByDesc('cash_date')->first();
            $opening = (float) ($previous->actual_closing_balance ?? $previous->opening_balance ?? 0);
            $id = DB::table('cash_daily_sessions')->insertGetId(['cash_date' => $date, 'opening_balance' => $opening, 'opened_by' => auth()->id(), 'created_at' => now(), 'updated_at' => now()]);
            $session = DB::table('cash_daily_sessions')->find($id);
        }
        $entries = DB::table('cash_daily_entries')->where('cash_daily_session_id', $session->id)->orderByDesc('id')->get();
        $cashSales = Sale::whereDate('transaction_date', $date)->whereHas('paymentMethod', fn ($q) => $q->whereRaw('LOWER(name) IN (?, ?)', ['cash', 'tunai']))->sum('total_bill');
        $manualIn = $entries->sum('cash_in'); $manualOut = $entries->sum('cash_out');
        $opening = (float) ($session->actual_opening_balance ?? $session->opening_balance);
        return response()->json(['data' => ['session' => $session, 'entries' => $entries, 'cash_sales' => (float) $cashSales, 'expected_balance' => $opening + $cashSales + $manualIn - $manualOut]]);
    }
    public function update(Request $request, $id) {
        $data = $request->validate(['actual_opening_balance' => 'nullable|numeric|min:0', 'actual_closing_balance' => 'nullable|numeric|min:0', 'opening_note' => 'nullable|string|max:500', 'closing_note' => 'nullable|string|max:500']);
        if (array_key_exists('actual_closing_balance', $data)) { $data['closed_by'] = auth()->id(); }
        DB::table('cash_daily_sessions')->where('id', $id)->update([...$data, 'updated_at' => now()]);
        return response()->json(['message' => 'Kas harian diperbarui.']);
    }
    public function withdrawal(Request $request, $id) {
        $data = $request->validate(['user_id' => 'nullable|integer|exists:users,id', 'amount' => 'required|numeric|min:1', 'service_fee' => 'required|numeric|min:0', 'description' => 'nullable|string|max:500']);
        DB::transaction(function () use ($data, $id) {
            DB::table('cash_daily_entries')->insert(['cash_daily_session_id' => $id, 'type' => 'withdrawal', 'description' => $data['description'] ?: 'Penarikan uang anggota', 'cash_out' => $data['amount'], 'cash_in' => 0, 'user_id' => $data['user_id'] ?? null, 'created_by' => auth()->id(), 'created_at' => now(), 'updated_at' => now()]);
            if ($data['service_fee'] > 0) DB::table('cash_daily_entries')->insert(['cash_daily_session_id' => $id, 'type' => 'service_fee', 'description' => 'Jasa penarikan uang', 'cash_in' => $data['service_fee'], 'cash_out' => 0, 'user_id' => $data['user_id'] ?? null, 'created_by' => auth()->id(), 'created_at' => now(), 'updated_at' => now()]);
        });
        return response()->json(['message' => 'Penarikan dan jasa berhasil dicatat.'], 201);
    }
}
