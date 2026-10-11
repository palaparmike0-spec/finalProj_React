<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArtifactRequest;
use App\Http\Requests\UpdateArtifactRequest;
use App\Http\Resources\ArtifactResource;
use App\Models\Artifact;
use Illuminate\Http\Request;

class ArtifactController extends Controller
{
    public function index(Request $request)
    {
        $query = Artifact::with('exhibits');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // ?all=1 returns every artifact without pagination (for dropdowns and pickers)
        if ($request->boolean('all')) {
            return ArtifactResource::collection($query->orderBy('name')->get());
        }

        return ArtifactResource::collection($query->latest()->paginate(10));
    }

    public function store(StoreArtifactRequest $request)
    {
        $artifact = Artifact::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return (new ArtifactResource($artifact->load('exhibits')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Artifact $artifact)
    {
        return new ArtifactResource($artifact->load('exhibits'));
    }

    public function update(UpdateArtifactRequest $request, Artifact $artifact)
    {
        $artifact->update($request->validated());

        return new ArtifactResource($artifact->load('exhibits'));
    }

    public function destroy(Artifact $artifact)
    {
        $artifact->delete();

        return response()->noContent(); // 204
    }
}