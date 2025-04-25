<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('product_sizes', function (Blueprint $table) {
            $table->integer('default_qty')->default(0)->after('booked');
        });
    }

    public function down(): void
    {
        Schema::table('product_sizes', function (Blueprint $table) {
            $table->dropColumn('default_qty');
        });
    }
};
