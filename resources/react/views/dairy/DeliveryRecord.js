// DeliveryForm.jsx
import React, { useState } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CButton,
  CRow,
  CCol,
  CContainer
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilMinus, cilPlus, cilQrCode } from '@coreui/icons';

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
    // Add API call here to submit form data
    alert('Delivery information submitted!');
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

  const handleViewQR = () => {
    // Implement QR code generation/viewing logic
    alert('QR code view functionality would go here');
  };

  // Custom styles
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
            <CIcon icon={cilPlus} className="me-1" /> New
          </CButton>
        </CCardHeader>
        <CCardBody className="bg-light">
          <CForm>
            {/* Customer Name Section */}
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

            {/* Jar Section */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeading}>Milk Packets Details</div>
              
              {/* Jar Heading Row */}
              <CRow className="mb-3">
                <CCol xs={6}>
                  <CFormLabel className="text-muted">Item</CFormLabel>
                </CCol>
                <CCol xs={3} className="text-center">
                  <CFormLabel className="text-muted">Quantity</CFormLabel>
                </CCol>
                <CCol xs={3} className="text-center">
                  <CFormLabel className="text-muted"> Packets</CFormLabel>
                </CCol>
              </CRow>

              {/* New Jar */}
              <CRow className="mb-4 align-items-center">
  <CCol xs={6}>
    <div className="d-flex align-items-center">
      <div className="me-3 fw-bold">Carets (10 packets each)</div>
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
      className="text-center"
    />
  </CCol>

  <CCol xs={3}>
    <div className="p-2 bg-white border text-end rounded fw-bold">
      ₹{calculateTotal('jar', formData.jar * 10)}
    </div>
    <div className="text-end text-muted small">
      {formData.jar} × 10 = <strong>{formData.jar * 10}</strong> packets
    </div>
  </CCol>
</CRow>










              {/* Empty Jar */}
              <CRow className="mb-3 align-items-center">
                <CCol xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fw-bold">Empty Carets</div>
                    <CInputGroup size="sm">
                      <CButton 
                        color="danger"
                        onClick={() => handleDecrement('emptyJar')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.emptyJar}
                        onChange={(e) => handleInputChange('emptyJar', parseInt(e.target.value) || 0)}
                        style={{ maxWidth: '60px' }}
                      />
                      <CButton 
                        color="success"
                        onClick={() => handleIncrement('emptyJar')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </CCol>
              </CRow>
            </div>

            {/* Cold Drinks Section */}
            <div style={styles.formSection}>
              {/* <div style={styles.sectionHeading}>Carets Details</div> */}
              
              

        
              
                

              {/* Empty Carets */}
              {/* <CRow className="mb-3 align-items-center">
                <CCol xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fw-bold">Total Carets</div>
                    <CInputGroup size="sm">
                      <CButton 
                        color="danger"
                        onClick={() => handleDecrement('emptyColdDrinks')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.emptyColdDrinks}
                        onChange={(e) => handleInputChange('emptyColdDrinks', parseInt(e.target.value) || 0)}
                        style={{ maxWidth: '60px' }}
                      />
                      <CButton 
                        color="success"
                        onClick={() => handleIncrement('emptyColdDrinks')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </CCol>
              </CRow>
     */}
{/* 
total Packets */}

              {/* <CRow className="mb-3 align-items-center">
                <CCol xs={6}>
                  <div className="d-flex align-items-center">
                    <div className="me-3 fw-bold">Packets</div>
                    <CInputGroup size="sm">
                      <CButton 
                        color="danger"
                        onClick={() => handleDecrement('emptyColdDrinks')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.emptyColdDrinks}
                        onChange={(e) => handleInputChange('emptyColdDrinks', parseInt(e.target.value) || 0)}
                        style={{ maxWidth: '60px' }}
                      />
                      <CButton 
                        color="success"
                        onClick={() => handleIncrement('emptyColdDrinks')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </div>
                </CCol>
              </CRow>
 */}


            </div>

            {/* Payment Section */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeading}>Payment Details</div>
              
              <CRow className="mb-4">
                <CCol md={6} className="mb-3 mb-md-0">
                  <CFormLabel className="fw-bold">Total Amount</CFormLabel>
                  <div style={styles.totalValue}>
                    ₹{totalAmount}
                  </div>
                </CCol>
                <CCol md={6}>
                  <CFormLabel className="fw-bold">Cash Collected</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>₹</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={formData.cashCollected}
                      onChange={(e) => handleInputChange('cashCollected', parseFloat(e.target.value) || 0)}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              {/* Show balance/change if relevant */}
              {formData.cashCollected > 0 && (
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel className="fw-bold">Status</CFormLabel>
                    <div className={`p-2 rounded text-white ${formData.cashCollected >= totalAmount ? 'bg-success' : 'bg-danger'}`}>
                      {formData.cashCollected >= totalAmount ? 'Paid' : 'Pending'}
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel className="fw-bold">
                      {formData.cashCollected >= totalAmount ? 'Change' : 'Balance'}
                    </CFormLabel>
                    <div className={`p-2 rounded text-white ${formData.cashCollected >= totalAmount ? 'bg-info' : 'bg-warning'}`}>
                      ₹{Math.abs(formData.cashCollected - totalAmount).toFixed(2)}
                    </div>
                  </CCol>
                </CRow>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3 justify-content-end mt-4">
              <CButton color="secondary" onClick={handleClear} className="px-4">
                Clear
              </CButton>
              {/* <CButton color="info" onClick={handleViewQR} className="px-4">
                <CIcon icon={cilQrCode} className="me-2" />
                View QR
              </CButton> */}
              <CButton color="primary" onClick={handleSubmit} size="lg" className="px-4">
                Submit
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default DeliveryForm;