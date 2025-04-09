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
    <CContainer fluid className="p-0" style={{ width: "100%", maxWidth: "100%" }}>
      <CCard className="mb-0" style={{ width: "100%" }}>
        <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", margin: "0" }}>{t('LABELS.createProduct')}</h2>
        </CCardHeader>
        <CCardBody className="p-3">
          {/* Tank visualizations - styled like code 2 */}
          <CRow className="mb-3">
            <CCol xs={12} md={6}>
              <CCard className="mb-3 h-100" style={{ borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.08)" }}>
                <CCardHeader style={{ backgroundColor: "#4F8DF5", color: "white", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", padding: "0.5rem 1rem" }}>
                  <strong style={{ fontSize: "1.3rem" }}>{t('LABELS.tank')} 1</strong>
                </CCardHeader>
                <CCardBody className="p-2">
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontSize: "1.1rem" }}>{tankCapacity} / {tankCapacity} {t('LABELS.Ltr')}</span>
                      <CBadge color={calculateFillPercentage(tankCapacity, tankCapacity) > 80 ? "success" : "warning"}>
                        {calculateFillPercentage(tankCapacity, tankCapacity)}%
                      </CBadge>
                    </div>
                    <CProgress value={calculateFillPercentage(tankCapacity, tankCapacity)} height={15} color={calculateFillPercentage(tankCapacity, tankCapacity) > 80 ? "success" : "warning"} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: "1rem" }}>{t('LABELS.Date')}: <strong>{currentDate}</strong></span>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xs={12} md={6}>
              <CCard className="mb-3 h-100" style={{ borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.08)" }}>
                <CCardHeader style={{ backgroundColor: "#20c997", color: "white", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", padding: "0.5rem 1rem" }}>
                  <strong style={{ fontSize: "1.3rem" }}>{t('LABELS.processed_milk')}</strong>
                </CCardHeader>
                <CCardBody className="p-2">
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontSize: "1.1rem" }}>{processedMilk} / {tankCapacity} {t('LABELS.Ltr')}</span>
                      <CBadge color={calculateFillPercentage(processedMilk, tankCapacity) > 80 ? "success" : "warning"}>
                        {calculateFillPercentage(processedMilk, tankCapacity)}%
                      </CBadge>
                    </div>
                    <CProgress value={calculateFillPercentage(processedMilk, tankCapacity)} height={15} color={calculateFillPercentage(processedMilk, tankCapacity) > 80 ? "warning" : "info"} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ fontSize: "1rem" }}>{t('LABELS.Date')}: <strong>{currentDate}</strong></span>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
 
          {/* Form inputs - Responsive */}
          <div className="mb-2">
            <label className="form-label mb-1">{t('LABELS.enterMilk')}</label>
            <CFormInput
              type="number"
              value={milkForProduct}
              onChange={(e) => setMilkForProduct(e.target.value)}
              placeholder={t('LABELS.enterMilk')}
              style={{ fontSize: "1rem", width: "100%" }}
            />
          </div>
 
          <CRow className="mb-3">
            <CCol xs={12} sm={4} className="mb-2 mb-sm-0">
              <label className="form-label mb-1">{t('LABELS.selectProduct')}</label>
              <CFormSelect
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                style={{ fontSize: "1rem", width: "100%" }}
              >
                <option value="">{t('LABELS.select')}</option>
                <option value="Paneer">{t('PRODUCTS.paneer')}</option>
                <option value="Dahi">{t('PRODUCTS.dahi')}</option>
              </CFormSelect>
            </CCol>
 
            <CCol xs={12} sm={4} className="mb-2 mb-sm-0">
              <label className="form-label mb-1">{t('LABELS.selectGram')}</label>
              <CFormSelect
                value={productGram}
                onChange={(e) => setProductGram(e.target.value)}
                style={{ fontSize: "1rem", width: "100%" }}
              >
                <option value="">{t('LABELS.select')} </option>
                <option value="100g">100 {t('LABELS.g')}</option>
                <option value="200g">200 {t('LABELS.g')}</option>
                <option value="500g">500 {t('LABELS.g')}</option>
              </CFormSelect>
            </CCol>
 
            <CCol xs={12} sm={4}>
              <label className="form-label mb-1">{t('LABELS.productQty')}</label>
              <CFormInput
                type="number"
                value={productQty}
                onChange={(e) => setProductQty(e.target.value)}
                placeholder={t('LABELS.enterProductQty')}
                style={{ fontSize: "1rem", width: "100%" }}
              />
            </CCol>
          </CRow>
 
          <div className="mb-3">
            <CButton
              color="primary"
              onClick={handleSave}
              style={{
                fontSize: "1.1rem",
                fontWeight: "500",
                padding: "0.5rem 1.5rem"
              }}
            >
              {t('LABELS.save')}
            </CButton>
          </div>
 
          {/* Table - Styled like code 2 */}
          <div className="table-responsive w-100">
            <CCard style={{ borderRadius: "8px", boxShadow: "0 3px 6px rgba(0,0,0,0.1)", border: "1px solid #d8e2ef", width: "100%" }}>
              <CCardHeader style={{ backgroundColor: "#3B7DDD", color: "white", borderBottom: "none", padding: "0.5rem 1rem" }}>
                <h4 style={{ fontSize: "1.3rem", fontWeight: "600", margin: "0" }}>{t('LABELS.products')}</h4>
              </CCardHeader>
              <CCardBody style={{ padding: "0" }}>
                <CTable hover style={{ margin: "0", width: "100%" }} responsive>
                  <CTableHead>
                    <CTableRow style={{ backgroundColor: "#f8f9fa" }}>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.tank')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.processed_milk')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.milk_for_product')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.product')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.quantity')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.gram')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.Date')}</CTableHeaderCell>
                      <CTableHeaderCell style={{ fontSize: "1.1rem", fontWeight: "600", borderBottom: "2px solid #dee2e6", padding: "10px 12px" }}>{t('LABELS.batch_no')}</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow style={{ borderLeft: "4px solid #20c997" }}>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>1</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>100 {t('LABELS.Ltr')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>100 {t('LABELS.Ltr')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{t("PRODUCTS.paneer")}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>50 {t('LABELS.pcs')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>200 {t('LABELS.g')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{formatDate(new Date())}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>01/02/02042025</CTableDataCell>
                    </CTableRow>
 
                    <CTableRow style={{ borderLeft: "4px solid #ffc107" }}>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>2</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>150 {t('LABELS.Ltr')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>150 {t('LABELS.Ltr')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{t("PRODUCTS.dahi")}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>100 {t('LABELS.pcs')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>250 {t('LABELS.g')}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{formatDate(new Date())}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>01/02/11042025</CTableDataCell>
                    </CTableRow>
 
                    {productList.map((item, index) => {
                      // Assign different colors for each row
                      const colors = ["#6610f2", "#fd7e14", "#20c997"];
                      return (
                        <CTableRow key={index} style={{ borderLeft: `4px solid ${colors[index % colors.length]}` }}>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.tank}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.processedMilk} {t('LABELS.Ltr')}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.processedMilk} {t('LABELS.Ltr')}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{t(`PRODUCTS.${item.product.toLowerCase()}`)}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.productQty} {t('LABELS.packets')}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.productGram}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>{item.date}</CTableDataCell>
                          <CTableDataCell style={{ fontSize: "1rem", padding: "10px 12px" }}>01/02/02042025</CTableDataCell>
                        </CTableRow>
                      );
                    })}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
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
