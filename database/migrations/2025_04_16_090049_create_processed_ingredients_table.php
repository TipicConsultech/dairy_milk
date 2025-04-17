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
        Schema::create('processed_ingredients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('processing_id');
            $table->unsignedBigInteger('ingredient_id')->comment('this is raw_materials table id');
            $table->double('quantity');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
        });

        // Add the foreign key constraints after table creation
        if (Schema::hasTable('milk_processing') && Schema::hasTable('raw_materials')) {
            Schema::table('processed_ingredients', function (Blueprint $table) {
                $table->foreign('processing_id')->references('id')->on('milk_processing');
                $table->foreign('ingredient_id')->references('id')->on('raw_materials');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processed_ingredients');
    }
};
