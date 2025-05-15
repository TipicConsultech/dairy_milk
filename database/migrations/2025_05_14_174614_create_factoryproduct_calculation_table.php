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
        Schema::create('factory_product_calculation', function (Blueprint $table) {
            $table->unsignedBigInteger('factory_product_id');
            $table->foreign('factory_product_id')
                ->references('id')->on('product_sizes')
                ->onDelete('cascade');
            $table->double('liters');
            $table->double('divide_by');

           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factoryproduct_calculation');
    }
};
