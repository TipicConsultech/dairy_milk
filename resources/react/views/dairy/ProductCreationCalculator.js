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
import { post } from '../../util/api';
import ProductCalculationHistory from './ProductCalculationHistory';

const ProductCreationCalculator = () => {
  // Add translation hook
  const { t, i18n } = useTranslation("global");

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
    { label: t('LABELS.selectProduct'), value: '' },
    { label: t('LABELS.paneer'), value: 'Paneer' },
    { label: t('LABELS.tup'), value: 'Tup' }
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

          <CForm>
            {/* Product Selection Dropdown */}
            <CRow className="mb-3">
              <CCol xs={12} md={6} className="mx-auto">
                <CFormLabel htmlFor="productSelection" className="fw-bold mb-1">
                  {t('LABELS.productSelection')}
                </CFormLabel>
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
            </CRow>

            {/* Paneer Form - Only shows when Paneer is selected */}
            {selectedProduct === 'Paneer' && (
              <>
                {/* SNF, TS, Intake fields */}
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
                </CRow>

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
                  <CCol xs={12} sm={6} lg={3}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.tsOfCreatedPaneer')}</CFormLabel>
                    <CFormInput
                      value={createdPanner}
                      readOnly
                      placeholder={t('LABELS.calculatedAutomatically')}
                      className="bg-light text-muted"
                      aria-label={t('LABELS.tsOfCreatedPaneer')}
                    />
                  </CCol>
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
            {selectedProduct === 'Tup' && (
              <>
                <CRow className="mb-3 g-2">
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.milkIntake')}</CFormLabel>
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
                    </CInputGroup>
                  </CCol>
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
                  <CCol xs={12} sm={6}>
                    <CFormLabel className="fw-bold mb-1">{t('LABELS.tupUtaar')}</CFormLabel>
                    <CFormInput
                      value={tupUtaar}
                      readOnly
                      placeholder={t('LABELS.calculatedAutomatically')}
                      className="bg-light text-muted"
                      aria-label={t('LABELS.tupUtaar')}
                    />
                  </CCol>
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
      <ProductCalculationHistory />

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
            onClick={() => updateUiState('showConfirmModal', false)}
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
