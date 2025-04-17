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
        Schema::create('milk_processing', function (Blueprint $table) {
            $table->id();
            $table->string('batch_no');
            $table->unsignedBigInteger('milkTank_id');
            $table->double('rowMilk_qty');
            $table->tinyInteger('isProductCreated');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
        });

        // Add the foreign key constraint after table creation
        if (Schema::hasTable('milk_tanks')) {
            Schema::table('milk_processing', function (Blueprint $table) {
                $table->foreign('milkTank_id')->references('id')->on('milk_tanks');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milk_processing');
    }
};
