<?php

use App\Http\Controllers\MilkTankController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\SubSubCategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\JarTrackerController;
use App\Http\Controllers\ExpenseTypeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FileUpload;
use App\Http\Controllers\CustomerController;
use App\Http\Middleware\Authorization;
use App\Http\Controllers\CompanyInfoController;
use App\Http\Controllers\DeliveryItemController;
use App\Http\Controllers\RawMaterialController;
use App\Http\Controllers\MilkProcesingController;
use App\Http\Controllers\ProcessedIngredientsController;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\ProductsTrackerController;

// Dairy 
// use App\Http\Controllers\MilkTankController;


// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

//-
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Milk Tank API Routes
Route::middleware('auth:sanctum')->group(function () {
    // Get all milk tanks
    Route::get('/milk-tanks', [MilkTankController::class, 'index']);

    // Create a new milk tank
    Route::post('/milk-tanks', [MilkTankController::class, 'store']);

    // Get a specific milk tank
    Route::get('/milk-tanks/{id}', [MilkTankController::class, 'show']);

    // Update a milk tank
    Route::put('/milk-tanks/{id}/laboratory-update', [MilkTankController::class, 'laboratoryUpdate']);
    // Route::put('/milk-tanks/{id}', [MilkTankController::class, 'update']);
    // Route::patch('/milk-tanks/{id}', [MilkTankController::class, 'update']);

    // Delete a milk tank
    Route::delete('/milk-tanks/{id}', [MilkTankController::class, 'destroy']);
});



Route::prefix('raw-materials')->group(function () {
    Route::get('/', [RawMaterialController::class, 'index']);
    Route::get('/visible', [RawMaterialController::class, 'visible']);
    Route::get('/company/{companyId}', [RawMaterialController::class, 'byCompany']);
    // Route::get('/{id}', [RawMaterialController::class, 'show']);
    Route::get('/showAll', [RawMaterialController::class, 'showAll']);
    Route::post('/store', [RawMaterialController::class, 'store']);
    Route::put('/{id}', [RawMaterialController::class, 'update']); 
    Route::post('/updateRawMaterial', [RawMaterialController::class, 'updateRawMaterial']);
    Route::delete('/{id}', [RawMaterialController::class, 'destroy']); 
    // Route::get('/criticalStock', [RawMaterialController::class, 'criticalStock']);
});
Route::get('/criticalStock', [RawMaterialController::class, 'criticalStock']);
Route::get('/csv-download', [RawMaterialController::class, 'downloadDemoCsv']);
Route::get('/serchRawMaterials', [RawMaterialController::class, 'searchByName']);
Route::post('/uploadCSVRawMaterial', [RawMaterialController::class, 'uploadCsvRawMaterial']);
Route::post('/uploadBulk', [RawMaterialController::class, 'bulkUpdate']);
//Private 
Route::post('/rawMaterialAdd', [RawMaterialController::class, 'store'])->middleware('auth:sanctum');


//public API's
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/mobileLogin', [AuthController::class, 'mobileLogin']);
//Secured API's

Route::get('productSizes/{id}', [ProductController::class,'showProductSize']);
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/changePassword', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/registerUser', [AuthController::class, 'registerUser']);
    Route::put('/appUsers', [AuthController::class, 'update']);
    Route::get('/appUsers', [AuthController::class, 'allUsers']);
    Route::resource('product', ProductController::class);

    Route::resource('expenseType', ExpenseTypeController::class);
    Route::resource('expense', ExpenseController::class);
    Route::resource('order', OrderController::class);
    Route::get('/reportSales', [OrderController::class, 'Sales']);
    Route::get('/googleMapData', [OrderController::class, 'googleMapData']);
    Route::get('/totalDeliveries', [OrderController::class, 'totalDeliverie']); 

    Route::post('/newStock', [ProductController::class, 'newStock'])->name('newStock');
    Route::get('/stock', [ProductController::class, 'stock'])->name('stock');
    Route::resource('category', CategoryController::class);
    Route::resource('subCategory', SubCategoryController::class);
    Route::resource('subSubCategory', SubSubCategoryController::class);
    Route::resource('customer', CustomerController::class);
    Route::get('/searchCustomer', [CustomerController::class, 'search']);
    
    Route::get('/customerHistory', [CustomerController::class, 'history']);

    Route::get('/customerBookings', [CustomerController::class, 'booking']);
    Route::get('/creditReport', [CustomerController::class, 'creditReport']);
    Route::resource('/jarTracker', JarTrackerController::class);
    Route::post('/product/updateQty', [ProductController::class, 'updateQty']);
    Route::post('/fileUpload', [FileUpload::class, 'fileUpload']);
    Route::get('/monthlyReport', [OrderController::class, 'getMonthlyReport']);
    Route::get('/customerReport', [OrderController::class, 'customerReport'])->name('customerReport');
    Route::resource('company', CompanyInfoController::class);

    //Roles
    Route::resource('roles', App\Http\Controllers\RoleController::class);

    // Dairy milk
    // milk_tank
    Route::post('/milk-tank', [MilkTankController::class, 'store']);
    Route::get('/milk-tanks-byname/names', [MilkTankController::class, 'getNames']);
    Route::post('/tankLimit', [MilkTankController::class, 'tankLimit']);
    Route::post('/updateMilk', [MilkTankController::class, 'updateMilk']);
    // product
    Route::get('/showAll', [ProductController::class, 'showAll']);
    Route::post('/updateProductStock', [ProductController::class, 'updateProductStock']);
    // milk processing
    Route::post('/milkProcessingStore', [MilkProcesingController::class, 'store']);
    //processded ingredients 
    Route::post('/ProcessedIngredients', [ProcessedIngredientsController::class, 'store']);
    //FinalProductInventory  
    Route::get('/finalProductInventory', [ProductsTrackerController::class, 'getFinalProductInventory']);  
    Route::get('/searchByProductNameFinalInventry', [ProductsTrackerController::class, 'searchByProductNameFinalInventry']);
});
Route::post('/createProduct', [CommonController::class,'createProduct']);



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




