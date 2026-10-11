<?php

namespace App\Http\Controllers;

use App\Models\Artifact;
use App\Models\Exhibit;
use App\Models\LoanRequest;

class DashboardController extends Controller
{
    public function __invoke()
    {
        return response()->json([
            'total_artifacts' => Artifact::count(),
            'total_exhibits' => Exhibit::count(),
            'pending_loans' => LoanRequest::where('status', 'pending')->count(),
        ]);
    }
}