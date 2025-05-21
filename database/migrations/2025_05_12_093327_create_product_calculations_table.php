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
        Schema::create('product_calculations', function (Blueprint $table) {
            $table->id();
            $table->string('product_type'); // 'Paneer' or 'Tup'

            // Paneer fields
            $table->float('snf_value')->nullable();
            $table->float('ts_value')->nullable();
            $table->float('intake_value')->nullable();
            $table->float('panner_to_be_created')->nullable();
            $table->float('panner_created')->nullable();
            $table->float('alleviation_in_creation')->nullable();
            $table->float('created_panner_ts')->nullable();

            // Tup fields
            $table->float('milk_intake')->nullable();
            $table->float('cream_created')->nullable();
            $table->float('tup_created')->nullable();
            $table->string('tup_alleviation')->nullable();

            // Common fields
            $table->timestamps();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_calculations');
    }
};
