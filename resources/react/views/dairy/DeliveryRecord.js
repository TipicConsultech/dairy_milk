// import React, { useState } from 'react';
// import axios from 'axios';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CInputGroup,
//   CInputGroupText,
//   CButton,
//   CRow,
//   CCol,
//   CContainer
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilSearch, cilMinus, cilPlus } from '@coreui/icons';

// const DeliveryForm = () => {
//   const [formData, setFormData] = useState({
//     customerName: '',
//     jar: 1,
//     emptyJar: 0,
//     coldDrinks: 0,
//     emptyColdDrinks: 0,
//     cashCollected: 0
//   });

//   const [rates, setRates] = useState({
//     jar: 30,
//     coldDrinks: 12
//   });

//   const calculateTotal = (item, quantity) => {
//     return rates[item] * quantity;
//   };

//   const totalAmount = calculateTotal('jar', formData.jar) + calculateTotal('coldDrinks', formData.coldDrinks);

//   const handleIncrement = (field) => {
//     setFormData({
//       ...formData,
//       [field]: formData[field] + 1
//     });
//   };

//   const handleDecrement = (field) => {
//     if (formData[field] > 0) {
//       setFormData({
//         ...formData,
//         [field]: formData[field] - 1
//       });
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData({
//       ...formData,
//       [field]: value
//     });
//   };

//   const handleRateChange = (item, value) => {
//     setRates({
//       ...rates,
//       [item]: parseFloat(value) || 0
//     });
//   };

//   const handleSubmit = () => {
//     console.log('Form submitted:', formData);

//     axios.post('http://your-laravel-backend.com/api/delivery-items', {
//       customerName: formData.customerName,
//       jar: formData.jar,
//       emptyJar: formData.emptyJar,
//       coldDrinks: formData.coldDrinks,
//       emptyColdDrinks: formData.emptyColdDrinks,
//       cashCollected: formData.cashCollected
//     })
//       .then(response => {
//         console.log('Delivery item created:', response.data);
//         alert('Delivery information submitted successfully!');
//       })
//       .catch(error => {
//         console.error('There was an error submitting the form!', error);
//         alert('Failed to submit delivery information!');
//       });
//   };

//   const handleClear = () => {
//     setFormData({
//       customerName: '',
//       jar: 0,
//       emptyJar: 0,
//       coldDrinks: 0,
//       emptyColdDrinks: 0,
//       cashCollected: 0
//     });
//   };

//   const styles = {
//     quantityButton: {
//       width: '38px',
//       height: '38px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: 0,
//       borderRadius: '4px'
//     },
//     sectionHeading: {
//       fontSize: '1.1rem',
//       fontWeight: 'bold',
//       color: '#5c6873',
//       marginBottom: '12px',
//       paddingBottom: '8px',
//       borderBottom: '1px solid #e4e7ea'
//     },
//     totalValue: {
//       fontSize: '1.25rem',
//       fontWeight: 'bold',
//       color: '#20a8d8',
//       padding: '10px 15px',
//       backgroundColor: '#f0f3f5',
//       borderRadius: '4px',
//       textAlign: 'right'
//     },
//     formSection: {
//       padding: '15px',
//       marginBottom: '20px',
//       backgroundColor: '#ffffff',
//       borderRadius: '4px',
//       boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
//     }
//   };

//   return (
//     <CContainer className="py-4">
//       <CCard className="border-0 shadow">
//         <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
//           <h4 className="mb-0">Delivery Form</h4>
//           <CButton color="light" className="text-primary">
//             <CIcon icon={cilPlus} className="me-1" /> New
//           </CButton>
//         </CCardHeader>
//         <CCardBody className="bg-light">
//           <CForm>
//             <div style={styles.formSection}>
//               <div style={styles.sectionHeading}>Customer Information</div>
//               <CRow className="mb-4">
//                 <CCol>
//                   <CInputGroup size="lg">
//                     <CFormInput
//                       placeholder="Customer Name"
//                       value={formData.customerName}
//                       onChange={(e) => handleInputChange('customerName', e.target.value)}
//                       className="border-end-0"
//                     />
//                     <CInputGroupText className="bg-white">
//                       <CIcon icon={cilSearch} />
//                     </CInputGroupText>
//                   </CInputGroup>
//                 </CCol>
//               </CRow>
//             </div>

//             <div style={styles.formSection}>
//               <div style={styles.sectionHeading}>Milk Packets Details</div>

//               {/* Carets Row */}
//               <CRow className="mb-3 align-items-center">
//                 <CCol xs={6}>
//                   <div className="d-flex align-items-center">
//                     <div className="me-3 fw-bold">Carets</div>
//                     <CInputGroup size="sm">
//                       <CButton
//                         color="danger"
//                         onClick={() => handleDecrement('jar')}
//                         style={styles.quantityButton}
//                         disabled={formData.jar <= 0}
//                       >
//                         <CIcon icon={cilMinus} />
//                       </CButton>
//                       <CFormInput
//                         type="number"
//                         className="text-center mx-1"
//                         value={formData.jar}
//                         min={0}
//                         max={10}
//                         onChange={(e) => {
//                           const value = parseInt(e.target.value) || 0;
//                           if (value <= 10) {
//                             handleInputChange('jar', value);
//                           }
//                         }}
//                         style={{ maxWidth: '60px' }}
//                       />
//                       <CButton
//                         color="success"
//                         onClick={() => {
//                           if (formData.jar < 10) {
//                             handleIncrement('jar');
//                           }
//                         }}
//                         style={styles.quantityButton}
//                         disabled={formData.jar >= 10}
//                       >
//                         <CIcon icon={cilPlus} />
//                       </CButton>
//                     </CInputGroup>
//                   </div>
//                 </CCol>
//                 <CCol xs={3}>
//                   <CFormInput
//                     type="number"
//                     value={rates.jar}
//                     onChange={(e) => handleRateChange('jar', e.target.value)}
//                     placeholder="Rate"
//                     size="sm"
//                   />
//                 </CCol>
//                 <CCol xs={3} className="text-end">
//                   <div style={styles.totalValue}>
//                     ₹ {calculateTotal('jar', formData.jar)}
//                   </div>
//                 </CCol>
//               </CRow>

//               {/* Customize Button */}
//               <CRow className="mb-3">
//                 <CCol xs={6}>
//                   <CButton color="info" variant="outline" onClick={() => alert('Customize clicked')}>
//                     Customize
//                   </CButton>
//                 </CCol>
//               </CRow>

//               {/* Empty Carets Field */}
//               <CRow className="mb-4 align-items-center">
//                 <CCol xs={6}>
//                   <div className="d-flex align-items-center">
//                     <div className="me-3 fw-bold">Empty Carets</div>
//                     <CInputGroup size="sm">
//                       <CButton
//                         color="danger"
//                         onClick={() => handleDecrement('emptyJar')}
//                         style={styles.quantityButton}
//                         disabled={formData.emptyJar <= 0}
//                       >
//                         <CIcon icon={cilMinus} />
//                       </CButton>
//                       <CFormInput
//                         type="number"
//                         className="text-center mx-1"
//                         value={formData.emptyJar}
//                         min={0}
//                         max={10}
//                         onChange={(e) => {
//                           const value = parseInt(e.target.value) || 0;
//                           if (value <= 10) {
//                             handleInputChange('emptyJar', value);
//                           }
//                         }}
//                         style={{ maxWidth: '60px' }}
//                       />
//                       <CButton
//                         color="success"
//                         onClick={() => {
//                           if (formData.emptyJar < 10) {
//                             handleIncrement('emptyJar');
//                           }
//                         }}
//                         style={styles.quantityButton}
//                         disabled={formData.emptyJar >= 10}
//                       >
//                         <CIcon icon={cilPlus} />
//                       </CButton>
//                     </CInputGroup>
//                   </div>
//                 </CCol>
//               </CRow>

//               <CRow className="mt-4">
//                 <CCol>
//                   <CButton color="primary" className="me-2" onClick={handleSubmit}>
//                     Submit
//                   </CButton>
//                   <CButton color="secondary" variant="outline" onClick={handleClear}>
//                     Clear
//                   </CButton>
//                 </CCol>
//               </CRow>
//             </div>
//           </CForm>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// export default DeliveryForm;


import React, { useState } from 'react';
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CButton,
  CAlert,
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilMinus, cilPlus, cilReload } from '@coreui/icons';

const DeliveryForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    jar: 1,
    emptyJar: 0,
    coldDrinks: 0,
    emptyColdDrinks: 0,
    cashCollected: 0
  });

  const [rates, setRates] = useState({
    jar: 30,
    coldDrinks: 12
  });

  const calculateTotal = (item, quantity) => {
    return rates[item] * quantity;
  };

  const totalAmount = calculateTotal('jar', formData.jar) + calculateTotal('coldDrinks', formData.coldDrinks);
  const balance = totalAmount - formData.cashCollected;

  const handleIncrement = (field) => {
    setFormData({
      ...formData,
      [field]: formData[field] + 1
    });
  };

  const handleDecrement = (field) => {
    if (formData[field] > 0) {
      setFormData({
        ...formData,
        [field]: formData[field] - 1
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleRateChange = (item, value) => {
    setRates({
      ...rates,
      [item]: parseFloat(value) || 0
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Delivery information submitted successfully!');
  };

  const handleClear = () => {
    setFormData({
      customerName: '',
      jar: 0,
      emptyJar: 0,
      coldDrinks: 0,
      emptyColdDrinks: 0,
      cashCollected: 0
    });
  };

  const styles = {
    quantityButton: {
      width: '38px',
      height: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      borderRadius: '4px'
    },
    sectionHeading: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#5c6873',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid #e4e7ea'
    },
    totalValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#20a8d8',
      padding: '10px 15px',
      backgroundColor: '#f0f3f5',
      borderRadius: '4px',
      textAlign: 'right'
    },
    formSection: {
      padding: '15px',
      marginBottom: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
    }
  };

  return (
    <CContainer className="py-4">
      <CCard className="border-0 shadow">
        <CCardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
          <h4 className="mb-0">Delivery Form</h4>
          <CButton color="light" className="text-primary">
            <CIcon icon={cilPlus} className="me-2" /> New
          </CButton>
        </CCardHeader>
        <CCardBody className="bg-light">
          <CForm>
            {/* Customer Information Section */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeading}>Customer Information</div>
              <CRow className="mb-4">
                <CCol>
                  <CInputGroup size="lg">
                    <CFormInput
                      placeholder="Customer Name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="border-end-0"
                    />
                    <CInputGroupText className="bg-white">
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
              </CRow>
            </div>

            {/* Milk Packets Details Section */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeading}>Milk Packets Details</div>

              {/* Carets Row */}
              <CRow className="mb-3 align-items-center">
                <CCol xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fw-bold" style={{width: '120px'}}>Carets</div>
                    <CInputGroup size="sm">
                      <CButton
                        color="danger"
                        onClick={() => handleDecrement('jar')}
                        style={styles.quantityButton}
                        disabled={formData.jar <= 0}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.jar}
                        min={0}
                        max={10}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value <= 10) {
                            handleInputChange('jar', value);
                          }
                        }}
                        style={{ maxWidth: '60px' }}
                      />
                      <CButton
                        color="success"
                        onClick={() => {
                          if (formData.jar < 10) {
                            handleIncrement('jar');
                          }
                        }}
                        style={styles.quantityButton}
                        disabled={formData.jar >= 10}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </CCol>
                <CCol xs={3}>
                  <CFormInput
                    type="number"
                    value={rates.jar}
                    onChange={(e) => handleRateChange('jar', e.target.value)}
                    placeholder="Rate"
                    size="sm"
                  />
                </CCol>
                <CCol xs={3} className="text-end">
                  <div style={styles.totalValue}>
                    ₹ {calculateTotal('jar', formData.jar)}
                  </div>
                </CCol>
              </CRow>

            

              {/* Empty Carets Field */}
              <CRow className="mb-4 align-items-center">
                <CCol xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fw-bold" style={{width: '120px'}}>Empty Carets</div>
                    <CInputGroup size="sm">
                      <CButton
                        color="danger"
                        onClick={() => handleDecrement('emptyJar')}
                        style={styles.quantityButton}
                        disabled={formData.emptyJar <= 0}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.emptyJar}
                        min={0}
                        max={10}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value <= 10) {
                            handleInputChange('emptyJar', value);
                          }
                        }}
                        style={{ maxWidth: '60px' }}
                      />
                      <CButton
                        color="success"
                        onClick={() => {
                          if (formData.emptyJar < 10) {
                            handleIncrement('emptyJar');
                          }
                        }}
                        style={styles.quantityButton}
                        disabled={formData.emptyJar >= 10}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </CCol>
              </CRow>

              {/* Cold Drinks Row */}
            
              {/* Empty Cold Drinks Field */}
             

              {/* Cash Collected Row */}
          

              {/* Total and Balance */}
              <div className="mb-4 p-3 bg-light border rounded">
                <CRow className="mb-2 align-items-center">
                  <CCol xs={6}>
                    <div className="fw-bold">Total Amount:</div>
                  </CCol>
                  <CCol xs={6} className="text-end">
                    <div className="fs-4 fw-bold text-primary">₹ {totalAmount}</div>
                  </CCol>
                </CRow>
                <CRow className="align-items-center">
                  <CCol xs={6}>
                    <div className="fw-bold">Balance:</div>
                  </CCol>
                  <CCol xs={6} className="text-end">
                    <CBadge color={balance > 0 ? "danger" : "success"} className="fs-5 p-2">
                      ₹ {balance}
                    </CBadge>
                  </CCol>
                </CRow>
              </div>

              {/* Action Buttons */}
              <CRow className="mt-4">
                <CCol>
                  <CButton color="primary" size="lg" className="me-2 px-4" onClick={handleSubmit}>
                    Submit
                  </CButton>
                  <CButton color="secondary" variant="outline" size="lg" className="px-4" onClick={handleClear}>
                    <CIcon icon={cilReload} className="me-2" /> Clear
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default DeliveryForm;










