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
  CBadge,
  CProgress,
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
import { PlusCircle, Package } from "lucide-react";
 
const StockManagement = () => {
  const [tanks, setTanks] = useState([
    { id: 1, name: "Tank 1", capacity: 500, current: 500 },
    { id: 2, name: "Tank 2", capacity: 300, current: 200 },
    { id: 3, name: "Tank 3", capacity: 400, current: 200 },
    { id: 4, name: "Tank 4", capacity: 600, current: 150 },
  ]);
 
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
  });
 
  const [packagingMaterials] = useState([
    { name: "Tetra Pak Cartons", quantity: 1500 },
    { name: "HDPE Plastic Bottles", quantity: 850 },
    { name: "PET Bottles", quantity: 2300 },
  ]);
 
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [packagingData, setPackagingData] = useState({
    packagingType: "",
    quantity: "",
    supplier: "",
    expiryDate: "",
  });
 
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;
 
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
        },
      ]);
    }
 
    setNewIngredient({ name: "", quantity: "" });
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
    if (percentage > 80) return "success";
    if (percentage > 40) return "warning";
    return "danger"; // Added red color for low levels
  };
 
  return (
    <CContainer fluid className="p-0">
      <CCard className="p-1 p-md-1">
        <CCardHeader className="bg-light-purple text-dark" style={{ backgroundColor: "#E6E6FA" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>{t('LABELS.stockManagement')}</h2>
        </CCardHeader>
        <CCardBody>
          {/* SECTION: Tank Capacity - Redesigned with card structure */}
          <div className="mb-4">
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #dee2e6" }}>
              {/* Blue header for Tank Capacity */}
              <div style={{ backgroundColor: "#4F8DF5", color: "white", padding: "0.75rem 1rem", fontWeight: "600", fontSize: "1.25rem" }}>
              {t('LABELS.tank_capacity')}  
              </div>
 
              {/* Tank content area */}
              <div className="p-3">
                <CRow>
                  {tanks.map((tank) => {
                    const fillPercentage = calculateFillPercentage(tank.current, tank.capacity);
                    const fillColor = getTankFillColor(fillPercentage);
 
                    return (
                      <CCol xs={12} sm={6} lg={3} key={tank.id}>
                        <CCard className="mb-3 h-100" style={{ borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.08)" }}>
                          <CCardHeader style={{ backgroundColor: "#4F8DF5", color: "white", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
                            <strong style={{ fontSize: "1.3rem" }}>{t(`LABELS.tank`)} {tank.id}</strong>
                          </CCardHeader>
                          <CCardBody className="p-3">
                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span style={{ fontSize: "1.1rem" }}>{tank.current} / {tank.capacity} {t('LABELS.Ltr')}</span>
                                <CBadge color={fillColor}>
                                  {fillPercentage}%
                                </CBadge>
                              </div>
                              <CProgress value={fillPercentage} height={15} color={fillColor} />
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
            </div>
          </div>
 
          {/* SECTION: Ingredients - Modified to move controls inside the card */}
          <div className="mb-4">
            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #dee2e6" }}>
              {/* Blue header bar as main header */}
              <div style={{ backgroundColor: "#4F8DF5", color: "white", padding: "0.75rem 1rem", fontWeight: "600", fontSize: "1.25rem" }}>
              {t(`LABELS.ingredient`)} 
              </div>
 
              {/* Add the form controls inside the card */}
              <div className="p-3 border-bottom">
                <div className="d-flex flex-wrap gap-2">
                  <CFormSelect
                    value={newIngredient.name}
                    onChange={(e) =>
                      setNewIngredient({ ...newIngredient, name: e.target.value })
                    }
                    style={{ fontSize: "1rem", flex: "1 1 auto" }}
                    placeholder="Select Ingredient"
                  >
                    <option value="">{t(`LABELS.selectIngredient`)} </option>
                    <option value="sugar">{t(`LABELS.sugar`)}</option>
                    <option value="salt">{t(`LABELS.salt`)}</option>
                    <option value="food-color">{t(`LABELS.foodColor`)}</option>
                    <option value="other">{t(`LABELS.other`)}</option>
                  </CFormSelect>
                  <CFormInput
                    type="number"
                    placeholder={`${t('LABELS.quantity')} (${t('LABELS.kg')})`}
                    value={newIngredient.quantity}
                    onChange={(e) =>
                      setNewIngredient({ ...newIngredient, quantity: e.target.value })
                    }
                    style={{ fontSize: "1rem", flex: "1 1 auto" }}
                  />
                  <CButton
                    color="success"
                    onClick={handleAddIngredient}
                    style={{ fontSize: "1rem" }}
                  >
                    <PlusCircle size={20} className="me-1" />{t(`LABELS.add`)}
                  </CButton>
                </div>
              </div>
 
              {/* Table with column headers */}
              <CTable hover style={{ margin: "0" }} responsive borderless>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #dee2e6" }}>{t(`LABELS.ingredient`)}</CTableHeaderCell>
                    <CTableHeaderCell style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #dee2e6" }}>{`${t('LABELS.quantity')} (${t('LABELS.kg')})`}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow style={{ borderLeft: "4px solid #20c997" }}>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{t(`LABELS.milkPowder`)}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>10.50</CTableDataCell>
                  </CTableRow>
                  <CTableRow style={{ borderLeft: "4px solid #ffc107" }}>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{t(`LABELS.sugar`)}</CTableDataCell>
                    <CTableDataCell style={{ padding: "0.75rem 1rem" }}>5.25</CTableDataCell>
                  </CTableRow>
                  {ingredients.map((ingredient, index) => (
                    <CTableRow key={index} style={{ borderLeft: "4px solid #6610f2" }}>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{ingredient.name}</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{ingredient.quantity.toFixed(2)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </div>
 
          {/* SECTION: Packaging Material */}
          <div className="mb-4">
            {/* Packaging Materials Table */}
            <div className="table-responsive">
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #dee2e6" }}>
                {/* Green header with button */}
                <div style={{
                  backgroundColor: "#20c997",
                  color: "white",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ fontWeight: "600", fontSize: "1.25rem" }}>{t(`LABELS.PackagingMaterial`)}</span>
                  <CButton
                    color="light"
                    onClick={() => setShowPackagingModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <Package size={18} />{t(`LABELS.PackagingData`)}    
                  </CButton>
                </div>
 
                {/* Table with column headers */}
                <CTable hover style={{ margin: "0" }} responsive borderless>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #dee2e6" }}>{t(`LABELS.ingredients`)}</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #dee2e6" }}>{`${t('LABELS.quantity')} (${t('LABELS.pcs')})`}</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow style={{ borderLeft: "4px solid #fd7e14" }}>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{t(`LABELS.TetraPakCartons`)}</CTableDataCell> 
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          backgroundColor: "#17a2b8",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "30px",
                          display: "inline-block"
                        }}>
                          1500
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow style={{ borderLeft: "4px solid #20c997" }}>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{t(`LABELS.HDPEPlasticBottles`)}</CTableDataCell> 
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "30px",
                          display: "inline-block"
                        }}>
                          850
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow style={{ borderLeft: "4px solid #dc3545" }}>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>{t(`LABELS.PETBottle`)}s</CTableDataCell>
                      <CTableDataCell style={{ padding: "0.75rem 1rem" }}>
                        <span style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "30px",
                          display: "inline-block"
                        }}>
                          2300
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>
            </div>
          </div>
 
          {/* Packaging Data Modal */}
          <CModal
            visible={showPackagingModal}
            onClose={() => setShowPackagingModal(false)}
            backdrop="static"
            size="lg"
          >
            <CModalHeader closeButton>
              <CModalTitle>Packaging Data</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow className="mb-3">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel htmlFor="packagingType">Packaging Type</CFormLabel>
                  <CFormSelect
                    id="packagingType"
                    value={packagingData.packagingType}
                    onChange={(e) => setPackagingData({...packagingData, packagingType: e.target.value})}
                  >
                    <option value="">Select packaging type</option>
                    <option value="glass">Glass Bottles</option>
                    <option value="plastic">Plastic Bottles</option>
                    <option value="carton-gable">Cartons (Gable-Top)</option>
                    <option value="carton-brick">Cartons (Brick-Type)</option>
                    <option value="pouch">Pouches</option>
                    <option value="tub">Tubs</option>
                    <option value="can">Cans</option>
                    <option value="tetra-pack">Tetra-Packs</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="packagingQuantity">Quantity</CFormLabel>
                  <CFormInput
                    id="packagingQuantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={packagingData.quantity}
                    onChange={(e) => setPackagingData({...packagingData, quantity: e.target.value})}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel htmlFor="packagingSupplier">Supplier</CFormLabel>
                  <CFormInput
                    id="packagingSupplier"
                    placeholder="Enter supplier name"
                    value={packagingData.supplier}
                    onChange={(e) => setPackagingData({...packagingData, supplier: e.target.value})}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="packagingExpiry">Expiry Date</CFormLabel>
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
                Cancel
              </CButton>
              <CButton color="primary" onClick={handlePackagingDataSubmit}>
                Save
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
