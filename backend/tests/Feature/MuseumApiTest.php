<?php

namespace Tests\Feature;

use App\Models\Artifact;
use App\Models\LoanRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MuseumApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::create([
            'name' => ucfirst($role) . ' User',
            'email' => $role . '@example.test',
            'password' => bcrypt('password'),
            'role' => $role,
        ]);
    }

    private function makeArtifact(User $creator): Artifact
    {
        return Artifact::create([
            'name' => 'Hand-woven Banig Mat',
            'category' => 'Textile',
            'condition' => 'Good',
            'created_by' => $creator->id,
        ]);
    }

    public function test_login_returns_a_token(): void
    {
        $this->makeUser('admin');

        $this->postJson('/api/login', [
            'email' => 'admin@example.test',
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_with_wrong_password_fails_with_422(): void
    {
        $this->makeUser('admin');

        $this->postJson('/api/login', [
            'email' => 'admin@example.test',
            'password' => 'wrong',
        ])->assertStatus(422);
    }

    public function test_protected_route_requires_a_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_staff_cannot_open_admin_routes(): void
    {
        Sanctum::actingAs($this->makeUser('staff'));

        $this->getJson('/api/users')->assertForbidden();
    }

    public function test_admin_can_open_admin_routes(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->getJson('/api/users')->assertOk();
    }

    public function test_admin_can_create_an_artifact(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/artifacts', [
            'name' => 'Spanish-era Church Bell',
            'category' => 'Religious',
            'condition' => 'Fair',
        ])->assertCreated();

        $this->assertDatabaseHas('artifacts', ['name' => 'Spanish-era Church Bell']);
    }

    public function test_creating_an_artifact_validates_input(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));

        $this->postJson('/api/artifacts', ['name' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'category', 'condition']);
    }

    public function test_staff_cannot_create_an_artifact(): void
    {
        Sanctum::actingAs($this->makeUser('staff'));

        $this->postJson('/api/artifacts', [
            'name' => 'Test',
            'category' => 'Tools',
            'condition' => 'Good',
        ])->assertForbidden();
    }

    public function test_staff_can_submit_a_loan_request_as_pending(): void
    {
        $admin = $this->makeUser('admin');
        $artifact = $this->makeArtifact($admin);
        Sanctum::actingAs($this->makeUser('staff'));

        $this->postJson('/api/loan-requests', [
            'artifact_id' => $artifact->id,
            'purpose' => 'Display for Tubigon Heritage Week',
            'date_needed' => now()->addDays(5)->toDateString(),
            'return_date' => now()->addDays(20)->toDateString(),
        ])->assertCreated()->assertJsonPath('data.status', 'pending');
    }

    public function test_admin_can_approve_once_but_not_twice(): void
    {
        $admin = $this->makeUser('admin');
        $staff = $this->makeUser('staff');
        $artifact = $this->makeArtifact($admin);

        $loan = LoanRequest::create([
            'artifact_id' => $artifact->id,
            'user_id' => $staff->id,
            'purpose' => 'School educational exhibit',
            'date_needed' => now()->addDays(5)->toDateString(),
            'return_date' => now()->addDays(20)->toDateString(),
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin);

        $this->patchJson("/api/loan-requests/{$loan->id}/status", ['status' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->patchJson("/api/loan-requests/{$loan->id}/status", ['status' => 'approved'])
            ->assertStatus(422);
    }

    public function test_dashboard_returns_the_summary_counts(): void
    {
        $admin = $this->makeUser('admin');
        $this->makeArtifact($admin);
        Sanctum::actingAs($admin);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJson(['total_artifacts' => 1, 'total_exhibits' => 0, 'pending_loans' => 0]);
    }
}