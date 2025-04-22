import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CProgress,
  CContainer,
  CRow,
  CCol,
  CProgressBar
} from "@coreui/react";
import { useTranslation } from 'react-i18next';

function CreateProduct() {
  const [milkForProduct, setMilkForProduct] = useState("");
  const [product, setProduct] = useState("");
  const [productQty, setProductQty] = useState("");
  const [productGram, setProductGram] = useState("");
  const [productList, setProductList] = useState([]);
  const { t, i18n } = useTranslation("global");
  const lng = i18n.language;

  // Dynamic Tank and Processed Milk Data
  const tankCapacity = 400; // Example total tank capacity
  const processedMilk = 200; // Example processed milk
  const processorName = "Ramesh Patil"; // Dummy processor name

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const currentDate = formatDate(new Date()); // Formats as "08/Apr/2025"

  // Calculate fill percentage for tank visualization
  const calculateFillPercentage = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  // Color palette with more distinct colors - copied from code 1
  const colorPalette = {
    primary: '#2E3A87', // Dark blue
    secondary: '#6C5B7B', // Purple
    success: '#2ECC71', // Green
    info: '#3498DB', // Blue
    warning: '#F39C12', // Orange
    danger: '#E74C3C', // Red
    light: '#F8F9FA',
    dark: '#343A40',
    background: '#F5F7FA',
    cardBg: '#FFFFFF',
    textPrimary: '#2C3E50',
    textSecondary: '#7F8C8D',
    titleBackground: '#E6E9F5', // Light blue/lavender background like in the image
    teal: '#20c997', // Teal color for one of the new labels
    indigo: '#6610f2'  // Indigo color for the other new label
  };

  // Function to get status text - copied from code 1
  const getStatusText = (percentage) => {
    if (percentage <= 25) return t('LABELS.lowstock');
    if (percentage <= 50) return t('LABELS.Moderate');
    if (percentage <= 75) return t('LABELS.Adequate');
    return t('LABELS.good');
  };

  const handleSave = () => {
    if (milkForProduct && product && productQty && productGram) {
      setProductList([
        ...productList,
        {
          tank: productList.length + 3, // Start from 3 to account for example rows
          processedMilk: milkForProduct,
          product,
          productQty,
          productGram,
          date: currentDate,
        },
      ]);
      setMilkForProduct("");
      setProduct("");
      setProductQty("");
      setProductGram("");
    }
  };

  return (
    <>
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.createProduct')}</h5>
          </div>
        </CCardHeader>
        <CCardBody style={{ padding: '15px' }}>
         
          

          {/* Form inputs with improved responsiveness */}
          <div style={{
            background: '#f8f9fa',
            // padding: '15px',
            // borderRadius: '8px',
          
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <CRow className="mb-3 mt-0">

            <CCol xs={12} md={6}>
                <label className="form-label mb-1 fw-bold">Select Milk Sotrage</label>
                <CFormInput
                  type="number"
                  value={milkForProduct}
                  onChange={(e) => setMilkForProduct(e.target.value)}
                  placeholder={t('LABELS.enterMilk')}
                  style={{ fontSize: "1rem" }}
                />
              </CCol>

              <CCol xs={12} md={6}>
                <label className="form-label mb-1 fw-bold">{t('LABELS.enterMilk')}</label>
                <CFormInput
                  type="number"
                  value={milkForProduct}
                  onChange={(e) => setMilkForProduct(e.target.value)}
                  placeholder={t('LABELS.enterMilk')}
                  style={{ fontSize: "1rem" }}
                />
              </CCol>
             </CRow>

   <CRow className="g-2 align-items-end flex-nowrap overflow-auto mb-4">
  <CCol xs={12} sm={6} md={3}>
    <label className="form-label mb-1 fw-bold">{t('LABELS.selectProduct')}</label>
    <CFormSelect
      value={product}
      onChange={(e) => setProduct(e.target.value)}
      style={{ fontSize: "1rem" }}
    >
      <option value="">{t('LABELS.select')}</option>
      <option value="Paneer">{t('PRODUCTS.paneer')}</option>
      <option value="Dahi">{t('PRODUCTS.dahi')}</option>
    </CFormSelect>
  </CCol>

  <CCol xs={12} sm={6} md={2}>
    <label className="form-label mb-1 fw-bold">Raw Materials</label>
    <CFormSelect
      value={productGram}
      onChange={(e) => setProductGram(e.target.value)}
      style={{ fontSize: "1rem" }}
    >
      <option value="">{t('LABELS.select')}</option>
      <option value="100g">100 {t('LABELS.g')}</option>
      <option value="200g">200 {t('LABELS.g')}</option>
      <option value="500g">500 {t('LABELS.g')}</option>
    </CFormSelect>
  </CCol>

  <CCol xs={12} sm={6} md={2}>
    <label className="form-label mb-1 fw-bold">Select Size</label>
    <CFormSelect
      value={productGram}
      onChange={(e) => setProductGram(e.target.value)}
      style={{ fontSize: "1rem" }}
    >
      <option value="">{t('LABELS.select')}</option>
      <option value="100g">100 {t('LABELS.g')}</option>
      <option value="200g">200 {t('LABELS.g')}</option>
      <option value="500g">500 {t('LABELS.g')}</option>
    </CFormSelect>
  </CCol>

  <CCol xs={12} sm={6} md={2}>
    <label className="form-label mb-1 fw-bold">{t('LABELS.productQty')}</label>
    <CFormInput
      type="number"
      value={productQty}
      onChange={(e) => setProductQty(e.target.value)}
      placeholder={t('LABELS.enterProductQty')}
      style={{ fontSize: "1rem" }}
    />
  </CCol>

  <CCol xs={12} sm={6} md={3} className="d-flex justify-content-end align-items-end">
    <CButton
      color="primary"
      onClick={handleSave}
      style={{
        fontSize: "0.9rem",
        fontWeight: "500",
        padding: "0.5rem 1.5rem",
        width: "auto",
        minWidth: "100px"
      }}
      className="w-100 w-sm-auto"
    >
      {t('LABELS.save')}
    </CButton>
  </CCol>
</CRow>

          </div>

          {/* Enhanced Product List Table with responsive settings */}
          <div style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '-15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <CCardHeader style={{ backgroundColor: "#f9f5d7" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 className="mb-0">{t('LABELS.products')}</h5>
              </div>
            </CCardHeader>
            <div className="table-responsive">
              <CTable striped hover responsive className="align-middle border shadow-sm">
                <CTableHead color="light">
                  <CTableRow style={{ backgroundColor: '#f0f4f8' }}>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.tank')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.processed_milk')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.milk_for_product')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.product')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.quantity')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.gram')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.Date')}</CTableHeaderCell>
                    <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.batch_no')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>
                      <strong>1</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>100 {t('LABELS.Ltr')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>100 {t('LABELS.Ltr')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info" className="px-2 py-1">{t("PRODUCTS.paneer")}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>50 {t('LABELS.pcs')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary" className="px-2 py-1">200 {t('LABELS.g')}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>{formatDate(new Date())}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="dark" className="px-2 py-1">01/02/02042025</CBadge>
                    </CTableDataCell>
                  </CTableRow>

                  <CTableRow>
                    <CTableDataCell>
                      <strong>2</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>150 {t('LABELS.Ltr')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>150 {t('LABELS.Ltr')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="success" className="px-2 py-1">{t("PRODUCTS.dahi")}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong style={{ fontSize: '16px' }}>100 {t('LABELS.pcs')}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary" className="px-2 py-1">250 {t('LABELS.g')}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>{formatDate(new Date())}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="dark" className="px-2 py-1">01/02/11042025</CBadge>
                    </CTableDataCell>
                  </CTableRow>

                  {productList.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        <strong>{item.tank}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong style={{ fontSize: '16px' }}>{item.processedMilk} {t('LABELS.Ltr')}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong style={{ fontSize: '16px' }}>{item.processedMilk} {t('LABELS.Ltr')}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={item.product === 'Paneer' ? 'info' : 'success'} className="px-2 py-1">
                          {t(`PRODUCTS.${item.product.toLowerCase()}`)}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong style={{ fontSize: '16px' }}>{item.productQty} {t('LABELS.packets')}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="secondary" className="px-2 py-1">{item.productGram}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <strong>{item.date}</strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="dark" className="px-2 py-1">01/02/02042025</CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </div>
        </CCardBody>
      </CCard>
    </>
  );
}

export default CreateProduct;








// import React, { useState } from "react";
// import { useTranslation } from "react-i18next"; // Import translation hook
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CFormSelect,
//   CFormInput,
//   CButton,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
// } from "@coreui/react";
// import { useTranslation } from 'react-i18next'

// function CreateProduct() {
//   const  t, i18n  = useTranslation(); // Initialize translation function
//   const [milkForProduct, setMilkForProduct] = useState("");
//   const [product, setProduct] = useState("");
//   const [productQty, setProductQty] = useState("");
//   const [productGram, setProductGram] = useState("");
//   const [productList, setProductList] = useState([]);

//   const handleSave = () => {
//     if (milkForProduct && product && productQty && productGram) {
//       setProductList([
//         ...productList,
//         {
//           tank: productList.length + 1,
//           processedMilk: milkForProduct,
//           product,
//           productQty,
//           productGram,
//           date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long" }),
//         },
//       ]);
//       setMilkForProduct("");
//       setProduct("");
//       setProductQty("");
//       setProductGram("");
//     }
//   };

//   return (
//     <CCard className="p-4 max-w-2xl mx-auto shadow-lg rounded-lg mt-10">
//       <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
//         <h2>{t('LABELS.createProduct')}</h2>
//       </CCardHeader>
//       <CCardBody>
//         <div className="mb-3">
//           <label className="form-label">{t('LABELS.enterMilk')}</label>
//           <CFormInput
//             type="number"
//             value={milkForProduct}
//             onChange={(e) => setMilkForProduct(e.target.value)}
//             placeholder="100 Ltr"
//           />
//         </div>

//         <div className="d-flex gap-3">
//           <div className="flex-grow-1">
//             <label className="form-label">{t('LABELS.selectProduct')}</label>
//             <CFormSelect value={product} onChange={(e) => setProduct(e.target.value)}>
//               <option value="">{t('LABELS.selectProduct')}</option>
//               <option value="Paneer">Paneer</option>
//               <option value="Dahi">Dahi</option>
//             </CFormSelect>
//           </div>

//           <div className="flex-grow-1">
//             <label className="form-label">{t('LABELS.selectGram')}</label>
//             <CFormSelect value={productGram} onChange={(e) => setProductGram(e.target.value)}>
//               <option value="">{t('LABELS.selectGram')}</option>
//               <option value="100g">100g</option>
//               <option value="200g">200g</option>
//               <option value="500g">500g</option>
//             </CFormSelect>
//           </div>

//           <div className="flex-grow-1">
//             <label className="form-label">{t('LABELS.productQty')}</label>
//             <CFormInput
//               type="number"
//               value={productQty}
//               onChange={(e) => setProductQty(e.target.value)}
//               placeholder="50 Pcs"
//             />
//           </div>
//         </div>

//         <CButton color="primary" className="mt-3 w-100" onClick={handleSave}>
//           {t('LABELS.save')}
//         </CButton>

//         <CTable striped bordered className="mt-4">
//           <CTableHead>
//             <CTableRow>
//               <CTableHeaderCell>Tank</CTableHeaderCell>
//               <CTableHeaderCell>Processed Milk</CTableHeaderCell>
//               <CTableHeaderCell>{t('LABELS.enterMilk')}</CTableHeaderCell>
//               <CTableHeaderCell>{t('LABELS.product')}</CTableHeaderCell>
//               <CTableHeaderCell>{t('LABELS.productQty')}</CTableHeaderCell>
//               <CTableHeaderCell>{t('LABELS.selectGram')}</CTableHeaderCell>
//               <CTableHeaderCell>Date</CTableHeaderCell>
//             </CTableRow>
//           </CTableHead>
//           <CTableBody>
//             {productList.map((item, index) => (
//               <CTableRow key={index}>
//                 <CTableDataCell>{item.tank}</CTableDataCell>
//                 <CTableDataCell>{item.processedMilk} Ltr</CTableDataCell>
//                 <CTableDataCell>{item.processedMilk} Ltr</CTableDataCell>
//                 <CTableDataCell>{item.product}</CTableDataCell>
//                 <CTableDataCell>{item.productQty}</CTableDataCell>
//                 <CTableDataCell>{item.productGram}</CTableDataCell>
//                 <CTableDataCell>{item.date}</CTableDataCell>
//               </CTableRow>
//             ))}
//           </CTableBody>
//         </CTable>
//       </CCardBody>
//     </CCard>
//   );
// }

// export default CreateProduct;
