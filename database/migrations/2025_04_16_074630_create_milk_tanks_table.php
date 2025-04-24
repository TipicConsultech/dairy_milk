<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('milk_tanks', function (Blueprint $table) {
            $table->id();
            $table->integer('company_id');
            $table->integer('number');
            $table->string('name');
            $table->integer('capacity');
            $table->double('quantity');
            $table->tinyInteger('isVisible');
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();

            // Foreign key reference to company_info table
            $table->foreign('company_id')->references('company_id')->on('company_info');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('milk_tanks');
    }
};
