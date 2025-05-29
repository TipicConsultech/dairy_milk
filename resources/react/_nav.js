import React from 'react'
import CIcon from '@coreui/icons-react'
// import { BsBack } from "react-icons/bs";
import {
  // cilBell,
  // cilCalculator,
  // cilChartPie,
  cilCursor,
  // cilDescription,
  cilNotes,
  cilChart,
  cilGroup,
  // cilStar,
  cibElasticStack,
  cilBookmark,
  cilUser,
  cilTruck,
  cilDollar,
  cilAddressBook,
  cilPrint,
  cilInbox,
  cilList,
  cilSpeedometer,
  cilLibraryAdd,
  cilTags,
  cilCart,
  cilPlus,
  cilShieldAlt,
  cilReportSlash,
  cilFile,
  cibPostgresql,
  cilStorage,
  cilCalculator,
  cilParagraph,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'
import { getUserData } from './util/session';

export default function fetchNavItems(t1){
  const userData = getUserData();
  const user = userData?.type;
  const t = t1;

  let _nav =[];
  const mode = userData?.company_info?.appMode ?? 'advance';



  if(user===0){
    _nav = [
      {
        component: CNavGroup,
        name: t("LABELS.company"),
        icon: <CIcon icon={cibElasticStack} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.new_company"),
            to: '/company/new',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_companies"),
            to: '/company/all',
          },
          {
            component: CNavItem,
            name: 'Company Subscription',
            to: '/company/companyReceipt',
          }

        ],

      },
      {
        component: CNavItem,
        name: t("LABELS.plans"),
        to: '/plans',
        icon: <CIcon icon={cibPostgresql} customClassName="nav-icon" />,
      },
        {
          component: CNavGroup,
          name: t("LABELS.user_management"),
          icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: t("LABELS.all_Users"),
              to: 'usermanagement/all-users',
            },
            {
              component: CNavItem,
              name: t("LABELS.create_user"),
              to: 'usermanagement/create-user',
            },
          ],
        },

      ]
  }
  else if(user===1){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.dashboard"),
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },

        {
        component: CNavItem,
        name: "Create Factory Product",
        to: '/CreateFactory',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },

      // {
      //   component: CNavItem,
      //   name: t('LABELS.dailyTallyReport'),
      //   to: '/dailyTallies',
      //   icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.report"),
      //   to: 'Reports/Reports',
      //   icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.credit_report"),
      //   to: 'Reports/creditReport',
      //   icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavItem,
      //   name: t("LABELS.customer_report"),
      //   to: 'Reports/Customer_Report',
      //   icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
      // },
      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t('LABELS.dailyTallyReport'),
            to: '/dailyTalliesReport',
            // icon: <CIcon icon={cilFile} customClassName="nav-icon ms-4" />,
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.p&lreport"),                                  //report
            to: 'Reports/Reports',
            // icon: <CIcon icon={cilChart} customClassName="nav-icon ms-4" />,
            className: 'ms-4'
          },
          {
            component: CNavItem,
            name: t("LABELS.credit_report"),
            to: 'Reports/crateReport',
            // icon: <CIcon icon={cilDollar} customClassName="nav-icon ms-4" />,
            className: 'ms-4'

          },
          {
            component: CNavItem,
            name: t("LABELS.customer_report"),
            to: 'Reports/Customer_Report',
            // icon: <CIcon icon={cilAddressBook} customClassName="nav-icon ms-4" />,
            className: 'ms-4'

          },
          {
            component: CNavItem,
            name: t("LABELS.creditreport"),
            to: 'Reports/creditreport',
            // icon: <CIcon icon={cilAddressBook} customClassName="nav-icon ms-4" />
            className: 'ms-4'

          },
        ],
      },

      {
        component: CNavGroup,
        name: t("LABELS.expense"),
        icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.new_expense"),
            to: '/expense/new',
            className: 'ms-4'

          },
          {
            component: CNavItem,
            name: t("LABELS.all_expense_types"),
            to: '/expense/all-type',
            className: 'ms-4'

          },
          {
            component: CNavItem,
            name: t("LABELS.expense_report"),
            to: '/expense/reportExpense',
            className: 'ms-4'

          },
        ],
      },

      // {
      //   component: CNavGroup,
      //   name: t("LABELS.invoice"),
      //   icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      //   items: [

      //     {
      //       component: CNavItem,
      //       name: "Factory Invoice(B2B)",
      //      to: '/factory-invoice',
      //     },
      //     {
      //       component: CNavItem,
      //       name: "Retails Invoice",
      //       to: '/invoice',
      //     },


      //   ],
      // },
      {
        component: CNavItem,
        name: t("LABELS.invoice"),
        to: '/invoice',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.ProductCreationCalculator"),
        to: '/ProductCreationCalculator',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
      },

      {
        component: CNavGroup,
        name: t("LABELS.create_Product"),
        icon: <CIcon icon={cilLibraryAdd} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: t("LABELS.create_factory_product"),
            to: '/CreateFactoryProduct',
             className: 'ms-4'
          },
          {
            component: CNavItem,
            name: t("LABELS.create_retail_product"),
            to: '/CreateRetailProduct',
             className: 'ms-4'
          },
        //   {
        //     component: CNavItem,
        //     name: t("LABELS.create_bulk_product"),
        //     to: '/CreateBulkProduct',
        //     className: 'ms-4'
        //   },


          // {
          //   component: CNavItem,
          //   name: t("LABELS.create_bulk_product"),
          //   to: '/CreateBulkProduct',
          // },


        ],
      },


      {
        component: CNavGroup,
        name: t("LABELS.inventory_management"),
        icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.rawMaterialinventory"),
            to: '/rawMaterial',

             className: 'ms-4'
          },

          {
            component: CNavItem,
            name: t("LABELS.finalproductinventry"),
            to: '/finalProductInvenrty',
             className: 'ms-4'
          },

          {
            component: CNavItem,
            name: t("LABELS.retailproductinventry"),
            to: '/retailProductInvenrty',

             className: 'ms-4'
          },

        ],
      },



      {
        component: CNavGroup,
        name: t("LABELS.products"),
        icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
        items: [
          // {
          //   component: CNavItem,
          //   name: t("LABELS.new_product"),
          //   to: '/products/new',
          //    className: 'ms-4'
          // },
          {
            component: CNavItem,
            name: t("LABELS.all_products"),
            to: '/products/all',
             className: 'ms-4'
          },
        ],
      },
      {
        component: CNavItem,
        name: t("LABELS.laboratoryUser"),
        to: '/LaboratoryUser',
        icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: t("LABELS.crate_deliver"),
        to: '/delivery',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      },

      {
        component: CNavGroup,
        name: t("LABELS.user_management"),
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.all_Users"),
            to: 'usermanagement/all-users',
             className: 'ms-4'
          },
          {
            component: CNavItem,
            name: t("LABELS.create_user"),
            to: 'usermanagement/create-user',
             className: 'ms-4'
          },
        ],
      },
    ];
}
  else if(user===2){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.dashboard"),
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.invoice"),
        to: '/invoice',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavGroup,
        name: t("LABELS.report"),
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t('LABELS.dailyTallyReport'),
            to: '/dailyTalliesReport',
            // icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.credit_report"),
            to: 'Reports/crateReport',
            // icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.customer_report"),
            to: 'Reports/Customer_Report',
            // icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.creditreport"),
            to: 'Reports/creditreport',
            // icon: <CIcon icon={cilAddressBook} customClassName="nav-icon ms-4" />
            className: 'ms-4'

          },
        ],
      },

      {
        component: CNavItem,
        name: t("LABELS.ProductCreationCalculator"),
        to: '/ProductCreationCalculator',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
      },


      // {
      //   component: CNavGroup,
      //   name: t("LABELS.invoice"),
      //   icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      //   items: [

      //     {
      //       component: CNavItem,
      //       name: "Factory Invoice(B2B)",
      //      to: '/factory-invoice',
      //     },
      //     {
      //       component: CNavItem,
      //       name: "Retails Invoice",
      //       to: '/invoice',
      //     },


      //   ],
      // },

      {
        component: CNavGroup,
        name: t("LABELS.create_Product"),
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: t("LABELS.create_factory_product"),
            to: '/CreateFactoryProduct',
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.create_retail_product"),
            to: '/CreateRetailProduct',
            className: 'ms-4',
          },


        ],
      },


      {
        component: CNavGroup,
        name: t("LABELS.inventory_management"),
        icon: <CIcon icon={cilStorage} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.rawMaterialinventory"),
            to: '/rawMaterial',

            className: 'ms-4',
          },

          {
            component: CNavItem,
            name: t("LABELS.finalproductinventry"),
            to: '/finalProductInvenrty',
            className: 'ms-4',
          },

          {
            component: CNavItem,
            name: t("LABELS.retailproductinventry"),
            to: '/retailProductInvenrty',

            className: 'ms-4',
          },

        ],
      },

      {
        component: CNavGroup,
        name: t("LABELS.products"),
        icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
        items: [
          // {
          //   component: CNavItem,
          //   name: t("LABELS.new_product"),
          //   to: '/products/new',
          // },
          {
            component: CNavItem,
            name: t("LABELS.all_products"),
            to: '/products/all',
            className: 'ms-4',
          },
        ],
      },
      {
        component: CNavItem,
        name: t("LABELS.laboratoryUser"),
        to: '/LaboratoryUser',
        icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: t("LABELS.crate_deliver"),
        to: '/delivery',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      },

      {
        component: CNavGroup,
        name: t("LABELS.expense"),
        icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: t("LABELS.new_expense"),
            to: '/expense/new',
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.all_expense_types"),
            to: '/expense/all-type',
            className: 'ms-4',
          },
          {
            component: CNavItem,
            name: t("LABELS.expense_report"),
            to: '/expense/reportExpense',
            className: 'ms-4',
          },
        ],
      },

    ];

  }else if(user===3){
    _nav = [
      {
        component: CNavGroup,
        name: t("LABELS.create_Product"),
        // to: '/CreateFactoryProduct',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: t("LABELS.create_factory_product"),
            to: '/CreateFactoryProduct',
            className: 'ms-4',

          },

          {
            component: CNavItem,
            name: t("LABELS.create_retail_product"),
            to: '/CreateRetailProduct',
            className: 'ms-4',

          },


        ],
      },

      {
        component: CNavItem,
        name: t("LABELS.dailyTallyReport"),
        to: '/dailyTalliesReport',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.ProductCreationCalculator"),
        to: '/ProductCreationCalculator',
        icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
      }

]

  }

  else if(user===4){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.crate_deliver"),
        to: '/delivery',
        icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: t("LABELS.credit_report"),
        to: 'Reports/crateReport',
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      }

]

  }

  else if(user===5){
    _nav = [
      {
        component: CNavItem,
        name: t("LABELS.laboratoryUser"),
        to: '/LaboratoryUser',
        icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
      },
]

  }

  return _nav;
}
