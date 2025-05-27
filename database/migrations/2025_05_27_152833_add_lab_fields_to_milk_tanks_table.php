<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('milk_tanks', function (Blueprint $table) {
            $table->decimal('avg_degree', 8, 2)->nullable()->after('quantity');
            $table->decimal('avg_fat', 8, 2)->nullable()->after('avg_degree');
            $table->decimal('avg_rate', 8, 2)->nullable()->after('avg_fat');
            $table->decimal('total_amount', 10, 2)->nullable()->after('avg_rate');
        });
    }

    public function down(): void
    {
        Schema::table('milk_tanks', function (Blueprint $table) {
            $table->dropColumn(['avg_degree', 'avg_fat', 'avg_rate', 'total_amount']);
        });
    }
};
