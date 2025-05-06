<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            // Drop the incorrect foreign key constraint
            $table->dropForeign('products_tracker_factory_product_id_foreign');

            // Add the correct foreign key on 'product_size_id' referencing 'product_sizes'
            $table->foreign('product_size_id')
                ->references('id')
                ->on('product_sizes')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            // Drop the new foreign key
            $table->dropForeign(['product_size_id']);

            // Re-add the original (now removed) foreign key constraint on 'factory_product_id'
            $table->foreign('factory_product_id')
                ->references('id')
                ->on('factory_products')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }
};
