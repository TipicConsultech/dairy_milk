import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer
} from '@coreui/react';

const LaboratoryUser = () => {
  // State for milk data
  const [buffaloQuantity, setBuffaloQuantity] = useState('');
  const [buffaloSNF, setBuffaloSNF] = useState('');
  const [buffaloTS, setBuffaloTS] = useState('');
  const [cowQuantity, setCowQuantity] = useState('');
  const [cowSNF, setCowSNF] = useState('');
  const [cowTS, setCowTS] = useState('');

  // Tank data
  const tanks = [
    { id: 1, type: 'Buffalo Milk', current: 500, capacity: 500, percentage: 100, color: 'success' },
    { id: 2, type: 'Cow Milk', current: 300, capacity: 700, percentage: 43, color: 'warning' }
  ];

  // Handle form save for milk parameters
  const handleSaveMilkParams = () => {
    // Logic to save milk parameters
    console.log('Saving milk parameters:', {
      buffalo: { Quantity: buffaloQuantity, snf: buffaloSNF, ts: buffaloTS },
      cow: { Quantity: cowQuantity, snf: cowSNF, ts: cowTS }
    });
  };

  // Handle form cancel for milk parameters
  const handleCancelMilkParams = () => {
    // Reset form fields
    setBuffaloQuantity('');
    setBuffaloSNF('');
    setBuffaloTS('');
    setCowQuantity('');
    setCowSNF('');
    setCowTS('');
  };

  return (
    <CContainer fluid className="p-0">
      {/* Main card with laboratory user header */}
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">Laboratory User</h5>
          </div>
        </CCardHeader>

        {/* Milk info header */}
        <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.75rem' }}>
          <CRow>
            <CCol md={6}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Buffalo Milk</h5>
                <span>Capacity: {tanks[0].current} / {tanks[0].capacity} Ltr</span>
              </div>
              <CProgress
                value={tanks[0].percentage}
                color={tanks[0].color}
                className="mb-0"
                height={20}
              >
                {tanks[0].percentage}%
              </CProgress>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Cow Milk</h5>
                <span>Capacity: {tanks[1].current} / {tanks[1].capacity} Ltr</span>
              </div>
              <CProgress
                value={tanks[1].percentage}
                color={tanks[1].color}
                className="mb-0"
                height={20}
              >
                {tanks[1].percentage}%
              </CProgress>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody className="p-3">
          <CForm>
            <CRow className="mb-3">
              <CCol md={2}>
                <CFormLabel className="mb-0">Buffalo milk</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  value={buffaloQuantity}
                  onChange={(e) => setBuffaloQuantity(e.target.value)}
                  placeholder="Quantity"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel className="mb-0">SNF</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  step="0.01"
                  value={buffaloSNF}
                  onChange={(e) => setBuffaloSNF(e.target.value)}
                  placeholder="SNF Value"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel className="mb-0">TS</CFormLabel>
              </CCol>
              <CCol md={2}>
                <CFormInput
                  type="number"
                  step="0.01"
                  value={buffaloTS}
                  onChange={(e) => setBuffaloTS(e.target.value)}
                  placeholder="TS Value"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={2}>
                <CFormLabel className="mb-0">Cow Milk</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  value={cowQuantity}
                  onChange={(e) => setCowQuantity(e.target.value)}
                  placeholder="Quantity"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel className="mb-0">SNF</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  step="0.01"
                  value={cowSNF}
                  onChange={(e) => setCowSNF(e.target.value)}
                  placeholder="SNF Value"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel className="mb-0">TS</CFormLabel>
              </CCol>
              <CCol md={2}>
                <CFormInput
                  type="number"
                  step="0.01"
                  value={cowTS}
                  onChange={(e) => setCowTS(e.target.value)}
                  placeholder="TS Value"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol xs={6} md={2}>
                <CButton
                  color="primary"
                  className="px-4 w-100"
                  onClick={handleSaveMilkParams}
                >
                  SAVE
                </CButton>
              </CCol>
              <CCol xs={6} md={2}>
                <CButton
                  color="danger"
                  className="px-4 border w-100"
                  onClick={handleCancelMilkParams}
                >
                  Cancel
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default LaboratoryUser;



//LaboratoryUser
