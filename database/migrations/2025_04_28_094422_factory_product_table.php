<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void{
    Schema::create('factory_products', function (Blueprint $table) {
        $table->id();
        $table->integer('company_id');
        $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
        $table->string('name');
        $table->string('local_name');
        $table->boolean('is_visible')->default(true);
        $table->double('quantity');
        $table->enum('unit',['kg','gm','ltr','ml']);
        $table->double('capacity');
        $table->double('price');
        $table->unsignedBigInteger('created_by')->nullable();
        $table->unsignedBigInteger('updated_by')->nullable();
        $table->timestamps();
    });
}

/**
 * Reverse the migrations.
 */
public function down(): void
{
    Schema::dropIfExists('factory_products');
}
};
