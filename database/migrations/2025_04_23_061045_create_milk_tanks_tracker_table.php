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
            $table->double('opening_balance')->default(0);
            $table->double('added_quantity')->default(0); // ✅ default value
            $table->double('updated_quantity')->default(0); // ✅ default value
            $table->double('snf')->nullable();
            $table->double('ts')->nullable(); 
            $table->integer('updated_by')->nullable();
            $table->timestamps();
        
            $table->foreign('milk_tank_id')->references('id')->on('milk_tanks')->onDelete('cascade');
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
