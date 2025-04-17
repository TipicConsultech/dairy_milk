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
        Schema::create('products_tracker', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('processed_id');
            $table->unsignedBigInteger('packaging_id')->comment('this is raw_materials table id');
            $table->double('product_qty');
            $table->string('milkUsed');
            $table->integer('batch_no');
            $table->integer('created_by')->nullable();
            $table->timestamp('updated_by')->nullable();
            $table->timestamps();
        });

        // Add the foreign key constraints after table creation
        if (Schema::hasTable('products') && Schema::hasTable('processed_ingredients') && Schema::hasTable('raw_materials')) {
            Schema::table('products_tracker', function (Blueprint $table) {
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('processed_id')->references('id')->on('processed_ingredients');
                $table->foreign('packaging_id')->references('id')->on('raw_materials');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_tracker');
    }
};
