<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('delivery_items', function (Blueprint $table) {
            // Ensure 'company_id' column exists and is of correct type
            if (!Schema::hasColumn('delivery_items', 'company_id')) {
                $table->unsignedBigInteger('company_id')->after('id');
            }

            // Add 'quantity' column if not present
            if (!Schema::hasColumn('delivery_items', 'quantity')) {
                $table->integer('quantity')->after('company_id');
            }

            // Add foreign key (will error if already exists, handle in try/catch or assume clean run)
          
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_items', function (Blueprint $table) {
            $table->dropForeign(['company_id']);

            if (Schema::hasColumn('delivery_items', 'quantity')) {
                $table->dropColumn('quantity');
            }

            if (Schema::hasColumn('delivery_items', 'company_id')) {
                $table->dropColumn('company_id');
            }
        });
    }
};
