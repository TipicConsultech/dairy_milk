import React, { useState, useEffect, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle
} from '@coreui/react';
import { useTranslation } from 'react-i18next';
import { getAPICall, put } from '../../util/api';

const LaboratoryUser = () => {
  // Add translation hook
  const { t, i18n } = useTranslation("global");

  // State management
  const [milkTanks, setMilkTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({});

  // Modal state for confirmation dialog
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    tankId: null,
    tankName: '',
    //  tankName: tank.name,
  tankNumber: null,
  });

  // Memoized helper functions to prevent recreating on every render
  const showNotification = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    // Auto hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 3000);
    }
  }, []);

  const fetchMilkTanks = useCallback(async (companyId) => {
    try {
      const response = await getAPICall('/api/milk-tanks');
      console.log(response);
      

      if (response.success) {
        const filteredTanks = response.data.filter(tank => tank.company_id === companyId);
        setMilkTanks(filteredTanks);

        // Initialize form data for all tanks
        const initialFormData = {};
        filteredTanks.forEach(tank => {
          initialFormData[tank.id] = {
            quantity: '',
            snf: '',
            ts: ''
          };
        });
        setFormData(initialFormData);
      } else {
        showNotification('warning', t('MSG.failedToFetchMilkTanks'));
      }
    } catch (err) {
      showNotification('warning', `${t('MSG.errorConnectingToServer')}: ${err.message}`);
      console.error('Error fetching milk tanks:', err);
    }
  }, [showNotification, t]);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await getAPICall('/api/user');
      setCurrentUser(userData);

      if (userData?.company_id) {
        await fetchMilkTanks(userData.company_id);
      } else {
        showNotification('warning', t('MSG.userInfoMissing'));
      }
    } catch (err) {
      showNotification('warning', `${t('MSG.errorInitializingData')}: ${err.message}`);
      console.error('Error during initialization:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchMilkTanks, showNotification, t]);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFormChange = useCallback((tankId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [field]: value
      }
    }));
  }, []);

  const resetForm = useCallback((tankId) => {
    setFormData(prev => ({
      ...prev,
      [tankId]: {
        quantity: '',
        snf: '',
        ts: ''
      }
    }));
  }, []);

  // Enhanced validation function
  const validateInputs = useCallback((tankFormData) => {
    // Check if all fields are filled
    // if (!tankFormData.quantity || !tankFormData.snf || !tankFormData.ts) {
    //   return { isValid: false, message: t('MSG.allFieldsRequired') };
    // }

    // const quantity = parseFloat(tankFormData.quantity);
    // const snf = parseFloat(tankFormData.snf);
    // const ts = parseFloat(tankFormData.ts);

    // // Check for NaN values (invalid numbers)
    // if (isNaN(quantity) || isNaN(snf) || isNaN(ts)) {
    //   return { isValid: false, message: t('MSG.invalidNumberFormat') };
    // }

    // // Check for exactly zero values (0.1, 0.5 etc. should be allowed)
    // if (quantity === 0) {
    //   return { isValid: false, message: t('MSG.quantityCannotBeZero') };
    // }

    // // if (snf === 0) {
    // //   return { isValid: false, message: t('MSG.snfCannotBeZero') };
    // // }

    // // if (ts === 0) {
    // //   return { isValid: false, message: t('MSG.tsCannotBeZero') };
    // // }

    // // Check for negative values
    // if (quantity < 0) {
    //   return { isValid: false, message: t('MSG.quantityCannotBeNegative') };
    // }

    // if (snf < 0) {
    //   return { isValid: false, message: t('MSG.snfCannotBeNegative') };
    // }

    // if (ts < 0) {
    //   return { isValid: false, message: t('MSG.tsCannotBeNegative') };
    // }

    return { isValid: true, message: '' };
  }, [t]);

  const handleSaveMilkParams = useCallback(async (tankId) => {
    if (!tankId || !formData[tankId]) return;



    try {
      const tankFormData = formData[tankId];

      // Validate inputs using the enhanced validation function
      const validation = validateInputs(tankFormData);
      if (!validation.isValid) {
        showNotification('warning', validation.message);
        return;
      }

      // Prepare data for API
      const data = {
        added_quantity: parseFloat(tankFormData.quantity),
        // new_snf: parseFloat(tankFormData.snf),
        // new_ts: parseFloat(tankFormData.ts)
       avg_degree: tankFormData.avg_degree,
       avg_fat:tankFormData.avg_fat,
       avg_rate:tankFormData.avg_rate,
       total_amount:tankFormData.total_amount
      };

      // Call API endpoint
      const response = await put(`/api/milk-tanks/${tankId}/laboratory-update`, data);

      if (response.success) {
        showNotification('success', t('MSG.milkParamsUpdatedSuccess'));
        resetForm(tankId);

        // Refresh milk tanks data
        if (currentUser?.company_id) {
          await fetchMilkTanks(currentUser.company_id);
        }
      } else {
        showNotification('warning', response.message || t('MSG.failedToUpdateMilkParams'));
      }
    } catch (err) {
      // Check if this is a 422 error (likely because of negative quantity)
      if (err.message && err.message.includes('422')) {
        showNotification('warning', t('MSG.invalidInputQuantity'));
      } else {
        showNotification('warning', `${t('MSG.error')}: ${err.message}`);
      }
      console.error('Error updating milk parameters:', err);
    }
  }, [formData, currentUser, showNotification, resetForm, fetchMilkTanks, validateInputs, t]);

  // Function to handle opening the confirmation modal
  const handleRemoveMilkTank = useCallback((tankId, tankName) => {
    setConfirmModal({
      visible: true,
      tankId,
      tankName
    });
  }, []);

  // Function to empty the milk tank after confirmation
  const confirmEmptyTank = useCallback(async () => {
    try {
      const tankId = confirmModal.tankId;

      // Call the empty tank API endpoint
      const response = await put(`/api/milk-tanks/${tankId}/empty-tank`);

      if (response.success) {
        showNotification('success', t('MSG.tankEmptiedSuccess'));

        // Close the modal
        setConfirmModal({
          visible: false,
          tankId: null,
          tankName: ''
        });

        // Refresh milk tanks data
        if (currentUser?.company_id) {
          await fetchMilkTanks(currentUser.company_id);
        }
      } else {
        showNotification('warning', response.message || t('MSG.failedToEmptyTank'));
      }
    } catch (err) {
      showNotification('warning', `${t('MSG.error')}: ${err.message}`);
      console.error('Error emptying milk tank:', err);
    }
  }, [confirmModal, showNotification, currentUser, fetchMilkTanks, t]);

  // Cancel the remove operation
  const cancelEmptyTank = useCallback(() => {
    setConfirmModal({
      visible: false,
      tankId: null,
      tankName: ''
    });
  }, []);

  // Enhanced input validation function for real-time validation
  const validateAndFormatInput = useCallback((value, field) => {
    let inputValue = value;

    // Remove any negative signs
    inputValue = inputValue.replace(/^-/, '');

    // Ensure the value has only one decimal point and up to two decimal places
    inputValue = inputValue.replace(/^(\d*\.?\d{0,2}).*$/, '$1');

    // Allow values like 0.1, 0.5, etc. but prevent multiple leading zeros like 00.5
    if (inputValue.length > 1 && inputValue.startsWith('00')) {
      inputValue = '0' + inputValue.substring(2);
    }

    return inputValue;
  }, []);

  // Pure functions moved outside of component render
  const calculatePercentage = (current, capacity) => {
    if (!current || !capacity || capacity === 0) return 0;
    const percentage = Math.round((current / capacity) * 100);
    return percentage > 100 ? 100 : percentage; // Cap at 100%
  };

  const getColorByPercentage = (percentage) => {
    if (percentage < 30) return '#dc3545'; // Red
    if (percentage < 70) return '#ffc107'; // Yellow
    return '#28a745'; // Green
  };

  // Format milk type for display
  const formatMilkType = (type) => {
    if (type?.toLowerCase().includes('cow')) return t('LABELS.cowMilk');
    if (type?.toLowerCase().includes('buffalo')) return t('LABELS.buffaloMilk');
    return type; // Return original if no match
  };

  // Format the last updated date and time
  const formatLastUpdated = (dateString) => {
    if (!dateString) return t('MSG.neverUpdated');

    const date = new Date(dateString);

    // Return formatted date and time
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Get short text for empty tank button based on tank type
  const getEmptyButtonText = (tankName) => {
    if (tankName?.toLowerCase().includes('cow')) {
      return t('LABELS.emptyCowTank');
    }
    if (tankName?.toLowerCase().includes('buffalo')) {
      return t('LABELS.emptyBuffaloTank');
    }
    return t('LABELS.emptyTank');
  };

  // Loading state
  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  // Memoized styles
  const tankProgressContainerStyle = {
    width: '100%',
    height: '24px',
    backgroundColor: '#e9ecef',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative'
  };

  const tankProgressTextStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  const metricBadgeBaseStyle = {
    padding: '6px 16px',
    borderRadius: '4px',
    fontWeight: '500',
    display: 'inline-block'
  };

  const snfBadgeStyle = {
    ...metricBadgeBaseStyle,
    background: '#e9f5ff',
    color: '#0d6efd'
  };

  const tsBadgeStyle = {
    ...metricBadgeBaseStyle,
    background: '#fff4e6',
    color: '#fd7e14'
  };

  const lastUpdatedStyle = {
    fontSize: '0.85rem',
    color: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const clockIconStyle = {
    marginRight: '5px',
    height: '14px',
    width: '14px'
  };



 

  // Render component
  return (
    <CContainer fluid className="p-0">
      <CCard className="mb-3 shadow-sm">
        <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <h5 className="mb-0">{t('LABELS.Welcome')} {t('LABELS.laboratoryUser')}</h5>
          </div>
        </CCardHeader>

        {/* Notifications */}
        {notification.show && (
          <CAlert color={notification.type} dismissible onClose={() => setNotification({ show: false, type: '', message: '' })}>
            {notification.message}
          </CAlert>
        )}

        <CCardBody className="p-1 p-md-2">
          {/* Milk tanks display with integrated milk inputs */}
          <CRow xs={{ cols: 1 }} md={{ cols: 2 }} className="g-4">
            {milkTanks.length > 0 ? (
              milkTanks.map((tank) => {
                const percentage = calculatePercentage(tank.quantity, tank.capacity);
                const fillColor = getColorByPercentage(percentage);
                const tankFormData = formData[tank.id] || { quantity: '', snf: '', ts: '' };
                const displayName = formatMilkType(tank.name);
                const emptyButtonText = getEmptyButtonText(tank.name);

                return (
                  <CCol className="mb-2" key={tank.id}>
                    <div className="border rounded p-3 h-100 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold">{displayName}</h5>
                        <CBadge color="info" shape="rounded-pill" className="px-3 py-2">
                          {tank.quantity} / {tank.capacity} {t('LABELS.ltr')}
                        </CBadge>
                      </div>

                      {/* Last Updated Time */}
                      <div style={lastUpdatedStyle}>
                        <svg
                          style={clockIconStyle}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{t('LABELS.lastUpdated')}: {formatLastUpdated(tank.updated_at)}</span>
                      </div>

                      {/* Tank fill progress */}
                      <div className="position-relative mb-3">
                        <div style={tankProgressContainerStyle}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: fillColor,
                            transition: 'width 0.3s ease'
                          }}></div>
                          <div style={{
                            ...tankProgressTextStyle,
                            color: percentage > 50 ? 'white' : 'black',
                          }}>
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Metrics display */}
                      {/* <div className="text-center mb-3">
                        <div className="d-inline-flex justify-content-center gap-3">
                          <div className="metric-badge" style={snfBadgeStyle}>
                            {t('LABELS.snfColon')} {tank.snf}%
                          </div>
                          <div className="metric-badge" style={tsBadgeStyle}>
                            {t('LABELS.tsColon')} {tank.ts}%
                          </div>
                        </div>
                      </div> */}

                      {/* Input form with enhanced validation */}
                      <CForm>
                        <CRow className="g-3 mb-3">
                          {/* <CCol xs={12}>
                            <CFormInput
                              type="number"
                              value={tankFormData.quantity}
                              onChange={(e) => {
                                const validatedValue = validateAndFormatInput(e.target.value, 'quantity');
                                handleFormChange(tank.id, 'quantity', validatedValue);
                              }}
                              placeholder={t('LABELS.milkQtyToAdd')}
                              min="0"
                              step="0.01"
                              className="form-control-lg"
                              onKeyDown={(e) => {
                                // Prevent minus sign
                                if (e.key === '-') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </CCol> */}
{(tank.number === 101 || tank.number === 102) && (
  <CCol xs={12}>
    <div className="align-items-center">
      <CFormInput
        type="number"
        step="0.01"
        min="0"
        className="form-control-lg"
        value={formData[tank.id]?.quantity || ''}
        onChange={(e) => {
          const validatedValue = validateAndFormatInput(e.target.value, 'quantity');
          handleFormChange(tank.id, 'quantity', validatedValue);
        }}
        onKeyDown={(e) => {
          if (e.key === '-') e.preventDefault();
        }}
        placeholder={t('LABELS.milkQtyToAdd')}
      />
    </div>
  </CCol>
)}





                          {/* <CCol xs={6}>
                            <div className="d-flex align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>{t('LABELS.snf')}</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.snf}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'snf');
                                  handleFormChange(tank.id, 'snf', validatedValue);
                                }}
                                min="0"
                                placeholder={t('LABELS.snfValue')}
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol> */}

                          {/* <CCol xs={6}>
                            <div className=" align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>{t('LABELS.ts')}</CFormLabel>
                              
                              <CFormInput
                             
                                type="number"
                                step="0.01"
                                value={tankFormData.ts}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'ts');
                                  handleFormChange(tank.id, 'ts', validatedValue);
                                }}
                                min="0"
                                placeholder={t('LABELS.tsValue')}
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol> */}


                          {/* New Flow */}

                          {/* <CCol xs={6}>
                            <div className=" align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>Average Degree</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.avg_degree}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'ts');
                                  handleFormChange(tank.id, 'ts', validatedValue);
                                }}
                                min="0"
                                placeholder='Average Degree'
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol>

                          <CCol xs={6}>
                            <div className=" align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>Average Fat</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.avg_fat}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'ts');
                                  handleFormChange(tank.id, 'ts', validatedValue);
                                }}
                                min="0"
                                placeholder='Average Fat'
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol>  

                            <CCol xs={6}>
                            <div className=" align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>Average Rate</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.avg_rate}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'ts');
                                  handleFormChange(tank.id, 'ts', validatedValue);
                                }}
                                min="0"
                                placeholder='Average Rate'
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol>  


                            <CCol xs={6}>
                            <div className=" align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>Average Amount</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.total_amount}
                                onChange={(e) => {
                                  const validatedValue = validateAndFormatInput(e.target.value, 'ts');
                                  handleFormChange(tank.id, 'ts', validatedValue);
                                }}
                                min="0"
                                placeholder='Average Amount'
                                onKeyDown={(e) => {
                                  // Prevent minus sign
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                          </CCol>     */}


{(tank.number === 101 || tank.number === 102) && (
<>
                          <CCol xs={6}>
  <div className="align-items-center">
    <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
      {t('LABELS.avgDegree')}
    </CFormLabel>
    <CFormInput
      type="number"
      step="0.01"
      min="0"
      value={formData[tank.id]?.avg_degree || ''}
      onChange={(e) =>
        handleFormChange(tank.id, 'avg_degree', validateAndFormatInput(e.target.value, 'avg_degree'))
      }
      onKeyDown={(e) => {
        if (e.key === '-') e.preventDefault();
      }}
      placeholder={t('LABELS.avgDegree')}
    />
  </div>
</CCol>

<CCol xs={6}>
  <div className="align-items-center">
    <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
      {t('LABELS.avgFat')}
    </CFormLabel>
    <CFormInput
      type="number"
      step="0.01"
      min="0"
      value={formData[tank.id]?.avg_fat || ''}
      onChange={(e) =>
        handleFormChange(tank.id, 'avg_fat', validateAndFormatInput(e.target.value, 'avg_fat'))
      }
      onKeyDown={(e) => {
        if (e.key === '-') e.preventDefault();
      }}
      placeholder={t('LABELS.avgFat')}
    />
  </div>
</CCol>

<CCol xs={6}>
  <div className="align-items-center">
    <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
      {t('LABELS.avgRate')}
    </CFormLabel>
    <CFormInput
      type="number"
      step="0.01"
      min="0"
      value={formData[tank.id]?.avg_rate || ''}
      onChange={(e) =>
        handleFormChange(tank.id, 'avg_rate', validateAndFormatInput(e.target.value, 'avg_rate'))
      }
      onKeyDown={(e) => {
        if (e.key === '-') e.preventDefault();
      }}
      placeholder={t('LABELS.avgRate')}
    />
  </div>
</CCol>



<CCol xs={6}>
  <div className="align-items-center">
    <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
      {t('LABELS.totalAmount')}
    </CFormLabel>
    <CFormInput
      type="number"
      step="0.01"
      readOnly
      value={(
        (parseFloat(formData[tank.id]?.avg_rate || 0) *
          parseFloat(formData[tank.id]?.quantity || 0)).toFixed(2)
      )}
      placeholder={t('LABELS.totalAmount')}
    />
  </div>
</CCol>

</>
              )}



{(tank.number === 103) && (

<>
<CCol xs={6}>
      <div className="align-items-center">
        <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
          {t('LABELS.avgDegree')}
        </CFormLabel>
        <CFormInput
          type="number"
          readOnly
          // className="form-control-plaintext"
          value={tank.avg_degree || 0}
          placeholder={t('LABELS.avgDegree')}
        />
      </div>
    </CCol>

    <CCol xs={6}>
      <div className="align-items-center">
        <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '100%' }}>
          {t('LABELS.avgFat')}
        </CFormLabel>
        <CFormInput
          type="number"
          readOnly
          // className="form-control-plaintext"
          value={tank.avg_fat || 0}
          placeholder={t('LABELS.avgFat')}
        />
      </div>
    </CCol>

</>

)}



                        </CRow>

                        <CRow className="g-3">

                          {(tank.number === 101 || tank.number === 102) && (
                          <CCol xs={6}>
                            <CButton
                              color="primary"
                              className="px-4 w-100"
                              onClick={() => handleSaveMilkParams(tank.id)}
                            >
                              {t('LABELS.save')}
                            </CButton>
                          </CCol>
                          )}
                          <CCol xs={6}>
                            <CButton
                              color="danger"
                              variant="outline"
                              className="w-100 px-0 text-nowrap"
                              onClick={() => handleRemoveMilkTank(tank.id, tank.name)}
                            >
                              {emptyButtonText}
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    </div>
                  </CCol>
                );
              })
            ) : (
              <CCol>
                <div className="text-center p-4">
                  {error ? t('MSG.failedToLoadMilkTanks') : t('MSG.noMilkTanksAvailable')}
                </div>
              </CCol>
            )}
          </CRow>
        </CCardBody>
      </CCard>

      {/* Confirmation Modal */}
      <CModal
        visible={confirmModal.visible}
        onClose={cancelEmptyTank}
        aria-labelledby="empty-tank-modal"
        centered
      >
        <CModalHeader onClose={cancelEmptyTank}>
          <CModalTitle id="empty-tank-modal">{t('LABELS.emptyTankConfirmation')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>{t('MSG.emptyTankWarning', { tankName: formatMilkType(confirmModal.tankName) })}</p>
          <ul>
            <li>{t('MSG.quantityWillBeZero')}</li>
            {/* <li>{t('MSG.snfWillBeZero')}</li>
            <li>{t('MSG.tsWillBeZero')}</li> */}
            {confirmModal.tankNumber === 103 && (
  <>
    <li>{t('MSG.avgdegreeBeZero')}</li>
    <li>{t('MSG.avgfatBeZero')}</li>
  </>
)}
            <li>{t('MSG.avgdegreeBeZero')}</li>
            <li>{t('MSG.avgfatBeZero')}</li>
            <li>{t('MSG.avgrateBeZero')}</li>
          </ul>
          <p className="text-danger fw-bold">{t('MSG.thisActionCannotBeUndone')}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelEmptyTank}>
            {t('LABELS.cancel')}
          </CButton>
          <CButton color="danger" onClick={confirmEmptyTank}>
            {t('LABELS.confirmEmpty')}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default LaboratoryUser;