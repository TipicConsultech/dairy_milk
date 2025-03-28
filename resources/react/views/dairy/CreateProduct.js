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
} from "@coreui/react";
import { useTranslation } from 'react-i18next'

function CreateProduct() {
  const [milkForProduct, setMilkForProduct] = useState("");
  const [product, setProduct] = useState("");
  const [productQty, setProductQty] = useState("");
  const [productGram, setProductGram] = useState("");
  const [productList, setProductList] = useState([]);
    const { t, i18n } = useTranslation("global")
    const lng = i18n.language;

  // Dynamic Tank and Processed Milk Data
  const tankCapacity = 400; // Example total tank capacity
  const processedMilk = 200; // Example processed milk
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
  }); // Formats as "24 March"

  const handleSave = () => {
    if (milkForProduct && product && productQty && productGram) {
      setProductList([
        ...productList,
        {
          tank: productList.length + 1,
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
    <CCard className="p-4 max-w-2xl mx-auto  rounded-lg mt-10">
      <CCardHeader  style={{ backgroundColor: "#E6E6FA" }}>
        <h2>{t('LABELS.createProduct')}</h2>
       
      </CCardHeader>
      <CCardBody>


      <p className="text-muted">
        {t('LABELS.tank')} 1: <strong>{tankCapacity} {t('LABELS.Ltr')}</strong> |  {t('LABELS.processed_milk')}:{" "}
          <strong>{processedMilk} {t('LABELS.Ltr')}</strong> | {t('LABELS.Date')}: <strong>{currentDate}</strong>
        </p>




        <div className="mb-3">
           <label className="form-label">{t('LABELS.enterMilk')}</label>   {/* Enter Milk for Product */}
          <CFormInput
            type="number"
            value={milkForProduct}
            onChange={(e) => setMilkForProduct(e.target.value)}
            placeholder={`100 ${t('LABELS.Ltr')}`}
          />
        </div>

        <div className="d-flex gap-3">
          <div className="flex-grow-1">
            <label className="form-label">{t('LABELS.selectProduct')}</label>   {/* selectProduct */}
            <CFormSelect value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="">{t('LABELS.select')}</option>
              <option value="Paneer">{t('PRODUCTS.paneer')}</option>
              <option value="Dahi">{t('PRODUCTS.dahi')}</option>
            </CFormSelect>
          </div>

          <div className="flex-grow-1">
            <label className="form-label">{t('LABELS.selectGram')}</label>
            <CFormSelect value={productGram} onChange={(e) => setProductGram(e.target.value)}>
              <option value="">{t('LABELS.select')} </option>
              <option value="100g">100 {t('LABELS.g')}</option>
              <option value="200g">200 {t('LABELS.g')}</option>
              <option value="500g">500 {t('LABELS.g')}</option>
            </CFormSelect>
          </div>

          <div className="flex-grow-1">
            <label className="form-label">{t('LABELS.productQty')}</label> 
            <CFormInput
              type="number"
              value={productQty}
              onChange={(e) => setProductQty(e.target.value)}
              placeholder={`50 ${t('LABELS.pcs')}`}
            />
          </div>
        </div>

        <CButton color="primary" className="mt-3 w-100" onClick={handleSave}>
        {t('LABELS.save')}
        </CButton>

        {/* Table */}
        <CTable striped bordered className="mt-4">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>{t('LABELS.tank')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.processed_milk')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.milk_for_product')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.product')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.quantity')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.gram')}</CTableHeaderCell>
              <CTableHeaderCell>{t('LABELS.Date')}</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>



          <CTableRow>
    <CTableDataCell>1</CTableDataCell>
    <CTableDataCell>100 {t('LABELS.Ltr')}</CTableDataCell>
    <CTableDataCell>100 {t('LABELS.Ltr')}</CTableDataCell>
    <CTableDataCell>{t("PRODUCTS.paneer")}</CTableDataCell>
    <CTableDataCell>50 {t('LABELS.pcs')}</CTableDataCell>
    <CTableDataCell>200 {t('LABELS.g')}</CTableDataCell>
    <CTableDataCell>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long" })}</CTableDataCell>
  </CTableRow>

  <CTableRow>
    <CTableDataCell>2</CTableDataCell>
    <CTableDataCell>150 {t('LABELS.Ltr')}</CTableDataCell>
    <CTableDataCell>150 {t('LABELS.Ltr')}</CTableDataCell>
    <CTableDataCell>{t("PRODUCTS.dahi")}</CTableDataCell>
    <CTableDataCell>100 {t('LABELS.pcs')}</CTableDataCell>
    <CTableDataCell>250 {t('LABELS.g')}</CTableDataCell>
    <CTableDataCell>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long" })}</CTableDataCell>
  </CTableRow>




            {productList.map((item, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{item.tank}</CTableDataCell>
                <CTableDataCell>{item.processedMilk} {t('LABELS.Ltr')}</CTableDataCell>
                <CTableDataCell>{item.processedMilk} {t('LABELS.Ltr')}</CTableDataCell>
                <CTableDataCell>{t(`PRODUCTS.${item.product.toLowerCase()}`)}</CTableDataCell>
                <CTableDataCell>{item.productQty} {t('LABELS.pcs')}</CTableDataCell>
                <CTableDataCell>{item.productGram} {t('LABELS.g')}</CTableDataCell>
                <CTableDataCell>{item.date}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
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
