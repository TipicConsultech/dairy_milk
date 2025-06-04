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
import { useTranslation } from 'react-i18next';
import { getAPICall, post } from '../../util/api';
import ProductCalculationHistory from './ProductCalculationHistory';
import CIcon from '@coreui/icons-react';
import { cilChevronBottom, cilPlus, cilTrash, cilX } from '@coreui/icons';

const ProductCreationCalculator = () => {
  // Add translation hook
  // const { t, i18n } = useTranslation("global");

  const { t, i18n } = useTranslation("global")
  const lng = i18n.language

  const [refreshHistory, setRefreshHistory] = useState(false);

  // Main form state
  const [formState, setFormState] = useState({
    selectedProduct: '',
    // Paneer states
    snfValue: '',
    tsValue: '',
    intakeValue: '',
    pannerToBeCreated: '',
    pannerCreated: '',
    differenceInCreation: '',
    createdPanner: '',
    // Tup states
    milkIntake: '',
    creamCreated: '',
    tupCreated: '',
    tupUtaar: ''
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
    differenceInCreation,
    createdPanner,
    milkIntake,
    creamCreated,
    tupCreated,
    tupUtaar
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
    { label: t('LABELS.selectProduct'), value:0 },
    { label: t('LABELS.paneer'), value:10 },
    { label: t('LABELS.cream'), value:16 }
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
      const errorMessage = err.response?.data?.message || err.message || t('MSG.failedToCalculatePaneerToBeCreated');
      updateUiState('error', errorMessage);
      console.error('Calculation error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  }, [tsValue, intakeValue, snfValue, t]);

  // Memoized calculation function for Alleviation and Created Panner
  const calculateAlleviationAndCreatedPanner = useCallback(() => {
    // Only calculate if all required fields are present
    if (!pannerToBeCreated || !pannerCreated || !intakeValue) return;

    try {
      // Calculate alleviation: Paneer Created - Paneer To be created (INVERTED)
      const alleviation = (parseFloat(pannerCreated) - parseFloat(pannerToBeCreated)).toFixed(2);
      updateFormState('differenceInCreation', alleviation);

      // Set style based on alleviation result
      const style = parseFloat(alleviation) < 0 ? 'bg-warning text-dark fw-bold' : 'bg-info text-white fw-bold';
      updateUiState('currentStyle', style);

      // Calculate Created Panner TS: Paneer Created / Intake * 100
      const createdPannerTS = ((parseFloat(pannerCreated) / parseFloat(intakeValue)) * 100).toFixed(2);
      updateFormState('createdPanner', createdPannerTS);
    } catch (err) {
      updateUiState('error', t('MSG.failedToCalculateAlleviationAndCreatedPaneer'));
      console.error('Calculation error:', err);
    }
  }, [pannerToBeCreated, pannerCreated, intakeValue, t]);

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

         setRefreshHistory(prev => !prev);

      // Process response data
      if (response && response.tupUtaar !== undefined) {
     
        updateFormState('tupUtaar', response.tupUtaar.toFixed(2));
      }
    } catch (err) {
      // Enhanced error handling
      const errorMessage = err.response?.data?.message || err.message || t('MSG.failedToCalculateTupUtaar');
      updateUiState('error', errorMessage);
      console.error('Calculation error:', err);
    } finally {
      updateUiState('isLoading', false);
    }
  }, [milkIntake, creamCreated, tupCreated, t]);

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
      differenceInCreation: '',
      createdPanner: '',
      milkIntake: '',
      creamCreated: '',
      tupCreated: '',
      tupUtaar: ''
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
        differenceInCreation: '',
        createdPanner: ''
      }));
    } else if (selectedProduct === 'Tup') {
      setFormState(prev => ({
        ...prev,
        milkIntake: '',
        creamCreated: '',
        tupCreated: '',
        tupUtaar: ''
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
        differenceInCreation: parseFloat(differenceInCreation),
        createdPannerTS: parseFloat(createdPanner)
      });

      if (response.success) {
        // First set the success message
         setRefreshHistory(prev => !prev);
        updateUiState('successMessage', t('MSG.paneerCalculationStoredSuccess'));
        updateUiState('showConfirmModal', false);

        // Reset form but preserve the success message
        const currentSuccessMessage = t('MSG.paneerCalculationStoredSuccess');

        // Reset form state first
        setFormState({
          selectedProduct: '',
          snfValue: '',
          tsValue: '',
          intakeValue: '',
          pannerToBeCreated: '',
          pannerCreated: '',
          differenceInCreation: '',
          createdPanner: '',
          milkIntake: '',
          creamCreated: '',
          tupCreated: '',
          tupUtaar: ''
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
        updateUiState('error', t('MSG.failedToStoreCalculation'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t('MSG.failedToStorePaneerCalculation');
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
        tupUtaar: parseFloat(tupUtaar)
      });

      if (response.success) {
        // First set the success message
         setRefreshHistory(prev => !prev);
        updateUiState('successMessage', t('MSG.tupCalculationStoredSuccess'));
        updateUiState('showConfirmModal', false);

        // Reset form but preserve the success message
        const currentSuccessMessage = t('MSG.tupCalculationStoredSuccess');

        // Reset form state first
        setFormState({
          selectedProduct: '',
          snfValue: '',
          tsValue: '',
          intakeValue: '',
          pannerToBeCreated: '',
          pannerCreated: '',
          differenceInCreation: '',
          createdPanner: '',
          milkIntake: '',
          creamCreated: '',
          tupCreated: '',
          tupUtaar: ''
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
        updateUiState('error', t('MSG.failedToStoreCalculation'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t('MSG.failedToStoreTupCalculation');
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
      if (!pannerToBeCreated || !pannerCreated || !differenceInCreation || !createdPanner) {
        updateUiState('error', t('MSG.completeAllCalculationsBeforeStoring'));
        return;
      }
      updateUiState('showConfirmModal', true);
    } else if (selectedProduct === 'Tup') {
      if (!milkIntake || !creamCreated || !tupCreated || !tupUtaar) {
        updateUiState('error', t('MSG.completeAllCalculationsBeforeStoring'));
        return;
      }
      updateUiState('showConfirmModal', true);
    }
  };





   



  const [milkType, setMilkType] = useState('')
  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [tankData, setTankData] = useState([])
  const [selectedTank, setSelectedTank] = useState(null)
  const [milkEntries, setMilkEntries] = useState([])
  const [errorr, setError] = useState('')

  const inputContainerStyle = {
    position: 'relative'
  }

  const dropdownIconStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1
  }

  const clearButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    zIndex: 1
  }

  const decodeUnicode = (str) => {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/\\u[\dA-F]{4}/gi, match =>
      String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
    )
  }

  useEffect(() => {
    const fetchTankData = async () => {
      const res = await getAPICall('/api/milk-tanks-byname/names')
      setTankData(res.quantity)
    }
    fetchTankData()
  }, [])

  const handleMilkTypeChange = (e) => {
    const selected = e.target.value
    setMilkType(selected)
    setMilkAmount('')
    setError('')
    const tank = tankData.find(t => t.name === selected)
    if (tank) {
      setAvailableQty(tank.available_qty)
      setSelectedTank(tank)
    } else {
      setAvailableQty(null)
      setSelectedTank(null)
    }
  }

  const handleCalculated = async (id) => {
      let data={
      product_id:id,
      values:milkFormattedData
      }
      try{
       const resp=await post('/api/productCalculations',data)
       console.log(resp);
       setCalculatedResult(resp);
      }
      catch(e){
     console.log(e);
      }
     
    };

  const handleMilkAmountChange = (e) => {
    const value = e.target.value
    setMilkAmount(value)
    if (availableQty !== null && parseFloat(value) > availableQty) {
      setError(t('MSG.quantityExceedsAvailableMilk'))
    } else {
      setError('')
    }
  }

  const clearMilkType = () => {
    setMilkType('')
    setSelectedTank(null)
    setAvailableQty(null)
    setMilkAmount('')
    setError('')
  }

  const milkFormattedData = milkEntries.reduce((acc, entry, index) => {
  acc[`milk_${index}`] = entry.quantity
  acc[`milk_${index}_fat`] = parseFloat(entry.fat) || 0
  acc[`milk_${index}_lacto`] = parseFloat(entry.lacto) || 0
  return acc
}, {})
console.log('Formatted Milk Data:', milkFormattedData)







  return (
    <CContainer className="mt-0 px-0">
      <CCard className="border-0 shadow-sm">
        <CCardHeader className="bg-success text-white p-2">
          <h4 className="mb-0">{t('LABELS.productCreationCalculator')}</h4>
        </CCardHeader>

        <CCardBody className="bg-light p-3">
          {/* Loading overlay */}
          {isLoading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75" style={{ zIndex: 1000 }}>
              <CSpinner color="primary" />
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <CAlert color="success" className="mb-2">
              {successMessage}
            </CAlert>
          )}

          {/* Error Alert */}
          {error && (
            <CAlert color="danger" className="mb-2">
              {error}
            </CAlert>
          )}

          <CForm className='g-3 align-items-end mb-0'>
            {/* Product Selection Dropdown */}
            <CRow className='mb-3 '>
             <CFormLabel htmlFor="productSelection" className="fw-bold mb-15">
                  {t('LABELS.productSelection')}
                </CFormLabel>
            </CRow>
            <CRow className="mb-3">
              <CCol xs={12} md={4} className="ml-40">
               
                <CFormSelect
                  id="productSelection"
                  value={selectedProduct}
                  onChange={(e) => {
                    updateFormState('selectedProduct', e.target.value);
                    resetForm();
                  }}
                  options={productOptions}
                  aria-label={t('LABELS.selectProduct')}
                />
              </CCol>


{/* <h1>dsuydgusygd</h1> */}

   <>
      <CCardBody>
         <CCol md={3} style={{marginBottom:'10px'}}>
            <CFormLabel><b>{t('LABELS.selectMilkStorage')}</b></CFormLabel>
          </CCol>
        <CRow className="g-3 align-items-end mb-0">
         

          <CCol md={4}>
            <div style={inputContainerStyle}>
              <CFormSelect value={milkType} onChange={handleMilkTypeChange} style={{ appearance: 'none', backgroundImage: 'none' }}>
                <option value="">{t('LABELS.selectTank')}</option>
                {tankData.map((tank, idx) => {
                  const tankName = lng === 'en' ? tank.name : decodeUnicode(tank.localname)
                  return (
                    <option key={idx} value={tank.name}>
                      {tankName}
                    </option>
                  )
                })}
              </CFormSelect>
              {!milkType ? (
                <div style={dropdownIconStyle}><CIcon icon={cilChevronBottom} size="sm" /></div>
              ) : (
                <div style={clearButtonStyle} onClick={clearMilkType}>
                  <CIcon icon={cilX} size="sm" />
                </div>
              )}
            </div>
          </CCol>

          <CCol md={3}>
            <CFormInput
              type="number"
              value={milkAmount}
              onChange={handleMilkAmountChange}
              placeholder={
                availableQty !== null
                  ? `${t('LABELS.availableQuantity')}: ${availableQty} ltr`
                  : t('LABELS.enterMilkForProduct')
              }
              className={errorr ? 'is-invalid' : ''}
            />
            {errorr && <div className="text-danger mt-1">{errorr}</div>}
          </CCol>

          <CCol md={2} className="d-flex">
            <CButton
              color="success"
              variant="outline"
              onClick={() => {
                if (!milkType || !selectedTank || !milkAmount || errorr) return
                setMilkEntries(prev => [
                  ...prev,
                  {
                    name: milkType,
                    fat: selectedTank.avg_fat ?? '-',
                    lacto: selectedTank.avg_degree ?? '-',
                    quantity: milkAmount,
                    id: selectedTank.id
                  }
                ])
                clearMilkType()
                setMilkAmount('')
              }}
              disabled={!milkType || !milkAmount || !!error}
            >
              <CIcon icon={cilPlus} />
            </CButton>
          </CCol>
        </CRow>

        {milkEntries.length > 0 && milkEntries.map((entry, index) => (
          <CRow key={index} className="mb-2 mt-2 p-2 bg-light rounded">
            <CCol xs={8} md={4}>
              <b>{entry.name}</b>
              <div className="text-muted small d-md-none">
                {entry.quantity} Ltr&nbsp;&nbsp;FAT: {entry.fat || '-'}&nbsp;&nbsp;LACTO: {entry.lacto || '-'}
              </div>
            </CCol>
            <CCol className="d-none d-md-block" md={2}>{entry.quantity} Ltr</CCol>
            <CCol className="d-none d-md-block" md={2}>FAT: {entry.fat || '-'}</CCol>
            <CCol className="d-none d-md-block" md={2}>LACTO: {entry.lacto || '-'}</CCol>
            <CCol xs={4} md={2} className="text-end">
              <CButton
                color="danger"
                variant="outline"
                onClick={() => {
                  setMilkEntries(prev => prev.filter((_, i) => i !== index))
                }}
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </CCol>
          </CRow>
        ))}
      </CCardBody>
    </>















            </CRow>

            {/* Paneer Form - Only shows when Paneer is selected */}
            {selectedProduct == 10 && (
              <>
                {/* SNF, TS, Intake fields
                <CRow className="mb-3 g-2">
                  <CCol xs={12} md={4}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.intake')}</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={intakeValue}
                        onChange={(e) => updateFormState('intakeValue', e.target.value)}
                        placeholder={t('LABELS.enterIntakeAmount')}
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label={t('LABELS.intake')}
                      />
                      <CInputGroupText>{t('LABELS.inLiter')}</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.snf')}</CFormLabel>
                    <CFormInput
                      value={snfValue}
                      onChange={(e) => updateFormState('snfValue', e.target.value)}
                      placeholder={t('LABELS.enterSNFValue')}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label={t('LABELS.snf')}
                    />
                  </CCol>
                  <CCol xs={12} sm={6} md={4}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.ts')}</CFormLabel>
                    <CFormInput
                      value={tsValue}
                      onChange={(e) => updateFormState('tsValue', e.target.value)}
                      placeholder={t('LABELS.enterTSValue')}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label={t('LABELS.ts')}
                    />
                  </CCol>
                </CRow> */}

                <CRow className="mb-3 g-2">
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.paneerToBeCreated')}</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={pannerToBeCreated}
                        readOnly
                        placeholder={t('LABELS.calculatedAutomatically')}
                        className="bg-light text-muted"
                        aria-label={t('LABELS.paneerToBeCreated')}
                      />
                      <CInputGroupText>{t('LABELS.inKg')}</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.paneerCreated')}</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={pannerCreated}
                        onChange={(e) => updateFormState('pannerCreated', e.target.value)}
                        placeholder={t('LABELS.enterCreatedAmount')}
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label={t('LABELS.paneerCreated')}
                      />
                      <CInputGroupText>{t('LABELS.inKg')}</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">
                      {t('LABELS.differenceInCreation')}
                      {differenceInCreation && (
                        <span className="ms-1 badge bg-danger">{t('LABELS.important')}</span>
                      )}
                    </CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={differenceInCreation}
                        readOnly
                        placeholder={t('LABELS.calculatedAutomatically')}
                        style={{
                          backgroundColor: differenceInCreation
                            ? (parseFloat(differenceInCreation) < 0 ? '#ffe6e6' : '#e6ffee')
                            : '#f8f9fa',
                          color: differenceInCreation
                            ? (parseFloat(differenceInCreation) < 0 ? '#dc3545' : '#198754')
                            : '#6c757d',
                          fontWeight: differenceInCreation ? 'bold' : 'normal',
                          border: differenceInCreation
                            ? (parseFloat(differenceInCreation) < 0
                               ? '2px solid #dc3545'
                               : '2px solid #198754')
                            : '1px solid #ced4da'
                        }}
                        aria-label={t('LABELS.differenceInCreation')}
                      />
                      <CInputGroupText>{t('LABELS.inKg')}</CInputGroupText>
                    </CInputGroup>
                </CCol>
                  {/* <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.tsOfCreatedPaneer')}</CFormLabel>
                    <CFormInput
                      value={createdPanner}
                      readOnly
                      placeholder={t('LABELS.calculatedAutomatically')}
                      className="bg-light text-muted"
                      aria-label={t('LABELS.tsOfCreatedPaneer')}
                    />
                  </CCol> */}
                </CRow>

                {differenceInCreation && (
                  <CRow className="mt-1 mb-2">
                    <CCol>
                      <CAlert color={parseFloat(differenceInCreation) < 0 ? "danger" : "success"} className="py-1 mb-0">
                        <strong>
                          {parseFloat(differenceInCreation) < 0
                            ? t('MSG.deficitInProduction', { amount: Math.abs(parseFloat(differenceInCreation)) })
                            : t('MSG.surplusInProduction', { amount: differenceInCreation })}
                        </strong>
                      </CAlert>
                    </CCol>
                  </CRow>
                )}
              </>
            )}

            {/* Tup Form - Only shows when Tup is selected */}
            {selectedProduct == 16 && (
              <>
                <CRow className="mb-3 g-2">
                  {/* <CCol xs={12} sm={6}> */}
                    {/* <CFormLabel className="fw-bold mb-1">{t('LABELS.milkIntake')}</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={milkIntake}
                        onChange={(e) => updateFormState('milkIntake', e.target.value)}
                        placeholder={t('LABELS.enterMilkIntake')}
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label={t('LABELS.milkIntake')}
                      />
                      <CInputGroupText>{t('LABELS.inLiter')}</CInputGroupText>
                    </CInputGroup> */}
                  {/* </CCol> */}
                <CCol xs={12} sm={6}>
                  <CFormLabel className="fw-bold mb-1">{t('LABELS.creamCreated')}</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      value={creamCreated}
                      onChange={(e) => updateFormState('creamCreated', e.target.value)}
                      placeholder={t('LABELS.enterCreamAmount')}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      aria-label={t('LABELS.creamCreated')}
                    />
                    <CInputGroupText>{t('LABELS.inKg')}</CInputGroupText>
                  </CInputGroup>
                </CCol>
                </CRow>

                <CRow className="g-2">
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.tupCreated')}</CFormLabel>
                    <CInputGroup>
                      <CFormInput
                        value={tupCreated}
                        onChange={(e) => updateFormState('tupCreated', e.target.value)}
                        placeholder={t('LABELS.enterTupAmount')}
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        aria-label={t('LABELS.tupCreated')}
                      />
                      <CInputGroupText>{t('LABELS.inKg')}</CInputGroupText>
                    </CInputGroup>
                  </CCol>
                  {/* <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.tupUtaar')}</CFormLabel>
                    <CFormInput
                      value={tupUtaar}
                      readOnly
                      placeholder={t('LABELS.calculatedAutomatically')}
                      className="bg-light text-muted"
                      aria-label={t('LABELS.tupUtaar')}
                    />
                  </CCol> */}
                </CRow>
              </>
            )}

            {/* Control Buttons - Only shows when a product is selected */}
            {selectedProduct && (
              <CCardFooter className="bg-transparent border-0 text-center text-sm-end pt-3 p-0">
                <CButton
                  color="primary"
                  onClick={confirmStorage}
                  className="me-2 mb-1 mb-sm-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <CSpinner size="sm" className="me-1" />
                      {t('LABELS.processing')}
                    </>
                  ) : (
                    t('LABELS.saveCalculation')
                  )}
                </CButton>
                <CButton
                  color="secondary"
                  onClick={resetAllFormStates}
                  disabled={isLoading}
                >
                  {t('LABELS.reset')}
                </CButton>
              </CCardFooter>
            )}
          </CForm>
        </CCardBody>





      </CCard>









      {/* <ProductCalculationHistory  refreshTrigger={refreshHistory}/> */}

      {/* Confirmation Modal */}
      <CModal
        visible={showConfirmModal}
        onClose={() => updateUiState('showConfirmModal', false)}
        aria-labelledby="confirm-modal-title"
      >
        <CModalHeader>
          <CModalTitle id="confirm-modal-title">{t('LABELS.confirmCalculationStorage')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {t('MSG.confirmStoreCalculation')}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            // onClick={() => updateUiState('showConfirmModal', false)}
             onClick={() => handleCalculated()}
            disabled={isLoading}
          >
            {t('LABELS.cancel')}
          </CButton>
          <CButton
            color="primary"
            onClick={selectedProduct === 'Paneer' ? storePaneerCalculation : storeTupCalculation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CSpinner size="sm" className="me-1" />
                {t('LABELS.processing')}
              </>
            ) : (
              t('LABELS.confirm')
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ProductCreationCalculator;
