import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CContainer,
  CCardFooter,
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner
} from '@coreui/react';
import { post } from '../../util/api';

const ProductCreationCalculator = () => {
  // Main form state
  const [formState, setFormState] = useState({
    selectedProduct: '',
    // Paneer states
    snfValue: '',
    tsValue: '',
    intakeValue: '',
    pannerToBeCreated: '',
    pannerCreated: '',
    alleviationInCreation: '',
    createdPanner: '',
    // Tup states
    milkIntake: '',
    creamCreated: '',
    tupCreated: '',
    tupAlleviation: ''
  });

  // UI states
  const [uiState, setUiState] = useState({
    error: '',
    successMessage: '',
    showConfirmModal: false,
    currentStyle: '',
    isLoading: false
  });

  // Destructure form state for easier access
  const {
    selectedProduct,
    snfValue,
    tsValue,
    intakeValue,
    pannerToBeCreated,
    pannerCreated,
    alleviationInCreation,
    createdPanner,
    milkIntake,
    creamCreated,
    tupCreated,
    tupAlleviation
  } = formState;

  // Destructure UI state
  const { error, successMessage, showConfirmModal, currentStyle, isLoading } = uiState;

  // Update form state helper
  const updateFormState = (key, value) => {
    setFormState(prev => ({ ...prev, [key]: value }));
    // Clear error and success messages when user changes form
    setUiState(prev => ({ ...prev, error: '' }));
  };

  // Update UI state helper
  const updateUiState = (key, value) => {
    setUiState(prev => ({ ...prev, [key]: value }));
  };

  const productOptions = [
    { label: 'Select Product', value: '' },
    { label: 'Paneer', value: 'Paneer' },
    { label: 'Tup', value: 'Tup' }
  ];

  // Memoized calculation function for Paneer
  const calculatePannerToBeCreated = useCallback(async () => {
    // Only calculate if all required fields are present
    if (!tsValue || !intakeValue || !snfValue) return;

    try {
      updateUiState('isLoading', true);

      const response = await post('/api/calculate/predict/paneer', {
        tsValue: parseFloat(tsValue),
        intakeValue: parseFloat(intakeValue),
        snfValue: parseFloat(snfValue)
      });

      // Process response data
      if (response && response.pannerToBeCreated !== undefined) {
        updateFormState('pannerToBeCreated', response.pannerToBeCreated.toFixed(2));
      }
    } catch (err) {
      // Enhanced error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to calculate Panner To Be Created';
      updateUiState('error', errorMessage);
      console.error('Calculation error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  }, [tsValue, intakeValue, snfValue]);

  // Memoized calculation function for Alleviation and Created Panner
  const calculateAlleviationAndCreatedPanner = useCallback(() => {
    // Only calculate if all required fields are present
    if (!pannerToBeCreated || !pannerCreated || !intakeValue) return;

    try {
      // Calculate alleviation: Paneer To be created - Paneer Created
      const alleviation = (parseFloat(pannerToBeCreated) - parseFloat(pannerCreated)).toFixed(2);
      updateFormState('alleviationInCreation', alleviation);

      // Set style based on alleviation result
      const style = parseFloat(alleviation) < 0 ? 'bg-warning text-dark fw-bold' : 'bg-info text-white fw-bold';
      updateUiState('currentStyle', style);

      // Calculate Created Panner TS: Paneer Created / Intake * 100
      const createdPannerTS = ((parseFloat(pannerCreated) / parseFloat(intakeValue)) * 100).toFixed(2);
      updateFormState('createdPanner', createdPannerTS);
    } catch (err) {
      updateUiState('error', 'Failed to calculate Alleviation and Created Panner');
      console.error('Calculation error:', err);
    }
  }, [pannerToBeCreated, pannerCreated, intakeValue]);

  // Memoized calculation function for Tup
  const calculateTup = useCallback(async () => {
    // Only calculate if all required fields are present
    if (!milkIntake || !creamCreated || !tupCreated) return;

    try {
      updateUiState('isLoading', true);

      const response = await post('/api/calculate/predict/tup', {
        milkIntake: parseFloat(milkIntake),
        creamCreated: parseFloat(creamCreated),
        tupCreated: parseFloat(tupCreated)
      });

      // Process response data
      if (response && response.tupAlleviation !== undefined) {
        updateFormState('tupAlleviation', response.tupAlleviation.toFixed(2));
      }
    } catch (err) {
      // Enhanced error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to calculate Tup alleviation';
      updateUiState('error', errorMessage);
      console.error('Calculation error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  }, [milkIntake, creamCreated, tupCreated]);

  // Effect hooks for calculations
  useEffect(() => {
    calculatePannerToBeCreated();
  }, [calculatePannerToBeCreated]);

  useEffect(() => {
    calculateAlleviationAndCreatedPanner();
  }, [calculateAlleviationAndCreatedPanner]);

  useEffect(() => {
    calculateTup();
  }, [calculateTup]);

  // Reset all form states
  const resetAllFormStates = () => {
    setFormState({
      selectedProduct: '',
      snfValue: '',
      tsValue: '',
      intakeValue: '',
      pannerToBeCreated: '',
      pannerCreated: '',
      alleviationInCreation: '',
      createdPanner: '',
      milkIntake: '',
      creamCreated: '',
      tupCreated: '',
      tupAlleviation: ''
    });

    setUiState(prev => ({
      ...prev,
      error: '',
      showConfirmModal: false,
      currentStyle: '',
      isLoading: false
      // We don't clear success message here to allow it to persist
    }));
  };

  // Reset form for the current product
  const resetForm = () => {
    if (selectedProduct === 'Paneer') {
      setFormState(prev => ({
        ...prev,
        snfValue: '',
        tsValue: '',
        intakeValue: '',
        pannerToBeCreated: '',
        pannerCreated: '',
        alleviationInCreation: '',
        createdPanner: ''
      }));
    } else if (selectedProduct === 'Tup') {
      setFormState(prev => ({
        ...prev,
        milkIntake: '',
        creamCreated: '',
        tupCreated: '',
        tupAlleviation: ''
      }));
    }

    setUiState(prev => ({
      ...prev,
      error: '',
      currentStyle: ''
      // We don't clear success message here to allow it to persist
    }));
  };

  // Store Paneer Calculation
  const storePaneerCalculation = async () => {
    try {
      updateUiState('isLoading', true);

      const response = await post('/api/store/paneer', {
        snfValue: parseFloat(snfValue),
        tsValue: parseFloat(tsValue),
        intakeValue: parseFloat(intakeValue),
        pannerToBeCreated: parseFloat(pannerToBeCreated),
        pannerCreated: parseFloat(pannerCreated),
        alleviationInCreation: parseFloat(alleviationInCreation),
        createdPannerTS: parseFloat(createdPanner)
      });

      if (response.success) {
        // First set the success message
        updateUiState('successMessage', 'Paneer calculation stored successfully!');
        updateUiState('showConfirmModal', false);

        // Reset form but preserve the success message
        const currentSuccessMessage = 'Paneer calculation stored successfully!';

        // Reset form state first
        setFormState({
          selectedProduct: '',
          snfValue: '',
          tsValue: '',
          intakeValue: '',
          pannerToBeCreated: '',
          pannerCreated: '',
          alleviationInCreation: '',
          createdPanner: '',
          milkIntake: '',
          creamCreated: '',
          tupCreated: '',
          tupAlleviation: ''
        });

        // Reset UI state but preserve success message
        setUiState(prev => ({
          ...prev,
          error: '',
          showConfirmModal: false,
          currentStyle: '',
          isLoading: false,
          successMessage: currentSuccessMessage
        }));

        // Clear success message after 5 seconds for better visibility
        setTimeout(() => {
          updateUiState('successMessage', '');
        }, 5000);
      } else {
        updateUiState('error', 'Failed to store calculation');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to store Paneer calculation';
      updateUiState('error', errorMessage);
      console.error('Storage error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  };

  // Store Tup Calculation
  const storeTupCalculation = async () => {
    try {
      updateUiState('isLoading', true);

      const response = await post('/api/store/tup', {
        milkIntake: parseFloat(milkIntake),
        creamCreated: parseFloat(creamCreated),
        tupCreated: parseFloat(tupCreated),
        tupAlleviation: parseFloat(tupAlleviation)
      });

      if (response.success) {
        // First set the success message
        updateUiState('successMessage', 'Tup calculation stored successfully!');
        updateUiState('showConfirmModal', false);

        // Reset form but preserve the success message
        const currentSuccessMessage = 'Tup calculation stored successfully!';

        // Reset form state first
        setFormState({
          selectedProduct: '',
          snfValue: '',
          tsValue: '',
          intakeValue: '',
          pannerToBeCreated: '',
          pannerCreated: '',
          alleviationInCreation: '',
          createdPanner: '',
          milkIntake: '',
          creamCreated: '',
          tupCreated: '',
          tupAlleviation: ''
        });

        // Reset UI state but preserve success message
        setUiState(prev => ({
          ...prev,
          error: '',
          showConfirmModal: false,
          currentStyle: '',
          isLoading: false,
          successMessage: currentSuccessMessage
        }));

        // Clear success message after 5 seconds for better visibility
        setTimeout(() => {
          updateUiState('successMessage', '');
        }, 5000);
      } else {
        updateUiState('error', 'Failed to store calculation');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to store Tup calculation';
      updateUiState('error', errorMessage);
      console.error('Storage error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  };

  // Confirm storage of calculation
  const confirmStorage = () => {
    // Validate that all required calculations are complete
    if (selectedProduct === 'Paneer') {
      if (!pannerToBeCreated || !pannerCreated || !alleviationInCreation || !createdPanner) {
        updateUiState('error', 'Please complete all calculations before storing');
        return;
      }
      updateUiState('showConfirmModal', true);
    } else if (selectedProduct === 'Tup') {
      if (!milkIntake || !creamCreated || !tupCreated || !tupAlleviation) {
        updateUiState('error', 'Please complete all calculations before storing');
        return;
      }
      updateUiState('showConfirmModal', true);
    }
  };

  return (
    <CContainer className="mt-3 px-2 px-sm-3">
      <CCard className="border-0 shadow-sm">
        <CCardHeader className="bg-success text-white py-2 py-sm-3">
          <h4 className="mb-0 d-flex align-items-center">
            {/* <i className="fas fa-calculator me-2"></i> */}
            Product Creation Calculator
          </h4>
        </CCardHeader>

        <CCardBody className="bg-light py-3">
          {/* Loading overlay */}
          {isLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75" style={{ zIndex: 1000 }}>
              <CSpinner color="primary" />
            </div>
          )}

          {/* Success Alert - Added animation for better visibility */}
          {successMessage && (
            <CAlert color="success" className="mb-3 d-flex align-items-center" style={{ animation: 'fadeIn 0.5s' }}>
              {/* <i className="fas fa-check-circle me-2"></i> */}
              {successMessage}
            </CAlert>
          )}

          {/* Error Alert */}
          {error && (
            <CAlert color="danger" className="mb-3 d-flex align-items-center">
              {/* <i className="fas fa-exclamation-circle me-2"></i> */}
              {error}
            </CAlert>
          )}

          <CForm>
            {/* Product Selection Dropdown */}
            <CRow className="mb-3 justify-content-center">
              <CCol xs={12} sm={10} md={8} lg={6} xl={4}>
                <CFormLabel htmlFor="productSelection" className="fw-bold mb-1">
                  Product Selection
                </CFormLabel>
                <CFormSelect
                  id="productSelection"
                  value={selectedProduct}
                  onChange={(e) => {
                    updateFormState('selectedProduct', e.target.value);
                    resetForm();
                  }}
                  options={productOptions}
                  aria-label="Select product"
                />
              </CCol>
            </CRow>

            {/* Paneer Form - Only shows when Paneer is selected */}
            {selectedProduct === 'Paneer' && (
              <>
                {/* SNF, TS, Intake fields */}
                <CRow className="mb-3 g-3">
                  <CCol xs={12} md={4}>
                    <CFormLabel className="fw-bold mb-1">Intake</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={intakeValue}
                        onChange={(e) => updateFormState('intakeValue', e.target.value)}
                        placeholder="Enter intake amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label="Intake"
                      />
                      <CInputGroupText className="bg-light">(in liter)</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel className="fw-bold mb-1">SNF</CFormLabel>
                    <CFormInput
                      value={snfValue}
                      onChange={(e) => updateFormState('snfValue', e.target.value)}
                      placeholder="Enter SNF value"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label="SNF"
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel className="fw-bold mb-1">TS</CFormLabel>
                    <CFormInput
                      value={tsValue}
                      onChange={(e) => updateFormState('tsValue', e.target.value)}
                      placeholder="Enter TS value"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label="TS"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3 g-3">
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">Panner To be created</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={pannerToBeCreated}
                        readOnly
                        placeholder="Calculated automatically"
                        className="bg-light text-muted"
                        aria-label="Panner To be created"
                      />
                      <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">Panner Created</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={pannerCreated}
                        onChange={(e) => updateFormState('pannerCreated', e.target.value)}
                        placeholder="Enter created amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label="Panner Created"
                      />
                      <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">
                      Alleviation In Creation
                      {alleviationInCreation && (
                        <span className="ms-1 badge bg-danger">Important</span>
                      )}
                    </CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={alleviationInCreation}
                        readOnly
                        placeholder="Calculated automatically"
                        style={{
                          backgroundColor: alleviationInCreation
                            ? (parseFloat(alleviationInCreation) < 0 ? '#ffe6e6' : '#e6ffee')
                            : '#f8f9fa',
                          color: alleviationInCreation
                            ? (parseFloat(alleviationInCreation) < 0 ? '#dc3545' : '#198754')
                            : '#6c757d',
                          fontWeight: alleviationInCreation ? 'bold' : 'normal',
                          border: alleviationInCreation
                            ? (parseFloat(alleviationInCreation) < 0
                               ? '2px solid #dc3545'
                               : '2px solid #198754')
                            : '1px solid #ced4da'
                        }}
                        aria-label="Alleviation In Creation"
                      />
                      <CInputGroupText style={{
                        backgroundColor: '#f8f9fa',
                        fontWeight: 'bold'
                      }}>(in kg)</CInputGroupText>
                    </CInputGroup>
                </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">TS of Created Panner</CFormLabel>
                    <CFormInput
                      value={createdPanner}
                      readOnly
                      placeholder="Calculated automatically"
                      className="bg-light text-muted"
                      aria-label="TS of Created Panner"
                    />
                  </CCol>
                </CRow>

                {alleviationInCreation && (
                  <CRow className="mt-2">
                    <CCol>
                      <CAlert color={parseFloat(alleviationInCreation) < 0 ? "danger" : "success"} className="py-2 mb-0">
                        <strong>
                          {/* <i className={parseFloat(alleviationInCreation) < 0 ? "fas fa-exclamation-triangle me-2" : "fas fa-check-circle me-2"}></i> */}
                          {parseFloat(alleviationInCreation) < 0
                            ? `Deficit of ${Math.abs(parseFloat(alleviationInCreation))} kg in production!`
                            : `Surplus of ${alleviationInCreation} kg in production!`}
                        </strong>
                      </CAlert>
                    </CCol>
                  </CRow>
                )}
              </>
            )}

            {/* Tup Form - Only shows when Tup is selected */}
            {selectedProduct === 'Tup' && (
              <>
                <CRow className="mb-3 g-3">
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">Milk Intake</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={milkIntake}
                        onChange={(e) => updateFormState('milkIntake', e.target.value)}
                        placeholder="Enter milk intake"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label="Milk Intake"
                      />
                      <CInputGroupText className="bg-light">(in liter)</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">Cream Created</CFormLabel>
                    <CFormInput
                      value={creamCreated}
                      onChange={(e) => updateFormState('creamCreated', e.target.value)}
                      placeholder="Enter cream amount"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label="Cream Created"
                    />
                  </CCol>
                </CRow>

                <CRow className="g-3">
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">Tup Created</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={tupCreated}
                        onChange={(e) => updateFormState('tupCreated', e.target.value)}
                        placeholder="Enter tup amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label="Tup Created"
                      />
                      <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">TUP Alleviation</CFormLabel>
                    <CFormInput
                      value={tupAlleviation}
                      readOnly
                      placeholder="Calculated automatically"
                      className="bg-light text-muted"
                      aria-label="TUP Alleviation"
                    />
                  </CCol>
                </CRow>
              </>
            )}

            {/* Control Buttons - Only shows when a product is selected */}
            {selectedProduct && (
              <CCardFooter className="bg-transparent border-0 text-center text-sm-end pt-4 pb-0 px-0">
                <CButton
                  color="primary"
                  onClick={confirmStorage}
                  className="me-2 px-3 mb-2 mb-sm-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {/* <i className="fas fa-save me-1"></i>  */}
                      Save Calculation
                    </>
                  )}
                </CButton>
                <CButton
                  color="secondary"
                  onClick={resetAllFormStates}
                  className="px-3"
                  disabled={isLoading}
                >
                  <i className="fas fa-redo-alt me-1"></i> Reset
                </CButton>
              </CCardFooter>
            )}
          </CForm>
        </CCardBody>
      </CCard>

      {/* Confirmation Modal */}
      <CModal
        visible={showConfirmModal}
        onClose={() => updateUiState('showConfirmModal', false)}
        aria-labelledby="confirm-modal-title"
      >
        <CModalHeader>
          <CModalTitle id="confirm-modal-title">Confirm Calculation Storage</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to store this calculation?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => updateUiState('showConfirmModal', false)}
            disabled={isLoading}
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={selectedProduct === 'Paneer' ? storePaneerCalculation : storeTupCalculation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ProductCreationCalculator;

//--------------------------------------------------------------------------------------

// import React, { useState, useEffect } from 'react';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CForm,
//   CFormSelect,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CRow,
//   CCol,
//   CInputGroup,
//   CInputGroupText,
//   CContainer,
//   CCardFooter,
//   CAlert
// } from '@coreui/react';

// const ProductCreationCalculator = () => {
//   const [selectedProduct, setSelectedProduct] = useState('');

//   // Paneer form states
//   const [snfValue, setSnfValue] = useState('');
//   const [tsValue, setTsValue] = useState('');
//   const [intakeValue, setIntakeValue] = useState('');
//   const [pannerToBeCreated, setPannerToBeCreated] = useState('');
//   const [pannerCreated, setPannerCreated] = useState('');
//   const [alleviationInCreation, setAlleviationInCreation] = useState(''); // New state for Alleviation In Creation
//   const [createdPanner, setCreatedPanner] = useState('');

//   // Strobing effect states
//   const [isStrobing, setIsStrobing] = useState(false);
//   const [currentStyle, setCurrentStyle] = useState('');

//   // Tup form states
//   const [milkIntake, setMilkIntake] = useState('');
//   const [creamCreated, setCreamCreated] = useState('');
//   const [tupCreated, setTupCreated] = useState('');
//   const [tupAlleviation, setTupAlleviation] = useState('');

//   const productOptions = [
//     { label: 'Select Product', value: '' },
//     { label: 'Paneer', value: 'Paneer' },
//     { label: 'Tup', value: 'Tup' }
//   ];

//   // Style classes for strobing effect
//   const strobingStyles = [
//     'bg-warning text-dark fw-bold',
//     'bg-info text-white fw-bold',
//     'bg-light text-primary fw-bold'
//   ];

//   // Calculate alleviationInCreation whenever pannerToBeCreated or pannerCreated change
//   useEffect(() => {
//     if (pannerToBeCreated && pannerCreated) {
//       const expected = parseFloat(pannerToBeCreated);
//       const actual = parseFloat(pannerCreated);
//       if (!isNaN(expected) && !isNaN(actual)) {
//         const difference = (actual - expected).toFixed(2);
//         setAlleviationInCreation(difference);

//         // Start strobing when there's a value
//         setIsStrobing(true);
//       }
//     } else {
//       setAlleviationInCreation('');
//       setIsStrobing(false);
//     }
//   }, [pannerToBeCreated, pannerCreated]);

//   // Strobing effect timer
//   useEffect(() => {
//     let interval;
//     if (isStrobing) {
//       let index = 0;
//       interval = setInterval(() => {
//         setCurrentStyle(strobingStyles[index]);
//         index = (index + 1) % strobingStyles.length;
//       }, 800); // Change color every 800ms
//     }

//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [isStrobing]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedProduct === 'Paneer') {
//       // Calculate TS of Created Panner (example calculation - replace with actual formula)
//       if (tsValue && snfValue && intakeValue && pannerCreated) {
//         const ts = parseFloat(tsValue);
//         const snf = parseFloat(snfValue);
//         const intake = parseFloat(intakeValue);
//         const created = parseFloat(pannerCreated);

//         if (!isNaN(ts) && !isNaN(snf) && !isNaN(intake) && !isNaN(created)) {
//           // This is a placeholder calculation - replace with actual formula
//           const tsOfCreatedPanner = ((ts * intake) / created).toFixed(2);
//           setCreatedPanner(tsOfCreatedPanner);
//         }
//       }

//       console.log({
//         selectedProduct,
//         snfValue,
//         tsValue,
//         intakeValue,
//         pannerToBeCreated,
//         pannerCreated,
//         alleviationInCreation,
//         createdPanner
//       });
//     } else if (selectedProduct === 'Tup') {
//       // Calculate TUP Alleviation (example calculation - replace with actual formula)
//       if (milkIntake && creamCreated && tupCreated) {
//         const milk = parseFloat(milkIntake);
//         const cream = parseFloat(creamCreated);
//         const tup = parseFloat(tupCreated);

//         if (!isNaN(milk) && !isNaN(cream) && !isNaN(tup)) {
//           // This is a placeholder calculation - replace with actual formula
//           const calculatedAlleviation = ((cream / milk) * 100).toFixed(2) + '%';
//           setTupAlleviation(calculatedAlleviation);
//         }
//       }

//       console.log({
//         selectedProduct,
//         milkIntake,
//         creamCreated,
//         tupCreated,
//         tupAlleviation
//       });
//     }
//     // Submit logic here
//   };

//   return (
//     <CContainer className="mt-3">
//       <CCard>
//         <CCardHeader className="bg-success text-white py-2">
//           <h4 className="mb-0">Product Creation Calculator</h4>
//         </CCardHeader>
//         <CCardBody className="bg-light py-3">
//           <CForm onSubmit={handleSubmit}>
//             {/* Product Selection Dropdown */}
//             <CRow className="mb-3 justify-content-center">
//               <CCol md={6} lg={4}>
//                 <CFormLabel htmlFor="productSelection" className="fw-bold mb-1">
//                   Product Selection
//                 </CFormLabel>
//                 <CFormSelect
//                   id="productSelection"
//                   value={selectedProduct}
//                   onChange={(e) => setSelectedProduct(e.target.value)}
//                   options={productOptions}
//                 />
//               </CCol>
//             </CRow>

//             {/* Paneer Form - Only shows when Paneer is selected */}
//             {selectedProduct === 'Paneer' && (
//               <>
//                 {/* SNF, TS, Intake fields */}
//                 <CRow className="mb-2 g-2">
//                 <CCol md={4}>
//                     <CFormLabel className="fw-bold mb-1">Intake</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={intakeValue}
//                         onChange={(e) => setIntakeValue(e.target.value)}
//                         placeholder="Enter intake amount"
//                       />
//                       <CInputGroupText className="bg-light">(in liter)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={4}>
//                     <CFormLabel className="fw-bold mb-1">SNF</CFormLabel>
//                     <CFormInput
//                       value={snfValue}
//                       onChange={(e) => setSnfValue(e.target.value)}
//                       placeholder="Enter SNF value"
//                     />
//                   </CCol>
//                   <CCol md={4}>
//                     <CFormLabel className="fw-bold mb-1">TS</CFormLabel>
//                     <CFormInput
//                       value={tsValue}
//                       onChange={(e) => setTsValue(e.target.value)}
//                       placeholder="Enter TS value"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="g-2">
//                   <CCol md={3}>
//                     <CFormLabel className="fw-bold mb-1">Panner To be created</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={pannerToBeCreated}
//                         onChange={(e) => setPannerToBeCreated(e.target.value)}
//                         placeholder="Enter amount"
//                       />
//                       <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel className="fw-bold mb-1">Panner Created</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={pannerCreated}
//                         onChange={(e) => setPannerCreated(e.target.value)}
//                         placeholder="Enter created amount"
//                       />
//                       <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel className="fw-bold mb-1">
//                       Alleviation In Creation
//                       {alleviationInCreation && (
//                         <span className="ms-1 badge bg-danger">Important</span>
//                       )}
//                     </CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={alleviationInCreation}
//                         readOnly
//                         placeholder="Auto calculated"
//                         className={isStrobing ? currentStyle : 'bg-light text-muted'}
//                       />
//                       <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormLabel className="fw-bold mb-1">TS of Created Panner</CFormLabel>
//                     <CFormInput
//                       value={createdPanner}
//                       readOnly
//                       placeholder="Auto calculated"
//                       className="bg-light text-muted"
//                     />
//                   </CCol>
//                 </CRow>

//                 {alleviationInCreation && (
//                   <CRow className="mt-2">
//                     <CCol>
//                       <CAlert color={parseFloat(alleviationInCreation) < 0 ? "danger" : "success"} className="py-2 mb-0">
//                         <strong>
//                           {parseFloat(alleviationInCreation) < 0
//                             ? `Deficit of ${Math.abs(parseFloat(alleviationInCreation))} kg in production!`
//                             : `Surplus of ${alleviationInCreation} kg in production!`}
//                         </strong>
//                       </CAlert>
//                     </CCol>
//                   </CRow>
//                 )}
//               </>
//             )}

//             {/* Tup Form - Only shows when Tup is selected */}
//             {selectedProduct === 'Tup' && (
//               <>
//                 <CRow className="mb-2 g-2">
//                   <CCol md={6}>
//                     <CFormLabel className="fw-bold mb-1">Milk Intake</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={milkIntake}
//                         onChange={(e) => setMilkIntake(e.target.value)}
//                         placeholder="Enter milk intake"
//                       />
//                       <CInputGroupText className="bg-light">(in liter)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={6}>
//                     <CFormLabel className="fw-bold mb-1">Cream Created</CFormLabel>
//                     <CFormInput
//                       value={creamCreated}
//                       onChange={(e) => setCreamCreated(e.target.value)}
//                       placeholder="Enter cream amount"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="g-2">
//                   <CCol md={6}>
//                     <CFormLabel className="fw-bold mb-1">Tup Created</CFormLabel>
//                     <CInputGroup>
//                       <CFormInput
//                         value={tupCreated}
//                         onChange={(e) => setTupCreated(e.target.value)}
//                         placeholder="Enter tup amount"
//                       />
//                       <CInputGroupText className="bg-light">(in kg)</CInputGroupText>
//                     </CInputGroup>
//                   </CCol>
//                   <CCol md={6}>
//                     <CFormLabel className="fw-bold mb-1">TUP Alleviation</CFormLabel>
//                     <CFormInput
//                       value={tupAlleviation}
//                       readOnly
//                       placeholder="Auto calculated"
//                       className="bg-light text-muted"
//                     />
//                   </CCol>
//                 </CRow>
//               </>
//             )}

//             {/* Submit Button - Only shows when a product is selected */}
//             {selectedProduct && (
//               <CCardFooter className="bg-transparent border-0 text-end pt-2 pb-0 px-0">
//                 <CButton
//                   color="primary"
//                   type="submit"
//                   className="px-3"
//                 >
//                   Calculate
//                 </CButton>
//               </CCardFooter>
//             )}
//           </CForm>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// export default ProductCreationCalculator;
