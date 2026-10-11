<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanRequestRequest;
use App\Http\Requests\UpdateLoanStatusRequest;
use App\Http\Resources\LoanRequestResource;
use App\Models\LoanRequest;
use Illuminate\Http\Request;

class LoanRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = LoanRequest::with(['artifact', 'user']);

        // Staff only see their own requests; admins see all
        if (! $request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return LoanRequestResource::collection($query->latest()->paginate(10));
    }

    public function store(StoreLoanRequestRequest $request)
    {
        $loan = LoanRequest::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return (new LoanRequestResource($loan->load(['artifact', 'user'])))
            ->response()
            ->setStatusCode(201);
    }

    public function updateStatus(UpdateLoanStatusRequest $request, LoanRequest $loanRequest)
    {
        // Allowed workflow: pending -> approved/rejected, approved -> returned
        $allowed = [
            'pending' => ['approved', 'rejected'],
            'approved' => ['returned'],
        ];

        $newStatus = $request->status;

        if (! in_array($newStatus, $allowed[$loanRequest->status] ?? [])) {
            return response()->json([
                'message' => "Cannot change a {$loanRequest->status} request to {$newStatus}.",
                'errors' => [
                    'status' => ["Cannot change a {$loanRequest->status} request to {$newStatus}."],
                ],
            ], 422);
        }

        $loanRequest->update($request->validated());

        return new LoanRequestResource($loanRequest->load(['artifact', 'user']));
    }
}