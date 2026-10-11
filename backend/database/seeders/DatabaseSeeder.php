<?php

namespace Database\Seeders;

use App\Models\Artifact;
use App\Models\Exhibit;
use App\Models\LoanRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Maria Santos',
            'email' => 'admin@museum.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $staff = User::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'staff@museum.test',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        $items = [
            ['Hand-woven Banig Mat', 'Textile', 'Good', 'Tubigon, Bohol'],
            ['Spanish-era Church Bell', 'Religious', 'Fair', 'Loay, Bohol'],
            ['Antique Clay Burial Jar', 'Ceramics', 'Excellent', 'Anda, Bohol'],
            ['Bolo Knife with Carved Handle', 'Tools', 'Good', 'Tubigon, Bohol'],
            ['Wooden Fishing Boat Model', 'Maritime', 'Good', 'Tubigon, Bohol'],
            ['Vintage Barong Tagalog', 'Textile', 'Fair', 'Manila'],
            ['Carved Santo Nino Statue', 'Religious', 'Good', 'Cebu'],
            ['Pre-war Photograph of Tubigon Pier', 'Photographs', 'Fair', 'Tubigon, Bohol'],
            ['Brass Gong (Kulintang)', 'Musical Instruments', 'Excellent', 'Mindanao'],
            ['Terracotta Water Pot (Palayok)', 'Ceramics', 'Good', 'Dimiao, Bohol'],
            ['Rattan Fish Trap (Bubo)', 'Tools', 'Good', 'Tubigon, Bohol'],
            ['Handwritten Parish Record, 1895', 'Documents', 'Poor', 'Tubigon, Bohol'],
            ['Capiz Shell Window Panel', 'Architecture', 'Good', 'Loboc, Bohol'],
            ['Antique Coconut Grater', 'Tools', 'Fair', 'Baclayon, Bohol'],
            ['Hand-loomed Abaca Cloth', 'Textile', 'Excellent', 'Bohol'],
            ['Spanish Colonial Coin Collection', 'Currency', 'Good', 'Cebu'],
            ['Wooden Church Pew, 1880s', 'Religious', 'Fair', 'Tubigon, Bohol'],
            ['Ceramic Trade Plate, Ming Dynasty', 'Ceramics', 'Fair', 'Bohol'],
            ['Bamboo Flute (Tulali)', 'Musical Instruments', 'Good', 'Bohol'],
            ['World War II Era Radio', 'Historical Objects', 'Poor', 'Tubigon, Bohol'],
            ['Salt-making Wooden Tray', 'Tools', 'Good', 'Tubigon, Bohol'],
            ['Embroidered Pina Cloth Handkerchief', 'Textile', 'Excellent', 'Aklan'],
        ];

        $artifacts = collect($items)->map(fn ($i) => Artifact::create([
            'name' => $i[0],
            'category' => $i[1],
            'condition' => $i[2],
            'origin' => $i[3],
            'description' => "A preserved {$i[1]} item from {$i[3]}, part of the museum's permanent collection.",
            'acquisition_date' => now()->subDays(rand(200, 4000))->toDateString(),
            'created_by' => $admin->id,
        ]));

        $exhibits = collect([
            ['Heritage of the Sea', 'Gallery A', '-30 days', '+60 days'],
            ['Faith and Devotion', 'Gallery B', '-60 days', '+30 days'],
            ['Crafts of Our Ancestors', 'Gallery C', '-10 days', '+90 days'],
            ['Tubigon Through Time', 'Main Hall', '-90 days', null],
            ['Sounds of Bohol', 'Gallery D', '+15 days', '+120 days'],
        ])->map(fn ($e) => Exhibit::create([
            'title' => $e[0],
            'description' => "A curated exhibit: {$e[0]}.",
            'location' => $e[1],
            'start_date' => now()->modify($e[2])->toDateString(),
            'end_date' => $e[3] ? now()->modify($e[3])->toDateString() : null,
        ]));

        foreach ($exhibits as $exhibit) {
            $exhibit->artifacts()->attach(
                $artifacts->random(rand(4, 7))->pluck('id')->all()
            );
        }

        $purposes = [
            'Display for Tubigon Heritage Week',
            'School educational exhibit',
            'Provincial museum partnership loan',
            'Photography documentation project',
            'Municipal cultural festival display',
            'Restoration assessment by a conservator',
        ];
        $statuses = ['pending', 'pending', 'pending', 'approved', 'rejected', 'returned'];

        foreach ($purposes as $i => $purpose) {
            LoanRequest::create([
                'artifact_id' => $artifacts->random()->id,
                'user_id' => $staff->id,
                'purpose' => $purpose,
                'date_needed' => now()->addDays(10 + $i)->toDateString(),
                'return_date' => now()->addDays(25 + $i)->toDateString(),
                'status' => $statuses[$i],
                'admin_remarks' => in_array($statuses[$i], ['approved', 'rejected', 'returned'])
                    ? 'Reviewed by the museum administrator.'
                    : null,
            ]);
        }
    }
}