import React from 'react'
import { getUserType } from './util/session'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//NewRegister
const NewUsers = React.lazy(() => import('./views/pages/register/NewUsers'))
const AllUser = React.lazy(() => import('./views/pages/register/AllUser'))

//Invoice
const Delivery = React.lazy(() => import('./views/pages/invoice/Delivery'))
const Invoice = React.lazy(() => import('./views/pages/invoice/Invoice'))
const FactoryInvoice = React.lazy(() => import('./views/pages/invoice/FactoryInvoice'))
const Booking = React.lazy(() => import('./views/pages/invoice/Booking'))
const Orders = React.lazy(() => import('./views/pages/invoice/Orders'))
const InvoiceDetails = React.lazy(() => import('./views/pages/invoice/InvoiceDetails'))
const NewCompany = React.lazy(() => import('./views/pages/company/NewCompany'))
const AllCompanies = React.lazy(() => import('./views/pages/company/AllCompanies'))
const EditCompany = React.lazy(() => import('./views/pages/company/EditCompany'))

//Raw MAterial
const RawMaterial = React.lazy(() => import('./views/dairy/RawMaterial'))
//Retail Product
const CreateRetailProduct = React.lazy(() => import('./views/dairy/createRetailProduct'))
const CreateBulkProduct = React.lazy(() => import('./views/dairy/CreateBulkProduct'))

//Products
const NewProduct = React.lazy(() => import('./views/pages/products/NewProduct'))
const AllProducts = React.lazy(() => import('./views/pages/products/AllProducts'))
const EditProduct = React.lazy(() => import('./views/pages/products/EditProduct'))


//Customers
const NewCustomer = React.lazy(() => import('./views/pages/customer/NewCustomer'))
const AllCustomers = React.lazy(() => import('./views/pages/customer/AllCustomers'))
const EditCustomer = React.lazy(() => import('./views/pages/customer/EditCustomer'))
const CompanyReceipts = React.lazy(() => import('./views/pages/company/CompanyReceipt'))


//Expense
const AllExpenseType = React.lazy(() => import('./views/pages/expense/AllExpenseType'))
const EditExpenseType = React.lazy(() => import('./views/pages/expense/EditExpenseType'))
const NewExpenseType = React.lazy(() => import('./views/pages/expense/NewExpenseType'))
const NewExpense = React.lazy(() => import('./views/pages/expense/NewExpense'))
const expense = React.lazy(() => import('./views/pages/expense/ExpenseReport'))

//Reports
const ExpenseReport = React.lazy(() => import('./views/pages/report/ExpenseReport'))
const CreditReport = React.lazy(() => import('./views/pages/report/CreditReport'))
const CustomerReport = React.lazy(() => import('./views/pages/report/CustomerReport'))
const SalesReport = React.lazy(() => import('./views/pages/report/SalesReport'))
const PnLReport = React.lazy(() => import('./views/pages/report/PnLReport'))
const All_Reports=React.lazy(() => import('./views/pages/report/AllReports'))
const creditreport2=React.lazy(() => import('./views/pages/report/creditreport2'))

//Password Newpassword
const Resetpassword = React.lazy(() => import('./views/pages/Password/Newpassword'))
const Updatepassword = React.lazy(() => import('./views/pages/Password/updatePassword'))

// map
const JarMap = React.lazy(() => import('./views/pages/map/Map'))

const Plans = React.lazy(() => import('./views/pages/plans/Plans'))
// const Charts = React.lazy(() => import('./views/charts/Charts'))

// const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const CreateProduct=React.lazy(() => import('./views/dairy/CreateProduct'))
const StockManagement=React.lazy(() => import('./views/dairy/StockManagement'))
const ProcessedMilk=React.lazy(() => import('./views/dairy/ProcessedMilk'))
const MilkProcessing=React.lazy(() => import('./views/dairy/MilkProcsssing'))
const DairyFarmInventory=React.lazy(() => import('./views/dairy/DairyFarmInventory'))
const DeliveryRecord=React.lazy(() => import('./views/dairy/DeliveryRecord'))
const DailyTallies=React.lazy(() => import('./views/dairy/DailyTallies'))

const LaboratoryUser=React.lazy(() => import('./views/dairy/LaboratoryUser'))
const FinalProductInvenrty = React.lazy(()=>import('./views/dairy/FinalProductInvenrty'))
const RetailProductInvenrty = React.lazy(()=>import('./views/dairy/RetailProductInventory'))
const ProductCreationCalculator = React.lazy(()=>import('./views/dairy/ProductCreationCalculator'))

export default function fetchRoutes(){
  const user=getUserType();
  let routes=[];


  if(user===0){
    routes = [
      { path: '/', exact: true, name: 'Home' },

      { path: '/booking', name: 'Booking', element: Booking },
      { path: '/newCustomer', name: 'New Customer', element: Delivery },
      { path: '/company/new', name: 'New Company', element: NewCompany },
      { path: '/company/edit/:companyId', name: 'Edit Company', element: EditCompany },
      { path: '/company/all', name: 'All Companies', element: AllCompanies },
      { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
      { path: '/bookings', name: 'Advance Bookings', element: Orders },
      { path: '/regular', name: 'Regular Orders', element: Orders },
      { path: '/order', name: 'All Orders', element: Orders },
      { path: '/products/new', name: 'New Product', element: NewProduct },
      { path: '/products/all', name: 'All Products', element: AllProducts },
      { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },
      { path: '/customer/new', name: 'New Product', element: NewCustomer },
      { path: '/customer/all', name: 'All Products', element: AllCustomers },
      { path: '/customer/edit/:id', name: 'Edit Products', element: EditCustomer },
      { path: '/rawMaterial', name: 'Raw Material', element: RawMaterial },
      // { path: '/category/all', name: 'All Category', element: AllCategory },
      // { path: '/category/edit/:id', name: 'Edit Category', element: EditCategory },
      { path: '/expense/new-type', name: 'New Type', element: NewExpenseType },
      { path: '/expense/edit-type/:id', name: 'Edit Type', element: EditExpenseType },
      { path: '/expense/all-type', name: 'All Types', element: AllExpenseType },
      { path: '/expense/new', name: 'New Expense', element: NewExpense },
      { path: '/Reports/Customer_Report', name: 'Customer Report', element: CustomerReport },
      { path: '/Reports/Expense_Report', name: 'Expense Report', element: ExpenseReport },
      { path: '/Reports/crateReport', name: 'Credit Report', element: CreditReport },
      { path: 'Reports/Sales_Report', name: 'Sales Report', element: SalesReport },
      { path: 'Reports/pnl_Report', name: 'Profit and Loss Report', element: PnLReport },
      { path: '/Reports/Reports', name: 'Reports', element: All_Reports },
      // { path: 'products/updateqty', name: 'Update Bulk Quantity', element: BulkQuantity },
      { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
      { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },
      { path:'/usermanagement/create-user', name: 'Create User', element: NewUsers },
      { path:'usermanagement/all-users', name: 'All Users', element: AllUser },
      { path:'plans', name: 'Plans', element: Plans },
      { path: '/company/companyReceipt', name: 'Company Receipt', element: CompanyReceipts },


      // { path: '/map', name: 'Map', element: JarMap },
    ]
  }
  else if(user===1){
    routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/delivery', name: 'Delivery', element: Delivery },
    { path: '/invoice', name: 'invoice', element: Invoice },
    { path: '/factory-invoice', name: 'FactoryInvoice', element: FactoryInvoice },
    { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
    { path: '/bookings', name: 'Advance Bookings', element: Orders },
    { path: '/regular', name: 'Regular Orders', element: Orders },
    { path: '/order', name: 'All Orders', element: Orders },
    { path: '/customer/new', name: 'New Product', element: NewCustomer },
    { path: '/customer/all', name: 'All Products', element: AllCustomers },
    { path: '/customer/edit/:id', name: 'Edit Customer', element: EditCustomer },
    { path: '/products/new', name: 'New Product', element: NewProduct },
    { path: '/products/all', name: 'All Products', element: AllProducts },
    { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },
    { path: '/expense/new-type', name: 'New Type', element: NewExpenseType },
    { path: '/expense/edit-type/:id', name: 'Edit Type', element: EditExpenseType },
    { path: '/expense/all-type', name: 'All Types', element: AllExpenseType },
    { path: '/expense/reportExpense', name: 'Expense Report', element: expense },
    { path: '/expense/new', name: 'New Expense', element: NewExpense },
    { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
    { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },

    // { path: '/map', name: 'Map', element: JarMap },
    { path: '/Reports/Customer_Report', name: 'Customer Report', element: CustomerReport },
    { path: '/Reports/crateReport', name: 'Credit Report', element: CreditReport },
    { path: '/Reports/Expense_Report', name: 'Expense Report', element: ExpenseReport },
    { path: 'Reports/Sales_Report', name: 'Sales Report', element: SalesReport },
    { path: 'Reports/pnl_Report', name: 'Profit and Loss Report', element: PnLReport },
    { path: '/Reports/Reports', name: 'Reports', element: All_Reports },
    { path:'/usermanagement/create-user', name: 'Create User', element: NewUsers },
    { path:'usermanagement/all-users', name: 'All Users', element: AllUser },
    { path:'/CreateRetailProduct', name: 'Create Retail Product', element: CreateRetailProduct },
    { path:'/CreateBulkProduct', name: 'Create Bulk Product', element: CreateBulkProduct },
      { path: '/CreateFactoryProduct', name: 'CreateProduct', element:CreateProduct },
      { path: '/StockManagement', name: 'StockManagement', element:StockManagement },
      { path: '/ProcessedMilk', name: 'ProcessedMilk', element:ProcessedMilk },
      { path: '/MilkProcessing', name: 'MilkProcessing', element:MilkProcessing },
      { path: '/DairyFarmInventory', name: 'DairyFarmInventory', element:DairyFarmInventory } ,
      { path: '/dailyTalliesReport', name: 'Daily Tallies', element:DailyTallies } ,
      { path: '/Reports/creditreport', name: 'Credit Report', element:creditreport2 } ,



      //RawMaterial
      { path: '/rawMaterial', name: 'Raw Material', element: RawMaterial },
      { path: '/LaboratoryUser', name: 'LaboratoryUser', element:LaboratoryUser },
      { path: '/DeliveryRecord', name: 'DeliveryRecord', element:DeliveryRecord},
      { path: '/finalProductInvenrty', name: 'FinalProductInvenrty', element:FinalProductInvenrty},
      { path: '/retailProductInvenrty', name: 'RetailProductInvenrty', element:RetailProductInvenrty},
      { path: '/ProductCreationCalculator', name: 'ProductCreationCalculator', element:ProductCreationCalculator},

  ]
  }
  //Manager
  else if(user===2){
    routes = [
    { path: '/', exact: true, name: 'Home' },
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/delivery', name: 'Delivery', element: Delivery },
    { path: '/invoice', name: 'invoice', element: Invoice },
    { path: '/factory-invoice', name: 'FactoryInvoice', element: FactoryInvoice },
    { path: '/booking', name: 'Booking', element: Booking },
    { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },

    { path: '/customer/new', name: 'New Product', element: NewCustomer },
    { path: '/customer/all', name: 'All Products', element: AllCustomers },
    { path: '/customer/edit/:id', name: 'Edit Customer', element: EditCustomer },
    { path: '/products/new', name: 'New Product', element: NewProduct },
    { path: '/products/all', name: 'All Products', element: AllProducts },
    { path: '/products/edit/:id', name: 'Edit Products', element: EditProduct },
    { path: '/expense/new-type', name: 'New Type', element: NewExpenseType },
    { path: '/expense/edit-type/:id', name: 'Edit Type', element: EditExpenseType },
    { path: '/expense/all-type', name: 'All Types', element: AllExpenseType },
    { path: '/expense/reportExpense', name: 'Expense Report', element: expense },
    { path: '/expense/new', name: 'New Expense', element: NewExpense },
    { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
    { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },
    { path: '/Reports/crateReport', name: 'Credit Report', element: CreditReport },
    { path: '/dailyTalliesReport', name: 'Daily Tallies', element:DailyTallies } ,

    { path:'/CreateRetailProduct', name: 'Create Retail Product', element: CreateRetailProduct },
    { path:'/CreateBulkProduct', name: 'Create Bulk Product', element: CreateBulkProduct },

    { path:'/usermanagement/create-user', name: 'Create User', element: NewUsers },
    { path:'usermanagement/all-users', name: 'All Users', element: AllUser },

      { path: '/CreateFactoryProduct', name: 'CreateProduct', element:CreateProduct },
      // { path: '/CreateFactoryProduct', name: 'CreateProduct', element:CreateProduct },
      { path: '/StockManagement', name: 'StockManagement', element:StockManagement },
      { path: '/ProcessedMilk', name: 'ProcessedMilk', element:ProcessedMilk },
      { path: '/MilkProcessing', name: 'MilkProcessing', element:MilkProcessing },
      { path: '/DairyFarmInventory', name: 'DairyFarmInventory', element:DairyFarmInventory } ,

      //RawMaterial
      { path: '/rawMaterial', name: 'Raw Material', element: RawMaterial },
      { path: '/LaboratoryUser', name: 'LaboratoryUser', element:LaboratoryUser },
      { path: '/DeliveryRecord', name: 'DeliveryRecord', element:DeliveryRecord},
      { path: '/finalProductInvenrty', name: 'FinalProductInvenrty', element:FinalProductInvenrty},
      { path: '/retailProductInvenrty', name: 'RetailProductInvenrty', element:RetailProductInvenrty},
      { path: '/ProductCreationCalculator', name: 'ProductCreationCalculator', element:ProductCreationCalculator},



  ]
  }
  //Product Engineer
  else if(user===3){
    routes = [
    // { path: '/CreateProduct', name: 'CreateProduct', element:CreateProduct },
    { path: '/CreateFactoryProduct', name: 'CreateProduct', element:CreateProduct },
    // { path: '/finalProductInvenrty', name: 'FinalProductInvenrty', element:FinalProductInvenrty},
    // { path: '/retailProductInvenrty', name: 'RetailProductInvenrty', element:RetailProductInvenrty},
    { path: '/invoice', name: 'invoice', element: Invoice },
    { path: '/factory-invoice', name: 'FactoryInvoice', element: FactoryInvoice },
    { path: '/invoice-details/:id', name: 'InvoiceDetails', element: InvoiceDetails },
    { path:'/CreateRetailProduct', name: 'Create Retail Product', element: CreateRetailProduct },
    { path:'/CreateBulkProduct', name: 'Create Bulk Product', element: CreateBulkProduct },
    { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
    { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },
    { path: '/dailyTalliesReport', name: 'Daily Tallies', element:DailyTallies } ,
    { path: '/ProductCreationCalculator', name: 'ProductCreationCalculator', element:ProductCreationCalculator},
  ]
  }
  //Delivery Team
  else if(user===4){
    routes = [
    { path: '/delivery', name: 'Delivery', element: Delivery },
    { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
    { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },

    { path: '/Reports/crateReport', name: 'Credit Report', element: CreditReport },
  ]
  }
  //Lab Technician
  else if(user===5){
    routes = [

      { path: '/LaboratoryUser', name: 'LaboratoryUser', element:LaboratoryUser },
      { path:'/resetPassword', name: 'Update Password', element: Resetpassword },
      { path: '/updatepassword', name: 'Reset Password', element: Updatepassword },


  ]
  }
  return routes;
}

