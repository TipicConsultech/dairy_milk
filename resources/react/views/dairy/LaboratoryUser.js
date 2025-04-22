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
  const [buffaloDensity, setBuffaloDensity] = useState('');
  const [buffaloSNF, setBuffaloSNF] = useState('');
  const [buffaloTS, setBuffaloTS] = useState('');
  const [cowDensity, setCowDensity] = useState('');
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
      buffalo: { density: buffaloDensity, snf: buffaloSNF, ts: buffaloTS },
      cow: { density: cowDensity, snf: cowSNF, ts: cowTS }
    });
  };

  // Handle form cancel for milk parameters
  const handleCancelMilkParams = () => {
    // Reset form fields
    setBuffaloDensity('');
    setBuffaloSNF('');
    setBuffaloTS('');
    setCowDensity('');
    setCowSNF('');
    setCowTS('');
  };

  return (
    <CContainer fluid className="p-0">
      {/* Milk Parameters Interface */}
      <CCard className="mb-4 border" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <CRow>
            <CCol md={6}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Buffalo Milk</h5>
                <span>Capacity: {tanks[0].current} / {tanks[0].capacity} Ltr</span>
              </div>
              <CProgress
                value={tanks[0].percentage}
                color={tanks[0].color}
                className="mb-3"
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
                className="mb-3"
                height={20}
              >
                {tanks[1].percentage}%
              </CProgress>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="border p-4">
          <CForm>
            <CRow className="mb-3">
              <CCol md={2}>
                <CFormLabel>Buffalo milk</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  value={buffaloDensity}
                  onChange={(e) => setBuffaloDensity(e.target.value)}
                  placeholder="Density"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel>SNF</CFormLabel>
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
                <CFormLabel>TS</CFormLabel>
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

            <CRow className="mb-4">
              <CCol md={2}>
                <CFormLabel>Cow Milk</CFormLabel>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  value={cowDensity}
                  onChange={(e) => setCowDensity(e.target.value)}
                  placeholder="Density"
                />
              </CCol>
              <CCol md={1} className="text-center">
                <CFormLabel>SNF</CFormLabel>
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
                <CFormLabel>TS</CFormLabel>
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
                  color="dark"
                  className="px-4 w-100"
                  onClick={handleSaveMilkParams}
                >
                  SAVE
                </CButton>
              </CCol>
              <CCol xs={6} md={2}>
                <CButton
                  color="light"
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
