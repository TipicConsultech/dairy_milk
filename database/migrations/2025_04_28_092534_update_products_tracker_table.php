<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateProductsTrackerTable extends Migration
{
    public function up()
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            $table->renameColumn('product_id', 'factory_product_id');
            $table->string('batch_no')->change();
            $table->boolean('isProcessed')->default(false)->after('batch_no');
        });
    }

    public function down()
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            $table->renameColumn('factory_product_id', 'product_id');
            $table->dropColumn('isProcessed');
            // Revert batch_no back to integer (if it was integer originally)
            $table->integer('batch_no')->change();
        });
    }
}
