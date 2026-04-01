<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ActivityLogHelper;
use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SubmissionController extends Controller
{
    /**
     * Store a newly created submission in storage.
     * POST /api/submissions
     */
    public function store(Request $request)
    {
        try {
            // Get authenticated user (Normal) or Test User (via user_id field or default ID 1)
            $user = auth()->user() ?: User::find($request->user_id ?: 5);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan. Pastikan ada user di database atau kirim user_id yang valid.'
                ], 401);
            }

            // Validate input
            $validated = $request->validate([
                'type' => 'required|in:Konsumtif,Produktif',
                'amount_requested' => 'required|numeric|min:10000',
                'tenor_months' => 'required|in:3,6,12',
                'start_date' => 'required|date_format:Y-m',
                'reason' => 'nullable|string|max:500',
                'document' => 'nullable|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max for konsumtif
            ]);

            // Check if user has limit
            // if ($user->limit <= 0) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Anda tidak memiliki limit pinjaman yang tersedia'
            //     ], 422);
            // }

            // // Check if requested amount exceeds limit
            // if ($validated['amount_requested'] > $user->limit) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Jumlah pinjaman melebihi limit yang tersedia (Limit: Rp ' . number_format($user->limit, 0, ',', '.') . ')'
            //     ], 422);
            // }

            // Check if user has pending submissions
            // $pendingSubmission = Submission::where('user_id', $user->id)
            //     ->whereIn('final_status', ['WAITING', 'ON_PROGRESS'])
            //     ->first();

            // if ($pendingSubmission) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Anda masih memiliki pengajuan yang sedang diproses. Tunggu sampai selesai sebelum mengajukan lagi.'
            //     ], 422);
            // }

            // Prepare submission data
            $submissionData = [
                'user_id' => $user->id,
                'type' => $validated['type'],
                'amount_requested' => $validated['amount_requested'],
                'tenor_months' => $validated['tenor_months'],
                'start_date' => $validated['start_date'] . '-01', // Convert YYYY-MM to YYYY-MM-01
                'reason' => $validated['reason'] ?? null,
                'pj_status' => 'PENDING',
                'chairman_status' => 'PENDING',
                'final_status' => 'WAITING',
            ];

            // Handle file upload for konsumtif
            if ($validated['type'] === 'Konsumtif' && $request->hasFile('document')) {
                $file = $request->file('document');
                $path = $file->store('submissions', 'public');
                $submissionData['document_path'] = $path;
            }

            // Create submission
            $submission = Submission::create($submissionData);

            // Log activity (use try-catch untuk handle jika helper error)
            try {
                ActivityLogHelper::create(
                    $user->id,
                    'Pengajuan Pinjaman Baru',
                    "Pengajuan pinjaman {$submission->type} sebesar Rp " . number_format($submission->amount_requested, 0, ',', '.') . " dengan tenor {$submission->tenor_months} bulan"
                );
            } catch (\Exception $e) {
                // Log activity gagal, tapi jangan hentikan proses
                \Log::warning('Activity log failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan pinjaman berhasil dikirim. Silakan tunggu verifikasi dari pihak koperasi.',
                'data' => [
                    'id' => $submission->id,
                    'submission_number' => 'SUB-' . str_pad($submission->id, 5, '0', STR_PAD_LEFT),
                    'status' => $submission->final_status,
                    'created_at' => $submission->created_at
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Submission error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display user's submissions.
     * GET /api/submissions
     */
    public function index(Request $request)
    {
        try {
            // Get user from auth or request for testing
            $user = auth()->user() ?: User::find($request->user_id ?: 1);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan.'
                ], 404);
            }

            $submissions = Submission::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'submission_number' => 'SUB-' . str_pad($submission->id, 5, '0', STR_PAD_LEFT),
                        'type' => $submission->type,
                        'amount_requested' => (float) $submission->amount_requested,
                        'tenor_months' => $submission->tenor_months,
                        'start_date' => $submission->start_date,
                        'reason' => $submission->reason,
                        'pj_status' => $submission->pj_status,
                        'chairman_status' => $submission->chairman_status,
                        'final_status' => $submission->final_status,
                        'created_at' => $submission->created_at,
                        'updated_at' => $submission->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $submissions
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display submission details.
     * GET /api/submissions/{id}
     */
    public function show($id)
    {
        try {
            // Get user from auth or request for testing
            $user = auth()->user() ?: User::find(request('user_id') ?: 1);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan.'
                ], 404);
            }

            $submission = Submission::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$submission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pengajuan pinjaman tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $submission->id,
                    'submission_number' => 'SUB-' . str_pad($submission->id, 5, '0', STR_PAD_LEFT),
                    'type' => $submission->type,
                    'amount_requested' => (float) $submission->amount_requested,
                    'tenor_months' => $submission->tenor_months,
                    'start_date' => $submission->start_date,
                    'reason' => $submission->reason,
                    'document_path' => $submission->document_path,
                    'pj_status' => $submission->pj_status,
                    'pj_note' => $submission->pj_note,
                    'chairman_status' => $submission->chairman_status,
                    'chairman_note' => $submission->chairman_note,
                    'final_status' => $submission->final_status,
                    'created_at' => $submission->created_at,
                    'updated_at' => $submission->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}

