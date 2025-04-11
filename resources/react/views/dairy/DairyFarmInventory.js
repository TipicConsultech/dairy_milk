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
     {/* <CCard className=""> */}
    {/* <CContainer fluid style={{ backgroundColor: colorPalette.background, padding: '20px' }}> */}
      {/* Title with styling matching the image */}
      {/* <CRow className="mb-4">
        <CCol md={12} style={{ padding: 0 }}>
          <div style={{
            backgroundColor: colorPalette.titleBackground,
            padding: '15px 20px',
            marginBottom: '20px',
            width: '100%'
          }}>
            <h1 style={{
              color: colorPalette.textPrimary,
              margin: 0,
              fontWeight: '500',
              fontSize: '24px'
            }}>
              Dairy Farm Inventory Management
            </h1>
          </div>
        </CCol>
      </CRow> */}



            {/* <CCardHeader className='mb-4'  style={{ backgroundColor: "#E6E6FA" }}>
           <h2> {t('LABELS.Dairy_Farm_Inventory_Management')} </h2> 
            </CCardHeader> */}




 
      {/* Tanks Section */}
      <CCard className="mb-3 mt-0">
        <CCardHeader style={{ backgroundColor: '#d4edda'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0" >{t('LABELS.Storage_Tanks')} </h5> 
            {/* <CButton color="primary" size="sm">View All</CButton> */}
          </div>
        </CCardHeader>
        {/* <CCardBody>
          <CRow>
            {tanks.map((tank) => (
              <CCol md={3} key={tank.id} className="mb-3">
                <CCard className="h-100">
                  <CCardBody>
                    <div className="text-center mb-2">
                      <h5>{tank.name}</h5>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: colorPalette.textPrimary,
                        marginBottom: '5px'
                      }}>
                        {tank.current} / {tank.capacity} {t('LABELS.Ltr')}
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: tank.percentage <= 25 ? colorPalette.danger :
                               tank.percentage <= 50 ? colorPalette.warning :
                               tank.percentage <= 75 ? colorPalette.info : colorPalette.success
                      }}>
                        {tank.percentage}% {t('LABELS.full')}
                      </div>
                    </div>
                    <div className="text-center my-3">
                      <div style={{
                        height: '80px',
                        width: '60px',
                        margin: '0 auto',
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
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody> */}

<CCardBody>
  <CRow>
    {tanks.map((tank) => (
      <CCol xs={12} sm={6} lg={3} key={tank.id} className="mb-1">
        <CCard className="h-100">
          <CCardBody>
            <div className="d-flex align-items-center justify-content-between">
              {/* Tank Info */}
              <div style={{ flex: 1 }}>
                <h5>{tank.name}</h5>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: colorPalette.textPrimary,
                  marginBottom: '5px'
                }}>
                  {tank.current} / {tank.capacity} {t('LABELS.Ltr')}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: tank.percentage <= 25 ? colorPalette.danger :
                         tank.percentage <= 50 ? colorPalette.warning :
                         tank.percentage <= 75 ? colorPalette.info : colorPalette.success
                }}>
                  {tank.percentage}% {t('LABELS.full')}
                </div>
              </div>

              {/* Level Bar */}
              <div className="ms-4">
                <div style={{
                  height: '100px',
                  width: '30px',
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
 
      {/* Ingredients Section - Changed to cards */}
      <CCard className="mb-3">
        <CCardHeader style={{ backgroundColor: '#d6eaff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.ingredients')}</h5> 
            {/* <CButton color="primary" size="sm">View All</CButton> */}
          </div>
        </CCardHeader>
        {/* <CCardBody>
          <CRow>
            {ingredients.map((ingredient) => (
              <CCol md={3} key={ingredient.id} className="mb-3">
                <CCard className="h-100">
                  <CCardBody>
                    <div className="text-center mb-2">
                      <h5>{ingredient.name}</h5>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: colorPalette.textPrimary,
                        marginBottom: '5px'
                      }}>
                        {ingredient.quantity} {ingredient.unit}
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: ingredient.percentage <= 25 ? colorPalette.danger :
                               ingredient.percentage <= 50 ? colorPalette.warning :
                               ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success
                      }}>
                        {ingredient.percentage}% {t('LABELS.available')}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        padding: '2px 8px',
                        backgroundColor: ingredient.percentage <= 25 ? colorPalette.danger :
                                         ingredient.percentage <= 50 ? colorPalette.warning :
                                         ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success,
                        color: 'white',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginTop: '5px'
                      }}>
                        {getStatusText(ingredient.percentage)}
                      </div>
                    </div>
                    <div className="text-center mb-3">
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: '#eee',
                        height: '80px',
                        width: '80px',
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
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </CCardBody> */}

<CCardBody>
  <CRow>
    {ingredients.map((ingredient) => (
      <CCol xs={12} sm={6} md={6} lg={4} xl={3} key={ingredient.id} className="mb-1">
        <CCard className="h-100">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center">
              
              {/* Left: Ingredient Info */}
              <div>
                <h5 className="mb-2">{ingredient.name}</h5>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: colorPalette.textPrimary,
                  marginBottom: '5px'
                }}>
                  {ingredient.quantity} {ingredient.unit}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: ingredient.percentage <= 25 ? colorPalette.danger :
                         ingredient.percentage <= 50 ? colorPalette.warning :
                         ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success
                }}>
                  {ingredient.percentage}% {t('LABELS.available')}
                </div>
                <div style={{
                  fontSize: '14px',
                  padding: '2px 8px',
                  backgroundColor: ingredient.percentage <= 25 ? colorPalette.danger :
                                   ingredient.percentage <= 50 ? colorPalette.warning :
                                   ingredient.percentage <= 75 ? colorPalette.info : colorPalette.success,
                  color: 'white',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '5px'
                }}>
                  {getStatusText(ingredient.percentage)}
                </div>
              </div>

              {/* Right: Circular Level Bar */}
              <div>
                <div style={{
                  backgroundColor: '#eee',
                  height: '80px',
                  width: '80px',
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
      <CCard className="mb-3">
        <CCardHeader style={{ backgroundColor: '#f9f5d7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.product')}</h5>
            {/* <CButton color="primary" size="sm">View All</CButton> */}
          </div>
        </CCardHeader>
        <CCardBody>
  <CRow>
    {products.map((product, index) => (
      <CCol xs={12} md={6} key={index} className="mb-1">
        <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
          <h5 className="mb-3" style={{ borderBottom: '2px solid #eee', paddingBottom: '5px' }}>
            {product.name}
          </h5>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>{t('LABELS.size')}</CTableHeaderCell>
                <CTableHeaderCell>{t('LABELS.productQty')}</CTableHeaderCell> 
                <CTableHeaderCell>{t('LABELS.percentage')}</CTableHeaderCell>
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
                    <strong style={{ fontSize: '16px' }}>{size.quantity} {t('LABELS.pcs')}</strong>
                  </CTableDataCell>
                  {/* <CTableDataCell>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: size.percentage <= 25 ? colorPalette.danger :
                             size.percentage <= 50 ? colorPalette.warning :
                             size.percentage <= 75 ? colorPalette.info : colorPalette.success
                    }}>
                      {size.percentage}%
                    </span>
                  </CTableDataCell> */}
                  {/* <CTableDataCell style={{ width: '30%' }}>
                    <CProgress
                      value={size.percentage}
                      color={size.percentage <= 25 ? 'danger' :
                             size.percentage <= 50 ? 'warning' :
                             size.percentage <= 75 ? 'info' : 'success'}
                      style={{ height: '20px' }}
                    />
                  </CTableDataCell> */}

{/* <CTableDataCell style={{ width: '30%' }}>
                    <CProgress style={{ height: '50px' }}>
                      <CProgressBar
                        value={size.percentage}
                        color={size.percentage <= 25 ? 'danger' :
                               size.percentage <= 50 ? 'warning' :
                               size.percentage <= 75 ? 'info' : 'success'}
                        animated
                        striped
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: 'white',
                          lineHeight: '1',
                        
                        }}
                      >
                        {size.percentage}%
                      </CProgressBar>
                    </CProgress>
                  </CTableDataCell> */}
 <CTableDataCell style={{ width: '40%' }}>
  <div style={{ height: '30px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
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
        fontSize: '12px',
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
      
 
      {/* Pouch Materials Section - Changed to cards */}
      <CCard className="mb-3">
        <CCardHeader style={{ backgroundColor: '#f8d7da' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">{t('LABELS.packaging_material')}</h5> 
            {/* <CButton color="primary" size="sm">View All</CButton> */}
          </div>
        </CCardHeader>
        <CCardBody>
  <CRow>
    {pouchMaterials.map((material, index) => (
      <CCol xs={12} md={6} lg={3} key={index} className="mb-3">
        <CCard className="h-100">
          <CCardBody>
            <div className="d-flex align-items-center justify-content-between">
              {/* Text Info */}
              <div>
                <h5>{material.weight} {t('LABELS.g')}</h5>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: colorPalette.textPrimary,
                  marginBottom: '5px'
                }}>
                  {material.quantity} {material.unit}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: material.percentage <= 25 ? colorPalette.danger :
                        material.percentage <= 50 ? colorPalette.warning :
                        material.percentage <= 75 ? colorPalette.info : colorPalette.success
                }}>
                  {material.percentage}% {t('LABELS.available')}
                </div>
                <div style={{
                  fontSize: '14px',
                  padding: '2px 8px',
                  backgroundColor: material.percentage <= 25 ? colorPalette.danger :
                                   material.percentage <= 50 ? colorPalette.warning :
                                   material.percentage <= 75 ? colorPalette.info : colorPalette.success,
                  color: 'white',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '5px'
                }}>
                  {getStatusText(material.percentage)}
                </div>
              </div>

              {/* Level Bar */}
              <div style={{
                display: 'inline-block',
                backgroundColor: '#eee',
                height: '80px',
                width: '80px',
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
 
     
    {/* </CContainer> */}
    {/* </CCard> */}
    </>
  );
};
 
export default DairyFarmInventory;