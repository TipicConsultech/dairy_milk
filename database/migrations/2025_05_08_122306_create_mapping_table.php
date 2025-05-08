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
        Schema::create('product_mappings', function (Blueprint $table) {
            $table->id();
           
            $table->unsignedBigInteger('factory_productSize_id'); // Foreign key for factory product (from product_sizes)
            $table->unsignedBigInteger('retail_productSize_id'); // Foreign key for retail product (from product_sizes)

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('retail_productSize_id')
                ->references('id')->on('product_sizes') // Linking to the products table (retail product)
                ->onDelete('cascade');

            $table->foreign('factory_productSize_id')
                ->references('id')->on('product_sizes') // Linking to the products table (factory product)
                ->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_mappings');
    }
};
