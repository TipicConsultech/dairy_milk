import React, { useState } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
//   CInput,
//   CSelect,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from "@coreui/react";
import { CFormInput, CFormSelect  } from '@coreui/react';
import { useTranslation } from 'react-i18next'


import { PlusCircle } from "lucide-react";

const StockManagement = () => {
  const [tanks, setTanks] = useState([
    { id: 1, name: "Tank 1", capacity: 500, current: 500 },
    { id: 2, name: "Tank 2", capacity: 300, current: 300 },
  ]);

  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
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

  return (
    <div className="p-0">
      <CCard className="p-4">
        <CCardHeader className="bg-light-purple text-dark" style={{ backgroundColor: "#E6E6FA" }}>
          <h2>{t('LABELS.stockManagement')}</h2>
        </CCardHeader>
        <CCardBody>
          {/* Tanks Section */}
          <div className="mb-4">
            {/* <h3>{t('LABELS.tank')}</h3> */}
            {tanks.map((tank) => (
              <CCard key={tank.id} className="mb-3">

               <CCardBody className="d-flex justify-content-between align-items-center p-2 gap-2">
  <div className="d-flex align-items-center gap-1">
    <strong className="text-lg"><h5>{t(`LABELS.tank`)} {tank.id}</h5></strong> -{" "}   
    <span className="text-base"> <h5>{tank.current} / {tank.capacity} {t('LABELS.Ltr')}</h5></span>
  </div>
  <div className="d-flex gap-1">
    <CFormInput  
      type="number"
      placeholder={`${t('LABELS.addQuantity')}`}
      className="py-1 px-2"
      id={`tank-${tank.id}-input`}
    />
    <CButton
      color="primary"
      className="py-1 px-2 d-flex align-items-center"
      onClick={() => {
        const input = document.getElementById(`tank-${tank.id}-input`);
        handleTankAddQuantity(tank.id, input.value);
        input.value = "";
      }}
    >
      <PlusCircle size={16} className="me-1" /> {t('LABELS.add')}
    </CButton>
  </div>
</CCardBody>

              </CCard>
            ))}
          </div>

          {/* Ingredients Section */}
          <div>
            <h3>{t('LABELS.ingredient')}</h3>
            <div className="d-flex gap-2 mb-3">
              <CFormSelect
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
              >
                <option value="">{t('LABELS.selectIngredient')}</option> 
                <option value="sugar">{t('LABELS.sugar')}</option>
                <option value="salt">{t('LABELS.salt')}</option>
                <option value="food-color">{t('LABELS.foodColor')}</option>
                <option value="other">{t('LABELS.other')}</option>
              </CFormSelect>
              <CFormInput
                type="number"
                placeholder={t('LABELS.quantityKg')}
                value={newIngredient.quantity}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, quantity: e.target.value })
                }
              />
              <CButton color="success" onClick={handleAddIngredient}>
                <PlusCircle size={20} /> {t('LABELS.add')}
              </CButton>
            </div>

            <CTable striped bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{t('LABELS.ingredient')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('LABELS.quantityKg')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>



                {/* Hardcoded Dummy Data */}
    <CTableRow>
      <CTableDataCell>{t('LABELS.milkPowder')}</CTableDataCell>
      <CTableDataCell>10.50</CTableDataCell>
    </CTableRow>
    <CTableRow>
      <CTableDataCell>{t('LABELS.sugar')}</CTableDataCell>
      <CTableDataCell>5.25</CTableDataCell>
    </CTableRow>



                {ingredients.map((ingredient, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{ingredient.name}</CTableDataCell>
                    <CTableDataCell>{ingredient.quantity.toFixed(2)}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default StockManagement;
