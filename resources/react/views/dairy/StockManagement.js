import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CRow,
  CCol,
  CContainer,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
} from "@coreui/react";
import { CFormInput, CFormSelect } from '@coreui/react';
import { useTranslation } from 'react-i18next'
import { PlusCircle, Plus } from "lucide-react";

const StockManagement = () => {
  
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  const [tanks, setTanks] = useState([
    { id: 1, name: t('LABELS.tank'), number:1, capacity: 500, current: 500 },
    { id: 2, name: t('LABELS.tank'), number:1, capacity: 700, current: 300 },
    { id: 3, name: t('LABELS.tank'), number:1, capacity: 600, current: 100 },
    { id: 4, name: t('LABELS.tank'), number:1, capacity: 600, current: 150 },
  ]);

  const [ingredients, setIngredients] = useState([
    { name: t('LABELS.sugar'), quantity: 10.50, unit:t('LABELS.kg'), date: '25 Oct 2024', updatedby:'Ajinkya' },
    { name: t('LABELS.foodColor'), quantity: 5.25, unit: t('LABELS.kg'), date: '10 Nov 2024', updatedby:'Vishal' },
  ]);

  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "Kg"
  });

  const [packagingMaterials] = useState([
    { name: t('LABELS.tetraPack'), quantity: 1500, date: '10 Apr 2025', updatedby:'Samir' },
    { name: t('LABELS.can'), quantity: 850 , date: '14 Jan 2025', updatedby:'Abhijeet'},
    { name: t('LABELS.tub'), quantity: 2300, date: '01 Feb 2025', updatedby:'Shubham' },
  ]);

  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [packagingData, setPackagingData] = useState({
    packagingType: "",
    quantity: "",
    supplier: "",
    expiryDate: "",
  });



  const handleTankAddQuantity = (tankId, quantity) => {
    setTanks(
      tanks.map((tank) => {
        if (tank.id === tankId) {
          const newQuantity = tank.current + Number(quantity);
          return {
            ...tank,
            current: newQuantity > tank.capacity ? tank.capacity : newQuantity,
          };
        }
        return tank;
      })
    );
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      alert("Please select an ingredient and enter a quantity");
      return;
    }

    const existingIngredientIndex = ingredients.findIndex(
      (ing) => ing.name.toLowerCase() === newIngredient.name.toLowerCase()
    );

    if (existingIngredientIndex !== -1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIngredientIndex].quantity =
        Number(updatedIngredients[existingIngredientIndex].quantity) +
        Number(newIngredient.quantity);
      setIngredients(updatedIngredients);
    } else {
      setIngredients([
        ...ingredients,
        {
          name:
            newIngredient.name.charAt(0).toUpperCase() +
            newIngredient.name.slice(1),
          quantity: Number(newIngredient.quantity),
          unit: newIngredient.unit
        },
      ]);
    }

    setNewIngredient({ name: "", quantity: "", unit: "Kg" });
    setShowIngredientModal(false);
  };

  const handlePackagingDataSubmit = () => {
    // Here you could add logic to save the packaging data
    console.log("Packaging data submitted:", packagingData);
    setShowPackagingModal(false);
    // Reset form
    setPackagingData({
      packagingType: "",
      quantity: "",
      supplier: "",
      expiryDate: "",
    });
  };

  // Calculate fill percentage for tank visualization
  const calculateFillPercentage = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  // Function to determine tank fill color based on percentage
  const getTankFillColor = (percentage) => {
    if (percentage >= 80) return "success";
    if (percentage >= 40) return "warning";
    return "danger";
  };

  // Function to get background color for progress bar
  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "#2eb85c"; // Green
    if (percentage >= 40) return "#f9b115"; // Yellow
    return "#e55353"; // Red
  };

  // Badge styles for ingredients and packaging
  const getBadgeStyle = (index) => {
    const colors = ["#17a2b8", "#28a745", "#dc3545", "#fd7e14", "#6610f2"];
    return {
      backgroundColor: colors[index % colors.length],
      color: "white",
      padding: "0.25rem 0.75rem",
      borderRadius: "30px",
      display: "inline-block"
    };
  };

  // Common table styles
  const tableContainerStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "0.25rem",
    overflow: "hidden",
    marginBottom: "1.5rem"
  };

  const tableHeaderStyle = {
    backgroundColor: "#f8f9fa",
    padding: "0.75rem 1rem",
    fontWeight: "600",
    fontSize: "1rem",
    borderBottom: "1px solid #dee2e6"
  };

  // Reduced header style for the main sections
  const reducedHeaderStyle = {
    fontWeight: "600",
    fontSize: "1.11rem"  // Reduced from 1.25rem
  };

  // Reduced card header style for main component
  const mainCardHeaderStyle = {
    backgroundColor: "#E6E6FA",
    fontSize: "1.2rem", // Reduced from 1.5rem
    fontWeight: "600"
  };

  return (
    <CContainer fluid className="p-0">
      <CCard className="p-1 p-md-1">
        <CCardHeader className="bg-light-purple text-dark" style={{ backgroundColor: "#E6E6FA" }}>
          <h2 style={mainCardHeaderStyle}>{t('LABELS.stockManagement')}</h2>
        </CCardHeader>
        <CCardBody>
          {/* SECTION: Tank Capacity */}
          <div className="mb-2">
            <CRow>
              {tanks.map((tank, index) => {
                if (index > 2) return null; // Only show 3 tanks as in the image
                const fillPercentage = calculateFillPercentage(tank.current, tank.capacity);
                const barColor = getProgressBarColor(fillPercentage);

                return (
                  <CCol sm={4} key={tank.id}>
                    <CCard className="mb-3" style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.08)" }}>
                      <CCardHeader style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                        <div style={{ fontSize: "1rem", fontWeight: "600" }}>{t('LABELS.tank')} {tank.id}</div>
                      </CCardHeader>
                      <CCardBody className="p-3">
                        <div className="mb-3">
                          <div className="mb-2">
                            <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                            {t('LABELS.currentCapacity')}: {tank.current} / {tank.capacity} {t('LABELS.Ltr')}
                            </span>
                          </div>
                          <div style={{ backgroundColor: "#e9ecef", height: "25px", borderRadius: "0.25rem", position: "relative", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${fillPercentage}%`,
                                height: "100%",
                                backgroundColor: barColor,
                                transition: "width 0.6s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold"
                              }}
                            >
                              {fillPercentage}%
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                          <CFormInput
                            type="number"
                            placeholder={t(`LABELS.addmilk`)}
                            className="py-1 px-2"
                            id={`tank-${tank.id}-input`}
                            style={{ fontSize: "1rem" }}
                          />
                          <CButton
                            color="primary"
                            className="py-1 px-3"
                            style={{ fontSize: "1rem", fontWeight: "bold" }}
                            onClick={() => {
                              const input = document.getElementById(`tank-${tank.id}-input`);
                              handleTankAddQuantity(tank.id, input.value);
                              input.value = "";
                            }}
                          >
                            {t(`LABELS.add`)}
                          </CButton>
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                );
              })}
            </CRow>
          </div>

          {/* SECTION: Ingredients - Styled like the table in the image */}
          <div className="mb-4" style={tableContainerStyle}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#d6eaff",
              padding: "0.35rem 1rem",
              borderBottom: "1px solid #dee2e6"
            }}>
              <span style={reducedHeaderStyle}>{t(`LABELS.ingredient`)}</span>
              <CButton
                color="primary"
                onClick={() => setShowIngredientModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  padding: "0",
                  borderRadius: "50%"
                }}
              >
                <Plus size={20} />
              </CButton>
            </div>

            <CTable hover style={{ margin: "0" }} responsive>
              <CTableHead style={{ backgroundColor: "#f8f9fa" }}>
                <CTableRow>
                  <CTableHeaderCell style={tableHeaderStyle}>{t(`LABELS.ingredient`)}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.quantity')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.lastUpdatedDate')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.updatedby')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {ingredients.map((ingredient, index) => (
                  <CTableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{ingredient.name}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                      <span style={getBadgeStyle(index)}>
                        {ingredient.quantity.toFixed(2)} {ingredient.unit}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{ingredient.date}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{ingredient.updatedby}</CTableDataCell>
                  </CTableRow>

                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* SECTION: Packaging Material - Styled like the table in the image */}
          <div className="mb-4" style={tableContainerStyle}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8d7da",
              padding: "0.45rem 1rem",
              borderBottom: "1px solid #dee2e6"
            }}>
              <span style={reducedHeaderStyle}>{t(`LABELS.PackagingMaterial`)}</span>
              <CButton
                color="primary"
                onClick={() => setShowPackagingModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  padding: "0",
                  borderRadius: "50%"
                }}
              >
                <Plus size={20} />
              </CButton>
            </div>

            <CTable hover style={{ margin: "0" }} responsive>
              <CTableHead style={{ backgroundColor: "#f8f9fa" }}>
                <CTableRow>
                  <CTableHeaderCell style={tableHeaderStyle}>{t(`LABELS.ingredients`)}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{`${t('LABELS.quantity')} (${t('LABELS.pcs')})`}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.lastUpdatedDate')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.updatedby')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {packagingMaterials.map((material, index) => (
                  <CTableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{material.name}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                      <span style={getBadgeStyle(index)}>
                        {material.quantity}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{material.date}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{material.updatedby}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* Add Ingredient Modal */}
          <CModal
            visible={showIngredientModal}
            onClose={() => setShowIngredientModal(false)}
            backdrop="static"
            size="lg"
          >
            <CModalHeader closeButton>
              <CModalTitle>{t(`LABELS.addIngredient`)}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow className="mb-3">
                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="ingredientType">{t(`LABELS.selectIngredient`)}</CFormLabel>
                  <CFormSelect
                    id="ingredientType"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  >
                    <option value="">{t(`LABELS.selectIngredient`)}</option>
                    <option value="sugar">{t(`LABELS.sugar`)}</option>
                    <option value="salt">{t(`LABELS.salt`)}</option>
                    <option value="food-color">{t(`LABELS.foodColor`)}</option>
                    <option value="other">{t(`LABELS.other`)}</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel htmlFor="ingredientQuantity">{t('LABELS.quantity')}</CFormLabel>
                  <CFormInput
                    id="ingredientQuantity"
                    type="number"
                    placeholder={t('LABELS.quantity')}
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="ingredientUnit">Unit</CFormLabel>
                  <CFormSelect
                    id="ingredientUnit"
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                  >
                    <option value="Kg">{t('LABELS.kg')}</option>
                    <option value="Gm">{t('LABELS.g')}</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowIngredientModal(false)}>
                {t('LABELS.cancel')}
              </CButton>
              <CButton color="primary" onClick={handleAddIngredient}>
                {t('LABELS.add')}
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Packaging Data Modal */}
          <CModal
            visible={showPackagingModal}
            onClose={() => setShowPackagingModal(false)}
            backdrop="static"
            size="lg"
          >
            <CModalHeader closeButton>
              <CModalTitle>{t('LABELS.addPackging')}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow className="mb-3">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel htmlFor="packagingType">{t('LABELS.packagingType')}</CFormLabel> 
                  <CFormSelect
                    id="packagingType"
                    value={packagingData.packagingType}
                    onChange={(e) => setPackagingData({...packagingData, packagingType: e.target.value})}
                  >
                        <option value="">{t('LABELS.selectPackagingType')}</option>
    <option value="glass">{t('LABELS.glass')}</option>
    <option value="plastic">{t('LABELS.plastic')}</option>
    <option value="carton-gable">{t('LABELS.cartonGable')}</option>
    <option value="carton-brick">{t('LABELS.cartonBrick')}</option>
    <option value="pouch">{t('LABELS.pouch')}</option>
    <option value="tub">{t('LABELS.tub')}</option>
    <option value="can">{t('LABELS.can')}</option>
    <option value="tetra-pack">{t('LABELS.tetraPack')}</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="packagingQuantity">{t('LABELS.quantity')}</CFormLabel>
                  <CFormInput
                    id="packagingQuantity"
                    type="number"
                    placeholder={t('LABELS.addQuantity')} 
                    value={packagingData.quantity}
                    onChange={(e) => setPackagingData({...packagingData, quantity: e.target.value})}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel htmlFor="packagingSupplier">{t('LABELS.supplier')}</CFormLabel> 
                  <CFormInput
                    id="packagingSupplier" 
                    placeholder={t('LABELS.supplierName')} 
                    value={packagingData.supplier}
                    onChange={(e) => setPackagingData({...packagingData, supplier: e.target.value})}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="packagingExpiry">{t('LABELS.expireDate')}</CFormLabel> 
                  <CFormInput
                    id="packagingExpiry"
                    type="date"
                    value={packagingData.expiryDate}
                    onChange={(e) => setPackagingData({...packagingData, expiryDate: e.target.value})}
                  />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowPackagingModal(false)}>
              {t('LABELS.cancel')}
              </CButton>
              <CButton color="primary" onClick={handlePackagingDataSubmit}>
              {t('LABELS.add')}
              </CButton>
            </CModalFooter>
          </CModal>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default StockManagement;







































































// import React, { useState } from "react";
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CButton,
// //   CInput,
// //   CSelect,
//   CTable,
//   CTableHead,
//   CTableBody,
//   CTableRow,
//   CTableHeaderCell,
//   CTableDataCell,
// } from "@coreui/react";
// import { CFormInput, CFormSelect  } from '@coreui/react';
// import { useTranslation } from 'react-i18next'


// import { PlusCircle } from "lucide-react";

// const StockManagement = () => {
//   const [tanks, setTanks] = useState([
//     { id: 1, name: "Tank 1", capacity: 500, current: 500 },
//     { id: 2, name: "Tank 2", capacity: 300, current: 300 },
//   ]);

//   const [ingredients, setIngredients] = useState([]);
//   const [newIngredient, setNewIngredient] = useState({
//     name: "",
//     quantity: "",
//   });

//    const { t, i18n } = useTranslation("global")
//       const lng = i18n.language;

//   const handleTankAddQuantity = (tankId, quantity) => {
//     setTanks(
//       tanks.map((tank) => {
//         if (tank.id === tankId) {
//           const newQuantity = tank.current + Number(quantity);
//           return {
//             ...tank,
//             current: newQuantity > tank.capacity ? tank.capacity : newQuantity,
//           };
//         }
//         return tank;
//       })
//     );
//   };

//   const handleAddIngredient = () => {
//     if (!newIngredient.name || !newIngredient.quantity) {
//       alert("Please select an ingredient and enter a quantity");
//       return;
//     }

//     const existingIngredientIndex = ingredients.findIndex(
//       (ing) => ing.name.toLowerCase() === newIngredient.name.toLowerCase()
//     );

//     if (existingIngredientIndex !== -1) {
//       const updatedIngredients = [...ingredients];
//       updatedIngredients[existingIngredientIndex].quantity =
//         Number(updatedIngredients[existingIngredientIndex].quantity) +
//         Number(newIngredient.quantity);
//       setIngredients(updatedIngredients);
//     } else {
//       setIngredients([
//         ...ingredients,
//         {
//           name:
//             newIngredient.name.charAt(0).toUpperCase() +
//             newIngredient.name.slice(1),
//           quantity: Number(newIngredient.quantity),
//         },
//       ]);
//     }

//     setNewIngredient({ name: "", quantity: "" });
//   };

//   return (
//     <div className="p-0">
//       <CCard className="p-4">
//         <CCardHeader className="bg-light-purple text-dark" style={{ backgroundColor: "#E6E6FA" }}>
//           <h2>{t('LABELS.stockManagement')}</h2>
//         </CCardHeader>
//         <CCardBody>
//           {/* Tanks Section */}
//           <div className="mb-4">
//             {/* <h3>{t('LABELS.tank')}</h3> */}
//             {tanks.map((tank) => (
//               <CCard key={tank.id} className="mb-3">

//                <CCardBody className="d-flex justify-content-between align-items-center p-2 gap-2">
//   <div className="d-flex align-items-center gap-1">
//     <strong className="text-lg"><h5>{t(`LABELS.tank`)} {tank.id}</h5></strong> -{" "}
//     <span className="text-base"> <h5>{tank.current} / {tank.capacity} {t('LABELS.Ltr')}</h5></span>
//   </div>
//   <div className="d-flex gap-1">
//     <CFormInput
//       type="number"
//       placeholder={`${t('LABELS.addQuantity')}`}
//       className="py-1 px-2"
//       id={`tank-${tank.id}-input`}
//     />
//     <CButton
//       color="primary"
//       className="py-1 px-2 d-flex align-items-center"
//       onClick={() => {
//         const input = document.getElementById(`tank-${tank.id}-input`);
//         handleTankAddQuantity(tank.id, input.value);
//         input.value = "";
//       }}
//     >
//       <PlusCircle size={16} className="me-1" /> {t('LABELS.add')}
//     </CButton>
//   </div>
// </CCardBody>

//               </CCard>
//             ))}
//           </div>

//           {/* Ingredients Section */}
//           <div>
//             <h3>{t('LABELS.ingredient')}</h3>
//             <div className="d-flex gap-2 mb-3">
//               <CFormSelect
//                 value={newIngredient.name}
//                 onChange={(e) =>
//                   setNewIngredient({ ...newIngredient, name: e.target.value })
//                 }
//               >
//                 <option value="">{t('LABELS.selectIngredient')}</option>
//                 <option value="sugar">{t('LABELS.sugar')}</option>
//                 <option value="salt">{t('LABELS.salt')}</option>
//                 <option value="food-color">{t('LABELS.foodColor')}</option>
//                 <option value="other">{t('LABELS.other')}</option>
//               </CFormSelect>
//               <CFormInput
//                 type="number"
//                 placeholder={t('LABELS.quantityKg')}
//                 value={newIngredient.quantity}
//                 onChange={(e) =>
//                   setNewIngredient({ ...newIngredient, quantity: e.target.value })
//                 }
//               />
//               <CButton color="success" onClick={handleAddIngredient}>
//                 <PlusCircle size={20} /> {t('LABELS.add')}
//               </CButton>
//             </div>

//             <CTable striped bordered>
//               <CTableHead>
//                 <CTableRow>
//                   <CTableHeaderCell>{t('LABELS.ingredient')}</CTableHeaderCell>
//                   <CTableHeaderCell>{t('LABELS.quantityKg')}</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>



//                 {/* Hardcoded Dummy Data */}
//     <CTableRow>
//       <CTableDataCell>{t('LABELS.milkPowder')}</CTableDataCell>
//       <CTableDataCell>10.50</CTableDataCell>
//     </CTableRow>
//     <CTableRow>
//       <CTableDataCell>{t('LABELS.sugar')}</CTableDataCell>
//       <CTableDataCell>5.25</CTableDataCell>
//     </CTableRow>



//                 {ingredients.map((ingredient, index) => (
//                   <CTableRow key={index}>
//                     <CTableDataCell>{ingredient.name}</CTableDataCell>
//                     <CTableDataCell>{ingredient.quantity.toFixed(2)}</CTableDataCell>
//                   </CTableRow>
//                 ))}
//               </CTableBody>
//             </CTable>
//           </div>
//         </CCardBody>
//       </CCard>
//     </div>
//   );
// };

// export default StockManagement;
