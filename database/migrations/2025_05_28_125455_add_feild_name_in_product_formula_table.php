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
        Schema::table('product_formulas', function (Blueprint $table) {
           $table->string('formula_name')->nullable()->after('step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_formulas', function (Blueprint $table) {
            $table->dropColumn(['formula_name']);
        });
    }
};
