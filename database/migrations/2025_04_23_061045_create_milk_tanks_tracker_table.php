<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('milk_tanks_tracker', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('milk_tank_id');
            $table->string('milk_tank_name')->nullable();
            $table->double('quantity')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            // Foreign key constraint
            $table->foreign('milk_tank_id')->references('id')->on('milk_tanks');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milk_tanks_tracker');
    }
};
