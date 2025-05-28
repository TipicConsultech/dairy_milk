<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_formulas', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->foreign('company_id')->references('company_id')->on('company_info')->onDelete('cascade');
             $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')->on('product_sizes')->onDelete('cascade');
            $table->unsignedInteger('step');
            $table->text('formula');
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('product_formulas');
    }
};

