<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users (assuming users already exist)
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Skipping member seeding.');
            return;
        }

        // Get departments
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->info('No departments found. Skipping member seeding.');
            return;
        }

        // Create members for the first few users
        $usersToAssign = $users->take(min(5, $users->count()));

        foreach ($usersToAssign as $index => $user) {
            // Assign to departments in rotation
            $department = $departments[$index % $departments->count()];

            Member::create([
                'user_id' => $user->id,
                'instance_id' => null, // Can be set if instances exist
                'department_id' => $department->id,
                'is_active' => true,
                'max_concurrent_chats' => [5, 7, 10][array_rand([5, 7, 10])],
            ]);
        }

        $this->command->info("Created {$usersToAssign->count()} members.");
    }
}
