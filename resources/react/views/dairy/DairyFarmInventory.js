import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CProgress,
  CContainer,
  CButton,
  CProgressBar
} from '@coreui/react'; 
import { CChart } from '@coreui/react-chartjs';
import { useTranslation } from 'react-i18next'
 
const DairyFarmInventory = () => {
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  // Stock data from the handwritten notes
  const [tanks] = useState([
    { id: 1, name: t('LABELS.tank') + " 1", current: 250, capacity: 500, percentage: 50 },
    { id: 2, name: t('LABELS.tank')+ " 2", current: 400, capacity: 500, percentage: 80 },
    { id: 3, name: t('LABELS.tank')+ " 3", current: 200, capacity: 200, percentage: 100 },
    { id: 4, name: t('LABELS.tank')+ " 4", current: 100, capacity: 100, percentage: 100 }
  ]);
 
  const [ingredients] = useState([
    { id: 1, name: t('LABELS.sugar'), quantity: 50, unit: t('LABELS.kg'), percentage: 83 },
    { id: 2, name: t('LABELS.salt'), quantity: 20, unit: t('LABELS.kg'), percentage: 67 },
    { id: 3, name: t('LABELS.foodColor'), quantity: 10, unit: t('LABELS.kg'), percentage: 50 },
    { id: 4, name: t('LABELS.other'), quantity: 5, unit: t('LABELS.kg'), percentage: 25 }
  ]);
 
  const [products] = useState([
    {
      name: t('PRODUCTS.paneer'),
      sizes: [
        { weight: '200', quantity: 20, percentage: 40 },
        { weight: '500', quantity: 50, percentage: 62 },
        { weight: '100', quantity: 30, percentage: 75 },
        { weight: '1000', quantity: 100, percentage: 90 }
      ]
    },
    {
      name: t('PRODUCTS.dahi'),
      sizes: [
        { weight: '85', quantity: 20, percentage: 40 },
        { weight: '400', quantity: 30, percentage: 60 },
        { weight: '200', quantity: 50, percentage: 83 },
        { weight: '500', quantity: 70, percentage: 70 }
      ]
    }
  ]);
 
  const [pouchMaterials] = useState([
    { weight: '200', quantity: 50, unit: t('LABELS.pcs'), percentage: 50 },
    { weight: '500', quantity: 20, unit: t('LABELS.pcs'), percentage: 40 },
    { weight: '1000', quantity: 10, unit: t('LABELS.pcs'), percentage: 33 },
    { weight: '200', quantity: 20, unit: t('LABELS.pcs'), percentage: 66 }
  ]);
 
  // Color palette with more distinct colors
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
    titleBackground: '#E6E9F5' // Light blue/lavender background like in the image
  };
 
  // Function to get status text
  const getStatusText = (percentage) => {
    if (percentage <= 25) return t('LABELS.lowstock');
    if (percentage <= 50) return t('LABELS.Moderate');
    if (percentage <= 75) return t('LABELS.Adequate');
    return t('LABELS.good');
  };
 
  return (
    <>
      {/* Tanks Section */}
      <CCard className="mb-2 mt-0">
        <CCardHeader style={{ backgroundColor: '#d4edda', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.Storage_Tanks')}</h5>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: '8px' }}>
          <CRow className="g-1">
            {tanks.map((tank) => (
              <CCol xs={12} sm={6} lg={3} key={tank.id} className="mb-1">
                <CCard className="h-100">
                  <CCardBody style={{ padding: '8px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      {/* Tank Info */}
                      <div style={{ flex: 1 }}>
                        <h5 className="mb-1">{tank.name}</h5>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: colorPalette.textPrimary,
                          marginBottom: '2px'
                        }}>
                          {tank.current} / {tank.capacity} {t('LABELS.Ltr')}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: tank.percentage <= 25 ? colorPalette.danger :
                                tank.percentage <= 50 ? colorPalette.warning :
                                tank.percentage <= 75 ? colorPalette.info : colorPalette.success
                        }}>
                          {tank.percentage}% {t('LABELS.full')}
                        </div>
                      </div>

                      {/* Level Bar */}
                      <div className="ms-2">
                        <div style={{
                          height: '70px',
                          width: '25px',
                          backgroundColor: '#eee',
                          position: 'relative',
                          borderRadius: '5px',
                          border: '1px solid #ccc'
                        }}>
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${tank.percentage}%`,
                            backgroundColor: '#3498DB',
                            borderRadius: '0 0 5px 5px'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
 
      {/* Ingredients Section */}
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: '#d6eaff', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.ingredients')}</h5>
          </div>
        </CCardHeader>

        <CCardBody style={{ padding: '8px' }}>
          <CRow className="g-1">
            {ingredients.map((ingredient) => (
              <CCol xs={12} sm={6} md={6} lg={4} xl={3} key={ingredient.id} className="mb-1">
                <CCard className="h-100">
                  <CCardBody style={{ padding: '8px' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      
                      {/* Left: Ingredient Info */}
                      <div>
                        <h5 className="mb-1">{ingredient.name}</h5>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: colorPalette.textPrimary,
                          marginBottom: '2px'
                        }}>
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: ingredient.percentage <= 25 ? colorPalette.danger :
                                ingredient.percentage <= 50 ? colorPalette.warning :
                                ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success
                        }}>
                          {ingredient.percentage}% {t('LABELS.available')}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          padding: '1px 6px',
                          backgroundColor: ingredient.percentage <= 25 ? colorPalette.danger :
                                          ingredient.percentage <= 50 ? colorPalette.warning :
                                          ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success,
                          color: 'white',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {getStatusText(ingredient.percentage)}
                        </div>
                      </div>

                      {/* Right: Circular Level Bar */}
                      <div>
                        <div style={{
                          backgroundColor: '#eee',
                          height: '60px',
                          width: '60px',
                          borderRadius: '50%',
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid #ccc'
                        }}>
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${ingredient.percentage}%`,
                            backgroundColor: '#6C5B7B',
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
 
      {/* Products Section */}
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: '#f9f5d7', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.product')}</h5>
          </div>
        </CCardHeader>
        <CCardBody style={{ padding: '8px' }}>
          <CRow className="g-1">
            {products.map((product, index) => (
              <CCol xs={12} md={6} key={index} className="mb-1">
                <div style={{ border: '1px solid #eee', borderRadius: '6px', padding: '8px' }}>
                  <h5 className="mb-1" style={{ borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                    {product.name}
                  </h5>
                  <CTable hover responsive size="sm" className="mb-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>{t('LABELS.size')}</CTableHeaderCell>
                        <CTableHeaderCell>{t('LABELS.productQty')}</CTableHeaderCell> 
                        <CTableHeaderCell>{t('LABELS.level')}</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {product.sizes.map((size, sizeIndex) => (
                        <CTableRow key={sizeIndex}>
                          <CTableDataCell>
                            <strong>{size.weight} {t('LABELS.g')}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <strong style={{ fontSize: '14px' }}>{size.quantity} {t('LABELS.pcs')}</strong>
                          </CTableDataCell>
                          <CTableDataCell style={{ width: '40%' }}>
                            <div style={{ height: '24px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${size.percentage}%`,
                                  height: '100%',
                                  backgroundColor:
                                    size.percentage <= 25
                                      ? '#dc3545' // danger
                                      : size.percentage <= 50
                                      ? '#ffc107' // warning
                                      : size.percentage <= 75
                                      ? '#17a2b8' // info
                                      : '#28a745', // success
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  transition: 'width 0.4s ease',
                                }}
                              >
                                {size.percentage}%
                              </div>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
      
      {/* Pouch Materials Section */}
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: '#f8d7da', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.packaging_material')}</h5>
          </div>
        </CCardHeader>
        <CCardBody style={{ padding: '8px' }}>
          <CRow className="g-1">
            {pouchMaterials.map((material, index) => (
              <CCol xs={12} md={6} lg={3} key={index} className="mb-1">
                <CCard className="h-100">
                  <CCardBody style={{ padding: '8px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      {/* Text Info */}
                      <div>
                        <h5 className="mb-1">{material.weight} {t('LABELS.g')}</h5>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: colorPalette.textPrimary,
                          marginBottom: '2px'
                        }}>
                          {material.quantity} {material.unit}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: material.percentage <= 25 ? colorPalette.danger :
                                material.percentage <= 50 ? colorPalette.warning :
                                material.percentage <= 75 ? colorPalette.info : colorPalette.success
                        }}>
                          {material.percentage}% {t('LABELS.available')}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          padding: '1px 6px',
                          backgroundColor: material.percentage <= 25 ? colorPalette.danger :
                                          material.percentage <= 50 ? colorPalette.warning :
                                          material.percentage <= 75 ? colorPalette.info : colorPalette.success,
                          color: 'white',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {getStatusText(material.percentage)}
                        </div>
                      </div>

                      {/* Level Bar */}
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: '#eee',
                        height: '60px',
                        width: '60px',
                        borderRadius: '50%',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid #ccc'
                      }}>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: `${material.percentage}%`,
                          backgroundColor: '#F39C12',
                        }}></div>
                      </div>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>
    </>
  );
};
 
export default DairyFarmInventory;