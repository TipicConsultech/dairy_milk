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
        Schema::create('daily_tallies', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
            $table->date('tally_date');
            $table->string('product_type'); // 'retail' or 'factory'
            $table->unsignedBigInteger('product_id');
            $table->string('product_name');
            $table->string('product_local_name')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->string('unit');
            $table->string('batch_no')->nullable();
            $table->timestamps();
            
            // Index for faster date-based queries
            $table->index('tally_date');
            $table->index(['company_id', 'tally_date']);
            $table->index(['product_type', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_tallies');
    }
};