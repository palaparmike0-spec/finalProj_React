<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExhibitRequest;
use App\Http\Requests\UpdateExhibitRequest;
use App\Http\Resources\ExhibitResource;
use App\Models\Exhibit;
use Illuminate\Http\Request;

class ExhibitController extends Controller
{
    public function index(Request $request)
    {
        $query = Exhibit::with('artifacts');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return ExhibitResource::collection($query->latest()->paginate(10));
    }

    public function store(StoreExhibitRequest $request)
    {
        $exhibit = Exhibit::create($request->safe()->except('artifact_ids'));
        $exhibit->artifacts()->sync($request->input('artifact_ids', []));

        return (new ExhibitResource($exhibit->load('artifacts')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Exhibit $exhibit)
    {
        return new ExhibitResource($exhibit->load('artifacts'));
    }

    public function update(UpdateExhibitRequest $request, Exhibit $exhibit)
    {
        $exhibit->update($request->safe()->except('artifact_ids'));

        if ($request->has('artifact_ids')) {
            $exhibit->artifacts()->sync($request->input('artifact_ids', []));
        }

        return new ExhibitResource($exhibit->load('artifacts'));
    }

    public function destroy(Exhibit $exhibit)
    {
        $exhibit->delete();

        return response()->noContent(); // 204
    }
}