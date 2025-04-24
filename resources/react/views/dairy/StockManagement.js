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
import { PlusCircle, Plus, Edit, Trash2, Save, X } from "lucide-react";

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
    { id: 1, name: t('LABELS.sugar'), quantity: 10.50, unit:t('LABELS.kg'), date: '25 Oct 2024', updatedby:'Ajinkya', addQuantity: 0 },
    { id: 2, name: t('LABELS.foodColor'), quantity: 5.25, unit: t('LABELS.kg'), date: '10 Nov 2024', updatedby:'Vishal', addQuantity: 0 },
  ]);

  // Updated packaging materials state without isEditing property
  const [packagingMaterials, setPackagingMaterials] = useState([
    { id: 1, name: t('LABELS.tetraPack'), quantity: 1500, date: '10 Apr 2025', updatedby:'Samir', addQuantity: 0 },
    { id: 2, name: t('LABELS.can'), quantity: 850, date: '14 Jan 2025', updatedby:'Abhijeet', addQuantity: 0 },
    { id: 3, name: t('LABELS.tub'), quantity: 2300, date: '01 Feb 2025', updatedby:'Shubham', addQuantity: 0 },
  ]);

  const [showPackagingModal, setShowPackagingModal] = useState(false);
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

  // New function to handle adding quantity to ingredients
  const handleAddIngredientQuantity = (id, addQuantity) => {
    if (!addQuantity || isNaN(addQuantity) || Number(addQuantity) <= 0) {
      alert(t('LABELS.enterValidQuantity'));
      return;
    }

    setIngredients(
      ingredients.map((ingredient) => {
        if (ingredient.id === id) {
          const newQuantity = Number(ingredient.quantity) + Number(addQuantity);
          return {
            ...ingredient,
            quantity: newQuantity,
            addQuantity: 0, // Reset add quantity input
          };
        }
        return ingredient;
      })
    );
  };

  // New function to handle adding quantity to packaging materials
  const handleAddPackagingQuantity = (id, addQuantity) => {
    if (!addQuantity || isNaN(addQuantity) || Number(addQuantity) <= 0) {
      alert(t('LABELS.enterValidQuantity'));
      return;
    }

    setPackagingMaterials(
      packagingMaterials.map((material) => {
        if (material.id === id) {
          const newQuantity = Number(material.quantity) + Number(addQuantity);
          return {
            ...material,
            quantity: newQuantity,
            addQuantity: 0, // Reset add quantity input
          };
        }
        return material;
      })
    );
  };

  // Handle input change for add quantity fields in ingredients
  const handleIngredientAddQuantityChange = (id, value) => {
    setIngredients(
      ingredients.map((ingredient) => {
        if (ingredient.id === id) {
          return {
            ...ingredient,
            addQuantity: value,
          };
        }
        return ingredient;
      })
    );
  };

  // Handle input change for add quantity fields in packaging materials
  const handlePackagingAddQuantityChange = (id, value) => {
    setPackagingMaterials(
      packagingMaterials.map((material) => {
        if (material.id === id) {
          return {
            ...material,
            addQuantity: value,
          };
        }
        return material;
      })
    );
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
      padding: "0.15rem 0.5rem",
      borderRadius: "20px",
      display: "inline-block"
    };
  };

  // Common table styles - reduced padding
  const tableContainerStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "0.25rem",
    overflow: "hidden",
    marginBottom: "0.75rem"
  };

  // Updated tableHeaderStyle with custom widths for specific columns
  const tableHeaderStyle = {
    backgroundColor: "#f8f9fa",
    padding: "0.4rem 0.5rem",
    fontWeight: "600",
    fontSize: "0.9rem",
    borderBottom: "1px solid #dee2e6"
  };

  // Special styles for Add Quantity and Action columns - reduced padding and width
  const compactColumnStyle = {
    ...tableHeaderStyle,
    padding: "0.4rem 0.2rem",
    width: "80px" // Constraining the width
  };

  // Reduced header style for the main sections
  const reducedHeaderStyle = {
    fontWeight: "600",
    fontSize: "1rem"
  };

  // Reduced card header style for main component
  const mainCardHeaderStyle = {
    backgroundColor: "#E6E6FA",
    fontSize: "1.1rem",
    fontWeight: "600",
    padding: "0"
  };

  // Action button styles - made more compact
  const actionButtonStyle = {
    padding: "0.15rem 0.3rem",
    marginRight: "0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  };

  // Compact cell style for Add Quantity and Action columns
  const compactCellStyle = {
    padding: "0.35rem 0.2rem",
    fontSize: "0.9rem"
  };

  // Normal cell style for other columns
  const normalCellStyle = {
    padding: "0.35rem 0.5rem",
    fontSize: "0.9rem"
  };

  return (
    <CContainer fluid className="p-0">
      <CCard className="p-0">
        <CCardHeader className="py-0 px-2" style={{ backgroundColor: "#E6E6FA" }}>
          <h2 style={{
            ...mainCardHeaderStyle,
            margin: "0.2rem 0"
          }}>
            {t('LABELS.stockManagement')}
          </h2>
        </CCardHeader>
        <CCardBody className="p-1">
          {/* SECTION: Tank Capacity */}
          <div className="mb-1">
            <CRow className="g-1">
              {tanks.map((tank, index) => {
                if (index > 2) return null; // Only show 3 tanks as in the image
                const fillPercentage = calculateFillPercentage(tank.current, tank.capacity);
                const barColor = getProgressBarColor(fillPercentage);

                return (
                  <CCol sm={4} key={tank.id}>
                    <CCard className="mb-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <CCardHeader className="py-1 px-2" style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{t('LABELS.tank')} {tank.id}</div>
                      </CCardHeader>
                      <CCardBody className="p-2">
                        <div className="mb-2">
                          <div className="mb-1">
                            <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>
                            {t('LABELS.currentCapacity')}: {tank.current} / {tank.capacity} {t('LABELS.Ltr')}
                            </span>
                          </div>
                          <div style={{ backgroundColor: "#e9ecef", height: "20px", borderRadius: "0.25rem", position: "relative", overflow: "hidden" }}>
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
                                fontWeight: "bold",
                                fontSize: "0.8rem"
                              }}
                            >
                              {fillPercentage}%
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-1 mt-2">
                          <CFormInput
                            type="number"
                            placeholder={t('LABELS.addQuantity')}
                            className="py-1 px-2"
                            id={`tank-${tank.id}-input`}
                            style={{ fontSize: "0.9rem" }}
                          />
                          <CButton
                            color="primary"
                            className="py-1 px-2"
                            style={{ fontSize: "0.9rem", fontWeight: "bold" }}
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

          {/* SECTION: Ingredients - With Add Quantity column */}
          <div className="mb-2" style={tableContainerStyle}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#d6eaff",
              padding: "0.25rem 0.5rem",
              borderBottom: "1px solid #dee2e6"
            }}>
              <span style={reducedHeaderStyle}>{t(`LABELS.ingredient`)}</span>
            </div>

            <CTable hover style={{ margin: "0" }} responsive>
              <CTableHead style={{ backgroundColor: "#f8f9fa" }}>
                <CTableRow>
                  <CTableHeaderCell style={tableHeaderStyle}>{t(`LABELS.ingredient`)}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.quantity')}</CTableHeaderCell>
                  <CTableHeaderCell style={compactColumnStyle}>{t('LABELS.addRawQuantity')}</CTableHeaderCell>
                  <CTableHeaderCell style={compactColumnStyle}>{t('LABELS.action')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.lastUpdatedDate')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.updatedby')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {ingredients.map((ingredient, index) => (
                  <CTableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <CTableDataCell style={normalCellStyle}>
                      {ingredient.name}
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      <span style={getBadgeStyle(index)}>
                        {ingredient.quantity.toFixed(2)} {ingredient.unit}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell style={compactCellStyle}>
                      <CFormInput
                        type="number"
                        value={ingredient.addQuantity || ""}
                        onChange={(e) => handleIngredientAddQuantityChange(ingredient.id, e.target.value)}
                        size="sm"
                        style={{ width: "70px" }}
                      />
                    </CTableDataCell>
                    <CTableDataCell style={compactCellStyle}>
                      <CButton
                        color="primary"
                        size="sm"
                        style={actionButtonStyle}
                        onClick={() => handleAddIngredientQuantity(ingredient.id, ingredient.addQuantity)}
                      >
                        {t('LABELS.add')}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      {ingredient.date}
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      {ingredient.updatedby}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* SECTION: Packaging Material - With Add Quantity column */}
          <div className="mb-2" style={tableContainerStyle}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8d7da",
              padding: "0.25rem 0.5rem",
              borderBottom: "1px solid #dee2e6"
            }}>
              <span style={reducedHeaderStyle}>{t(`LABELS.PackagingMaterial`)}</span>
            </div>

            <CTable hover style={{ margin: "0" }} responsive>
              <CTableHead style={{ backgroundColor: "#f8f9fa" }}>
                <CTableRow>
                  <CTableHeaderCell style={tableHeaderStyle}>{t(`LABELS.ingredients`)}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{`${t('LABELS.quantity')} (${t('LABELS.pcs')})`}</CTableHeaderCell>
                  <CTableHeaderCell style={compactColumnStyle}>{t('LABELS.addRawQuantity')}</CTableHeaderCell>
                  <CTableHeaderCell style={compactColumnStyle}>{t('LABELS.action')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.lastUpdatedDate')}</CTableHeaderCell>
                  <CTableHeaderCell style={tableHeaderStyle}>{t('LABELS.updatedby')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {packagingMaterials.map((material, index) => (
                  <CTableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <CTableDataCell style={normalCellStyle}>
                      {material.name}
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      <span style={getBadgeStyle(index)}>
                        {material.quantity}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell style={compactCellStyle}>
                      <CFormInput
                        type="number"
                        value={material.addQuantity || ""}
                        onChange={(e) => handlePackagingAddQuantityChange(material.id, e.target.value)}
                        size="sm"
                        style={{ width: "70px" }}
                      />
                    </CTableDataCell>
                    <CTableDataCell style={compactCellStyle}>
                      <CButton
                        color="primary"
                        size="sm"
                        style={actionButtonStyle}
                        onClick={() => handleAddPackagingQuantity(material.id, material.addQuantity)}
                      >
                        {t('LABELS.add')}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      {material.date}
                    </CTableDataCell>
                    <CTableDataCell style={normalCellStyle}>
                      {material.updatedby}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

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
              <CRow className="mb-2">
                <CCol md={6} className="mb-2 mb-md-0">
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
                    placeholder={t('LABELS.addRawQuantity')}
                    value={packagingData.quantity}
                    onChange={(e) => setPackagingData({...packagingData, quantity: e.target.value})}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6} className="mb-2 mb-md-0">
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
