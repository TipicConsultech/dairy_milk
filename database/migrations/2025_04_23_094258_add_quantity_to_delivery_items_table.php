<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('delivery_items', function (Blueprint $table) {
        $table->id();
        $table->integer('quantity');
        // Other columns here...
    });
    
   
}

public function down()
{
    Schema::table('delivery_items', function (Blueprint $table) {
        $table->dropColumn('quantity');
    });
}

};
