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
    Schema::table('milk_tanks', function (Blueprint $table) {
        $table->string('localname')->nullable()->after('name');
    });
}

public function down()
{
    Schema::table('milk_tanks', function (Blueprint $table) {
        $table->dropColumn('localname');
    });
}
};
