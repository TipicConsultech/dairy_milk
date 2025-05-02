<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixProductsTrackerProcessedIdForeignKey extends Migration
{
    public function up()
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            // Drop the incorrect foreign key
            $table->dropForeign(['processed_id']);
        });

        Schema::table('products_tracker', function (Blueprint $table) {
            // Add the correct foreign key to milk_processing
            $table->foreign('processed_id')
                  ->references('id')
                  ->on('milk_processing')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('products_tracker', function (Blueprint $table) {
            // Revert back to referencing processed_ingredients
            $table->dropForeign(['processed_id']);
        });

        Schema::table('products_tracker', function (Blueprint $table) {
            $table->foreign('processed_id')
                  ->references('id')
                  ->on('processed_ingredients')
                  ->onDelete('cascade');
        });
    }
}
