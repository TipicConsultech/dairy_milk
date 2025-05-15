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
    Schema::table('expense_types', function (Blueprint $table) {
        $table->string('expense_category')->nullable()->after('slug'); // or 'after' any other column you prefer
    });
}

public function down(): void
{
    Schema::table('expense_types', function (Blueprint $table) {
        $table->dropColumn('expense_category');
    });
}

};
