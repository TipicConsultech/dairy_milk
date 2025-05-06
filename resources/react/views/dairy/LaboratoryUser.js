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
    tankName: ''
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

  const handleSaveMilkParams = useCallback(async (tankId) => {
    if (!tankId || !formData[tankId]) return;

    try {
      const tankFormData = formData[tankId];

      // Validate inputs
      if (!tankFormData.quantity || !tankFormData.snf || !tankFormData.ts) {
        showNotification('warning', t('MSG.allFieldsRequired'));
        return;
      }

      // Check for negative quantity
      if (parseFloat(tankFormData.quantity) < 0) {
        showNotification('warning', t('MSG.quantityCannotBeNegative'));
        return;
      }

      // Prepare data for API
      const data = {
        added_quantity: parseFloat(tankFormData.quantity),
        new_snf: parseFloat(tankFormData.snf),
        new_ts: parseFloat(tankFormData.ts)
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
  }, [formData, currentUser, showNotification, resetForm, fetchMilkTanks, t]);

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
            <h5 className="mb-0">{t('LABELS.laboratoryUser')}</h5>
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
                      <div className="text-center mb-3">
                        <div className="d-inline-flex justify-content-center gap-3">
                          <div className="metric-badge" style={snfBadgeStyle}>
                            {t('LABELS.snfColon')} {tank.snf}%
                          </div>
                          <div className="metric-badge" style={tsBadgeStyle}>
                            {t('LABELS.tsColon')} {tank.ts}%
                          </div>
                        </div>
                      </div>

                      {/* Input form */}
                      <CForm>
                        <CRow className="g-3 mb-3">
                          <CCol xs={12}>
                            <CFormInput
                              type="number"
                              value={tankFormData.quantity}
                              onChange={(e) => handleFormChange(tank.id, 'quantity', e.target.value)}
                              placeholder={t('LABELS.milkQtyToAdd')}
                              min="0"
                              className="form-control-lg"
                            />
                          </CCol>
                          <CCol xs={6}>
                            <div className="d-flex align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>{t('LABELS.snf')}</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.snf}
                                onChange={(e) => handleFormChange(tank.id, 'snf', e.target.value)}
                                placeholder={t('LABELS.snfValue')}
                              />
                            </div>
                          </CCol>
                          <CCol xs={6}>
                            <div className="d-flex align-items-center">
                              <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>{t('LABELS.ts')}</CFormLabel>
                              <CFormInput
                                type="number"
                                step="0.01"
                                value={tankFormData.ts}
                                onChange={(e) => handleFormChange(tank.id, 'ts', e.target.value)}
                                placeholder={t('LABELS.tsValue')}
                              />
                            </div>
                          </CCol>
                        </CRow>

                        <CRow className="g-3">
                          <CCol xs={6}>
                            <CButton
                              color="primary"
                              className="px-4 w-100"
                              onClick={() => handleSaveMilkParams(tank.id)}
                            >
                              {t('LABELS.save')}
                            </CButton>
                          </CCol>
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
            <li>{t('MSG.snfWillBeZero')}</li>
            <li>{t('MSG.tsWillBeZero')}</li>
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




//-----------------------------------------------------------

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CContainer,
//   CSpinner,
//   CAlert,
//   CBadge
// } from '@coreui/react';
// import { getAPICall, put } from '../../util/api';

// const LaboratoryUser = () => {
//   // State management
//   const [milkTanks, setMilkTanks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [notification, setNotification] = useState({ show: false, type: '', message: '' });
//   const [currentUser, setCurrentUser] = useState(null);
//   const [formData, setFormData] = useState({});

//   // Memoized helper functions to prevent recreating on every render
//   const showNotification = useCallback((type, message) => {
//     setNotification({ show: true, type, message });
//     // Auto hide success messages after 3 seconds
//     if (type === 'success') {
//       setTimeout(() => {
//         setNotification({ show: false, type: '', message: '' });
//       }, 3000);
//     }
//   }, []);

//   const fetchMilkTanks = useCallback(async (companyId) => {
//     try {
//       const response = await getAPICall('/api/milk-tanks');

//       if (response.success) {
//         const filteredTanks = response.data.filter(tank => tank.company_id === companyId);
//         setMilkTanks(filteredTanks);

//         // Initialize form data for all tanks
//         const initialFormData = {};
//         filteredTanks.forEach(tank => {
//           initialFormData[tank.id] = {
//             quantity: '',
//             snf: '',
//             ts: ''
//           };
//         });
//         setFormData(initialFormData);
//       } else {
//         showNotification('warning', 'Failed to fetch milk tanks data');
//       }
//     } catch (err) {
//       showNotification('warning', `Error connecting to server: ${err.message}`);
//       console.error('Error fetching milk tanks:', err);
//     }
//   }, [showNotification]);

//   const fetchInitialData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const userData = await getAPICall('/api/user');
//       setCurrentUser(userData);

//       if (userData?.company_id) {
//         await fetchMilkTanks(userData.company_id);
//       } else {
//         showNotification('warning', 'User information or company ID is missing');
//       }
//     } catch (err) {
//       showNotification('warning', `Error initializing data: ${err.message}`);
//       console.error('Error during initialization:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchMilkTanks, showNotification]);

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);

//   const handleFormChange = useCallback((tankId, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [tankId]: {
//         ...prev[tankId],
//         [field]: value
//       }
//     }));
//   }, []);

//   const resetForm = useCallback((tankId) => {
//     setFormData(prev => ({
//       ...prev,
//       [tankId]: {
//         quantity: '',
//         snf: '',
//         ts: ''
//       }
//     }));
//   }, []);

//   const handleSaveMilkParams = useCallback(async (tankId) => {
//     if (!tankId || !formData[tankId]) return;

//     try {
//       const tankFormData = formData[tankId];

//       // Validate inputs
//       if (!tankFormData.quantity || !tankFormData.snf || !tankFormData.ts) {
//         showNotification('warning', 'All fields are required');
//         return;
//       }

//       // Check for negative quantity
//       if (parseFloat(tankFormData.quantity) < 0) {
//         showNotification('warning', 'Quantity cannot be negative. Please enter a positive value.');
//         return;
//       }

//       // Prepare data for API
//       const data = {
//         added_quantity: parseFloat(tankFormData.quantity),
//         new_snf: parseFloat(tankFormData.snf),
//         new_ts: parseFloat(tankFormData.ts)
//       };

//       // Call API endpoint
//       const response = await put(`/api/milk-tanks/${tankId}/laboratory-update`, data);

//       if (response.success) {
//         showNotification('success', 'Milk parameters updated successfully!');
//         resetForm(tankId);

//         // Refresh milk tanks data
//         if (currentUser?.company_id) {
//           await fetchMilkTanks(currentUser.company_id);
//         }
//       } else {
//         showNotification('warning', response.message || 'Failed to update milk parameters');
//       }
//     } catch (err) {
//       // Check if this is a 422 error (likely because of negative quantity)
//       if (err.message && err.message.includes('422')) {
//         showNotification('warning', 'Invalid input. Quantity must be a positive number.');
//       } else {
//         showNotification('warning', `Error: ${err.message}`);
//       }
//       console.error('Error updating milk parameters:', err);
//     }
//   }, [formData, currentUser, showNotification, resetForm, fetchMilkTanks]);

//   // Function to handle removal of milk tank (not implemented yet)
//   const handleRemoveMilkTank = useCallback((tankId, tankName) => {
//     // This function will be implemented later
//     console.log(`Remove tank ${tankId}: ${tankName}`);
//   }, []);

//   // Pure functions moved outside of component render
//   const calculatePercentage = (current, capacity) => {
//     if (!current || !capacity || capacity === 0) return 0;
//     const percentage = Math.round((current / capacity) * 100);
//     return percentage > 100 ? 100 : percentage; // Cap at 100%
//   };

//   const getColorByPercentage = (percentage) => {
//     if (percentage < 30) return '#dc3545'; // Red
//     if (percentage < 70) return '#ffc107'; // Yellow
//     return '#28a745'; // Green
//   };

//   // Format milk type for display
//   const formatMilkType = (type) => {
//     if (type?.toLowerCase().includes('cow')) return 'Cow Milk';
//     if (type?.toLowerCase().includes('buffalo')) return 'Buffalo Milk';
//     return type; // Return original if no match
//   };

//   // Format the last updated date and time
//   const formatLastUpdated = (dateString) => {
//     if (!dateString) return 'Never updated';

//     const date = new Date(dateString);

//     // Return formatted date and time
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     }).format(date);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <CContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
//         <CSpinner color="primary" />
//       </CContainer>
//     );
//   }

//   // Memoized styles
//   const tankProgressContainerStyle = {
//     width: '100%',
//     height: '24px',
//     backgroundColor: '#e9ecef',
//     borderRadius: '6px',
//     overflow: 'hidden',
//     position: 'relative'
//   };

//   const tankProgressTextStyle = {
//     position: 'absolute',
//     top: '0',
//     left: '0',
//     width: '100%',
//     height: '100%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontWeight: 'bold',
//     fontSize: '0.9rem'
//   };

//   const metricBadgeBaseStyle = {
//     padding: '6px 16px',
//     borderRadius: '4px',
//     fontWeight: '500',
//     display: 'inline-block'
//   };

//   const snfBadgeStyle = {
//     ...metricBadgeBaseStyle,
//     background: '#e9f5ff',
//     color: '#0d6efd'
//   };

//   const tsBadgeStyle = {
//     ...metricBadgeBaseStyle,
//     background: '#fff4e6',
//     color: '#fd7e14'
//   };

//   const lastUpdatedStyle = {
//     fontSize: '0.85rem',
//     color: '#6c757d',
//     display: 'flex',
//     alignItems: 'center',
//     marginBottom: '10px'
//   };

//   const clockIconStyle = {
//     marginRight: '5px',
//     height: '14px',
//     width: '14px'
//   };

//   // Render component
//   return (
//     <CContainer fluid className="p-0">
//       <CCard className="mb-3 shadow-sm">
//         <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
//           <div className="d-flex justify-content-between align-items-center flex-wrap">
//             <h5 className="mb-0">Lab Technician</h5>
//           </div>
//         </CCardHeader>

//         {/* Notifications */}
//         {notification.show && (
//           <CAlert color={notification.type} dismissible onClose={() => setNotification({ show: false, type: '', message: '' })}>
//             {notification.message}
//           </CAlert>
//         )}

//         <CCardBody className="p-1 p-md-2">
//           {/* Milk tanks display with integrated milk inputs */}
//           <CRow xs={{ cols: 1 }} md={{ cols: 2 }} className="g-4">
//             {milkTanks.length > 0 ? (
//               milkTanks.map((tank) => {
//                 const percentage = calculatePercentage(tank.quantity, tank.capacity);
//                 const fillColor = getColorByPercentage(percentage);
//                 const tankFormData = formData[tank.id] || { quantity: '', snf: '', ts: '' };
//                 const displayName = formatMilkType(tank.name);

//                 return (
//                   <CCol className="mb-2" key={tank.id}>
//                     <div className="border rounded p-3 h-100 shadow-sm">
//                       <div className="d-flex justify-content-between align-items-center mb-3">
//                         <h5 className="mb-0 fw-bold">{displayName}</h5>
//                         <CBadge color="info" shape="rounded-pill" className="px-3 py-2">
//                           {tank.quantity} / {tank.capacity} Ltr
//                         </CBadge>
//                       </div>

//                       {/* Last Updated Time */}
//                       <div style={lastUpdatedStyle}>
//                         <svg
//                           style={clockIconStyle}
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor">
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                           />
//                         </svg>
//                         <span>Last updated: {formatLastUpdated(tank.updated_at)}</span>
//                       </div>

//                       {/* Tank fill progress */}
//                       <div className="position-relative mb-3">
//                         <div style={tankProgressContainerStyle}>
//                           <div style={{
//                             width: `${percentage}%`,
//                             height: '100%',
//                             backgroundColor: fillColor,
//                             transition: 'width 0.3s ease'
//                           }}></div>
//                           <div style={{
//                             ...tankProgressTextStyle,
//                             color: percentage > 50 ? 'white' : 'black',
//                           }}>
//                             {percentage}%
//                           </div>
//                         </div>
//                       </div>

//                       {/* Metrics display */}
//                       <div className="text-center mb-3">
//                         <div className="d-inline-flex justify-content-center gap-3">
//                           <div className="metric-badge" style={snfBadgeStyle}>
//                             SNF: {tank.snf}%
//                           </div>
//                           <div className="metric-badge" style={tsBadgeStyle}>
//                             TS: {tank.ts}%
//                           </div>
//                         </div>
//                       </div>

//                       {/* Input form */}
//                       <CForm>
//                         <CRow className="g-3 mb-3">
//                           <CCol xs={12}>
//                             <CFormInput
//                               type="number"
//                               value={tankFormData.quantity}
//                               onChange={(e) => handleFormChange(tank.id, 'quantity', e.target.value)}
//                               placeholder="Milk Qty to Add (Ltr)"
//                               min="0"
//                               className="form-control-lg"
//                             />
//                           </CCol>
//                           <CCol xs={6}>
//                             <div className="d-flex align-items-center">
//                               <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>SNF</CFormLabel>
//                               <CFormInput
//                                 type="number"
//                                 step="0.01"
//                                 value={tankFormData.snf}
//                                 onChange={(e) => handleFormChange(tank.id, 'snf', e.target.value)}
//                                 placeholder="SNF Value"
//                               />
//                             </div>
//                           </CCol>
//                           <CCol xs={6}>
//                             <div className="d-flex align-items-center">
//                               <CFormLabel className="mb-0 me-2 fw-bold" style={{ width: '40px' }}>TS</CFormLabel>
//                               <CFormInput
//                                 type="number"
//                                 step="0.01"
//                                 value={tankFormData.ts}
//                                 onChange={(e) => handleFormChange(tank.id, 'ts', e.target.value)}
//                                 placeholder="TS Value"
//                               />
//                             </div>
//                           </CCol>
//                         </CRow>

//                         <CRow className="g-3">
//                           <CCol xs={6}>
//                             <CButton
//                               color="primary"
//                               className="px-4 w-100"
//                               onClick={() => handleSaveMilkParams(tank.id)}
//                             >
//                               Save
//                             </CButton>
//                           </CCol>
//                           <CCol xs={6}>
//                             <CButton
//                               color="danger"
//                               variant="outline"
//                               className="px-4 w-100"
//                               onClick={() => handleRemoveMilkTank(tank.id, tank.name)}
//                             >
//                               Remove {displayName} Tank
//                             </CButton>
//                           </CCol>
//                         </CRow>
//                       </CForm>
//                     </div>
//                   </CCol>
//                 );
//               })
//             ) : (
//               <CCol>
//                 <div className="text-center p-4">
//                   {error ? 'Failed to load milk tanks' : 'No milk tanks available for your company'}
//                 </div>
//               </CCol>
//             )}
//           </CRow>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// export default LaboratoryUser;

//--------------------------V2----------------------------------
// import React, { useState } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CContainer,
//   CBadge
// } from '@coreui/react';

// const LaboratoryUser = () => {
//   // Tank data with state - this would be fetched from backend
//   const [tanks, setTanks] = useState([
//     {
//       id: 1,
//       type: 'Buffalo Milk',
//       current: 500,
//       capacity: 500,
//       percentage: 100,
//       color: 'success',
//       snf: '8.7',
//       ts: '15.3'
//     },
//     {
//       id: 2,
//       type: 'Cow Milk',
//       current: 300,
//       capacity: 700,
//       percentage: 43,
//       color: 'warning',
//       snf: '8.2',
//       ts: '12.5'
//     }
//   ]);

//   // State for milk data form fields
//   const [buffaloQuantity, setBuffaloQuantity] = useState('');
//   const [buffaloSNF, setBuffaloSNF] = useState('');
//   const [buffaloTS, setBuffaloTS] = useState('');
//   const [cowQuantity, setCowQuantity] = useState('');
//   const [cowSNF, setCowSNF] = useState('');
//   const [cowTS, setCowTS] = useState('');

//   // State to track which form is visible
//   const [showBuffaloForm, setShowBuffaloForm] = useState(false);
//   const [showCowForm, setShowCowForm] = useState(false);

//   // Toggle buffalo form visibility
//   const toggleBuffaloForm = () => {
//     setShowBuffaloForm(!showBuffaloForm);
//     if (!showBuffaloForm) {
//       setShowCowForm(false); // Close cow form when opening buffalo form
//     }
//   };

//   // Toggle cow form visibility
//   const toggleCowForm = () => {
//     setShowCowForm(!showCowForm);
//     if (!showCowForm) {
//       setShowBuffaloForm(false); // Close buffalo form when opening cow form
//     }
//   };

//   // Handle form save for milk parameters
//   const handleSaveMilkParams = () => {
//     // For Buffalo Milk
//     if (showBuffaloForm && buffaloQuantity && buffaloSNF && buffaloTS) {
//       // Here you would make an API call to the backend
//       // Example:
//       // const buffaloData = {
//       //   quantity: buffaloQuantity,
//       //   snf: buffaloSNF,
//       //   ts: buffaloTS
//       // };
//       // saveMilkDataToBackend('buffalo', buffaloData);

//       console.log('Sending Buffalo data to backend:', {
//         quantity: buffaloQuantity,
//         snf: buffaloSNF,
//         ts: buffaloTS
//       });

//       // Reset buffalo form fields
//       setBuffaloQuantity('');
//       setBuffaloSNF('');
//       setBuffaloTS('');
//       setShowBuffaloForm(false);

//       // After successful API call, you would fetch the updated data
//       // fetchUpdatedTankData();
//     }

//     // For Cow Milk
//     if (showCowForm && cowQuantity && cowSNF && cowTS) {
//       // Here you would make an API call to the backend
//       // Example:
//       // const cowData = {
//       //   quantity: cowQuantity,
//       //   snf: cowSNF,
//       //   ts: cowTS
//       // };
//       // saveMilkDataToBackend('cow', cowData);

//       console.log('Sending Cow data to backend:', {
//         quantity: cowQuantity,
//         snf: cowSNF,
//         ts: cowTS
//       });

//       // Reset cow form fields
//       setCowQuantity('');
//       setCowSNF('');
//       setCowTS('');
//       setShowCowForm(false);

//       // After successful API call, you would fetch the updated data
//       // fetchUpdatedTankData();
//     }
//   };

//   // Handle form cancel for milk parameters
//   const handleCancelMilkParams = () => {
//     // Reset form fields
//     setBuffaloQuantity('');
//     setBuffaloSNF('');
//     setBuffaloTS('');
//     setCowQuantity('');
//     setCowSNF('');
//     setCowTS('');

//     // Hide forms
//     setShowBuffaloForm(false);
//     setShowCowForm(false);
//   };

//   return (
//     <CContainer fluid className="p-0">
//       {/* Main card with laboratory user header */}
//       <CCard className="mb-2">
//         <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h5 className="mb-0">Laboratory User</h5>
//           </div>
//         </CCardHeader>

//         {/* Milk info header */}
//         <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.75rem' }}>
//           <CRow>
//             <CCol md={6} className="mb-3 mb-md-0">
//               <div
//                 className="card p-3 shadow-sm"
//                 style={{
//                   cursor: 'pointer',
//                   backgroundColor: showBuffaloForm ? '#f0f0ff' : 'white',
//                   borderLeft: '4px solid #2eb85c',
//                   transition: 'all 0.2s ease'
//                 }}
//                 onClick={toggleBuffaloForm}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <h5 className="mb-0">Buffalo Milk</h5>
//                   <div>
//                     <CBadge color="info" className="me-2" style={{ fontSize: '0.85rem' }}>
//                       SNF: {tanks[0].snf}
//                     </CBadge>
//                     <CBadge color="dark" style={{ fontSize: '0.85rem' }}>
//                       TS: {tanks[0].ts}
//                     </CBadge>
//                   </div>
//                 </div>

//                 <div className="d-flex justify-content-between align-items-center mb-1">
//                   <div className="small text-muted">Capacity</div>
//                   <div className="small">{tanks[0].current} / {tanks[0].capacity} Ltr</div>
//                 </div>

//                 <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
//                   <div
//                     style={{
//                       width: `${tanks[0].percentage}%`,
//                       height: '100%',
//                       backgroundColor: tanks[0].percentage >= 75 ? '#2eb85c' : (tanks[0].percentage >= 50 ? '#f9b115' : '#e55353'),
//                       borderRadius: '10px'
//                     }}
//                   ></div>
//                 </div>

//                 <div className="d-flex justify-content-end mt-1">
//                   <small>{tanks[0].percentage}%</small>
//                 </div>
//               </div>
//             </CCol>

//             <CCol md={6}>
//               <div
//                 className="card p-3 shadow-sm"
//                 style={{
//                   cursor: 'pointer',
//                   backgroundColor: showCowForm ? '#f0f0ff' : 'white',
//                   borderLeft: '4px solid #f9b115',
//                   transition: 'all 0.2s ease'
//                 }}
//                 onClick={toggleCowForm}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <h5 className="mb-0">Cow Milk</h5>
//                   <div>
//                     <CBadge color="info" className="me-2" style={{ fontSize: '0.85rem' }}>
//                       SNF: {tanks[1].snf}
//                     </CBadge>
//                     <CBadge color="dark" style={{ fontSize: '0.85rem' }}>
//                       TS: {tanks[1].ts}
//                     </CBadge>
//                   </div>
//                 </div>

//                 <div className="d-flex justify-content-between align-items-center mb-1">
//                   <div className="small text-muted">Capacity</div>
//                   <div className="small">{tanks[1].current} / {tanks[1].capacity} Ltr</div>
//                 </div>

//                 <div style={{ width: '100%', height: '10px', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
//                   <div
//                     style={{
//                       width: `${tanks[1].percentage}%`,
//                       height: '100%',
//                       backgroundColor: tanks[1].percentage >= 75 ? '#2eb85c' : (tanks[1].percentage >= 50 ? '#f9b115' : '#e55353'),
//                       borderRadius: '10px'
//                     }}
//                   ></div>
//                 </div>

//                 <div className="d-flex justify-content-end mt-1">
//                   <small>{tanks[1].percentage}%</small>
//                 </div>
//               </div>
//             </CCol>
//           </CRow>
//         </CCardHeader>

//         <CCardBody className="p-3">
//           <CForm>
//             {/* Buffalo milk form - only shown when buffalo milk is clicked */}
//             {showBuffaloForm && (
//               <CRow className="mb-3">
//                 <CCol md={2}>
//                   <CFormLabel className="mb-0">Buffalo milk</CFormLabel>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormInput
//                     type="number"
//                     value={buffaloQuantity}
//                     onChange={(e) => setBuffaloQuantity(e.target.value)}
//                     placeholder="Quantity"
//                   />
//                 </CCol>
//                 <CCol md={1} className="text-center">
//                   <CFormLabel className="mb-0">SNF</CFormLabel>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormInput
//                     type="number"
//                     step="0.01"
//                     value={buffaloSNF}
//                     onChange={(e) => setBuffaloSNF(e.target.value)}
//                     placeholder="SNF Value"
//                   />
//                 </CCol>
//                 <CCol md={1} className="text-center">
//                   <CFormLabel className="mb-0">TS</CFormLabel>
//                 </CCol>
//                 <CCol md={2}>
//                   <CFormInput
//                     type="number"
//                     step="0.01"
//                     value={buffaloTS}
//                     onChange={(e) => setBuffaloTS(e.target.value)}
//                     placeholder="TS Value"
//                   />
//                 </CCol>
//               </CRow>
//             )}

//             {/* Cow milk form - only shown when cow milk is clicked */}
//             {showCowForm && (
//               <CRow className="mb-3">
//                 <CCol md={2}>
//                   <CFormLabel className="mb-0">Cow Milk</CFormLabel>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormInput
//                     type="number"
//                     value={cowQuantity}
//                     onChange={(e) => setCowQuantity(e.target.value)}
//                     placeholder="Quantity"
//                   />
//                 </CCol>
//                 <CCol md={1} className="text-center">
//                   <CFormLabel className="mb-0">SNF</CFormLabel>
//                 </CCol>
//                 <CCol md={3}>
//                   <CFormInput
//                     type="number"
//                     step="0.01"
//                     value={cowSNF}
//                     onChange={(e) => setCowSNF(e.target.value)}
//                     placeholder="SNF Value"
//                   />
//                 </CCol>
//                 <CCol md={1} className="text-center">
//                   <CFormLabel className="mb-0">TS</CFormLabel>
//                 </CCol>
//                 <CCol md={2}>
//                   <CFormInput
//                     type="number"
//                     step="0.01"
//                     value={cowTS}
//                     onChange={(e) => setCowTS(e.target.value)}
//                     placeholder="TS Value"
//                   />
//                 </CCol>
//               </CRow>
//             )}

//             {/* Show Save/Cancel buttons only when any form is visible */}
//             {(showBuffaloForm || showCowForm) && (
//               <CRow>
//                 <CCol xs={6} md={2}>
//                   <CButton
//                     color="primary"
//                     className="px-4 w-100"
//                     onClick={handleSaveMilkParams}
//                   >
//                     SAVE
//                   </CButton>
//                 </CCol>
//                 <CCol xs={6} md={2}>
//                   <CButton
//                     color="danger"
//                     className="px-4 border w-100"
//                     onClick={handleCancelMilkParams}
//                   >
//                     Cancel
//                   </CButton>
//                 </CCol>
//               </CRow>
//             )}
//           </CForm>
//         </CCardBody>
//       </CCard>
//     </CContainer>
//   );
// };

// export default LaboratoryUser;


//---------------------------
// import React, { useState, useEffect } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CProgress,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CContainer,
//   CSpinner,
//   CAlert
// } from '@coreui/react';
// import { getAPICall } from '../../util/api'; // Import the API utility

// const LaboratoryUser = () => {
//   // State for milk data
//   const [buffaloQuantity, setBuffaloQuantity] = useState('');
//   const [buffaloSNF, setBuffaloSNF] = useState('');
//   const [buffaloTS, setBuffaloTS] = useState('');
//   const [cowQuantity, setCowQuantity] = useState('');
//   const [cowSNF, setCowSNF] = useState('');
//   const [cowTS, setCowTS] = useState('');

//   // State for tanks data
//   const [tanks, setTanks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');

//   // Fetch milk tanks data on component mount
//   useEffect(() => {
//     fetchMilkTanks();
//   }, []);

//   // Function to fetch milk tanks data
//   const fetchMilkTanks = async () => {
//     try {
//       setLoading(true);
//       const response = await getAPICall(`/api/milk-tanks`);
//       console.log('API Response:', response.data); // Debug log
//       setTanks(response.data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching milk tanks:', err);
//       setError('Failed to load milk tanks data');
//       setLoading(false);
//     }
//   };

//   // Handle form save for milk parameters
//   const handleSaveMilkParams = async () => {
//     try {
//       setLoading(true);
//       // Find the tank IDs for buffalo and cow milk
//       const buffaloTank = tanks.find(tank => tank.name === 'Buffalo');
//       const cowTank = tanks.find(tank => tank.name === 'Cow');

//       // Update Buffalo Milk Tank
//       if (buffaloTank && (buffaloQuantity || buffaloSNF || buffaloTS)) {
//         const updateData = {};
//         if (buffaloQuantity) updateData.quantity = parseFloat(buffaloQuantity);
//         if (buffaloSNF) updateData.snf = parseFloat(buffaloSNF);
//         if (buffaloTS) updateData.ts = parseFloat(buffaloTS);

//         await getAPICall(`/api/milk-tanks/${buffaloTank.id}`, 'PATCH', updateData);
//       }

//       // Update Cow Milk Tank
//       if (cowTank && (cowQuantity || cowSNF || cowTS)) {
//         const updateData = {};
//         if (cowQuantity) updateData.quantity = parseFloat(cowQuantity);
//         if (cowSNF) updateData.snf = parseFloat(cowSNF);
//         if (cowTS) updateData.ts = parseFloat(cowTS);

//         await getAPICall(`/api/milk-tanks/${cowTank.id}`, 'PATCH', updateData);
//       }

//       // Refresh milk tanks data
//       await fetchMilkTanks();

//       // Reset form fields
//       handleCancelMilkParams();

//       // Show success message
//       setSuccessMessage('Milk parameters updated successfully');
//       setTimeout(() => setSuccessMessage(''), 3000);

//       setLoading(false);
//     } catch (err) {
//       console.error('Error updating milk parameters:', err);
//       setError('Failed to update milk parameters');
//       setLoading(false);
//     }
//   };

//   // Handle form cancel for milk parameters
//   const handleCancelMilkParams = () => {
//     // Reset form fields
//     setBuffaloQuantity('');
//     setBuffaloSNF('');
//     setBuffaloTS('');
//     setCowQuantity('');
//     setCowSNF('');
//     setCowTS('');
//     // Clear any error messages
//     setError(null);
//   };

//   // Calculate percentage function
//   const calculatePercentage = (quantity, capacity) => {
//     if (!capacity) return 0;
//     const percentage = (quantity / capacity) * 100;
//     return Math.round(percentage);
//   };

//   // Get appropriate color based on percentage
//   const getColorByPercentage = (percentage) => {
//     if (percentage >= 90) return 'danger';
//     if (percentage >= 60) return 'success';
//     if (percentage >= 30) return 'warning';
//     return 'info';
//   };

//   // Get tanks by type (cow/buffalo)
//   const getBuffaloTank = () => {
//     const buffaloTank = tanks.find(t => t.name === 'Buffalo');
//     return buffaloTank || { id: 0, name: 'Buffalo', quantity: 0, capacity: 0, snf: 0, ts: 0 };
//   };

//   const getCowTank = () => {
//     // Get the first cow tank (or could implement logic to choose a specific one)
//     const cowTank = tanks.find(t => t.name === 'Cow');
//     return cowTank || { id: 0, name: 'Cow', quantity: 0, capacity: 0, snf: 0, ts: 0 };
//   };

//   const buffaloTank = getBuffaloTank();
//   const cowTank = getCowTank();

//   const buffaloPercentage = calculatePercentage(buffaloTank.quantity, buffaloTank.capacity);
//   const cowPercentage = calculatePercentage(cowTank.quantity, cowTank.capacity);

//   return (
//     <CContainer fluid className="p-0">
//       {/* Main card with laboratory user header */}
//       <CCard className="mb-2">
//         <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h5 className="mb-0">Laboratory User</h5>
//           </div>
//         </CCardHeader>

//         {loading && (
//           <div className="text-center my-3">
//             <CSpinner color="primary" />
//             <p className="mt-2">Loading data...</p>
//           </div>
//         )}

//         {error && (
//           <CAlert color="danger" dismissible onClose={() => setError(null)}>
//             {error}
//           </CAlert>
//         )}

//         {successMessage && (
//           <CAlert color="success" dismissible onClose={() => setSuccessMessage('')}>
//             {successMessage}
//           </CAlert>
//         )}

//         {!loading && (
//           <>
//             {/* Milk info header */}
//             <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.75rem' }}>
//               <CRow>
//                 <CCol md={6}>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Buffalo Milk</h5>
//                     <span>Capacity: {buffaloTank.quantity?.toFixed(1) || 0} / {buffaloTank.capacity || 0} Ltr</span>
//                   </div>
//                   <CProgress
//                     value={buffaloPercentage}
//                     color={getColorByPercentage(buffaloPercentage)}
//                     className="mb-0"
//                     height={20}
//                   >
//                     {buffaloPercentage}%
//                   </CProgress>
//                 </CCol>
//                 <CCol md={6}>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Cow Milk</h5>
//                     <span>Capacity: {cowTank.quantity?.toFixed(1) || 0} / {cowTank.capacity || 0} Ltr</span>
//                   </div>
//                   <CProgress
//                     value={cowPercentage}
//                     color={getColorByPercentage(cowPercentage)}
//                     className="mb-0"
//                     height={20}
//                   >
//                     {cowPercentage}%
//                   </CProgress>
//                 </CCol>
//               </CRow>
//             </CCardHeader>

//             <CCardBody className="p-3">
//               <CForm>
//                 <CRow className="mb-3">
//                   <CCol md={2}>
//                     <CFormLabel className="mb-0">Buffalo milk</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       value={buffaloQuantity}
//                       onChange={(e) => setBuffaloQuantity(e.target.value)}
//                       placeholder="Quantity"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">SNF</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={buffaloSNF}
//                       onChange={(e) => setBuffaloSNF(e.target.value)}
//                       placeholder="SNF Value"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">TS</CFormLabel>
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={buffaloTS}
//                       onChange={(e) => setBuffaloTS(e.target.value)}
//                       placeholder="TS Value"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="mb-3">
//                   <CCol md={2}>
//                     <CFormLabel className="mb-0">Cow Milk</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       value={cowQuantity}
//                       onChange={(e) => setCowQuantity(e.target.value)}
//                       placeholder="Quantity"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">SNF</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={cowSNF}
//                       onChange={(e) => setCowSNF(e.target.value)}
//                       placeholder="SNF Value"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">TS</CFormLabel>
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={cowTS}
//                       onChange={(e) => setCowTS(e.target.value)}
//                       placeholder="TS Value"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow>
//                   <CCol xs={6} md={2}>
//                     <CButton
//                       color="primary"
//                       className="px-4 w-100"
//                       onClick={handleSaveMilkParams}
//                       disabled={loading}
//                     >
//                       {loading ? <CSpinner size="sm" /> : 'SAVE'}
//                     </CButton>
//                   </CCol>
//                   <CCol xs={6} md={2}>
//                     <CButton
//                       color="danger"
//                       className="px-4 border w-100"
//                       onClick={handleCancelMilkParams}
//                       disabled={loading}
//                     >
//                       Cancel
//                     </CButton>
//                   </CCol>
//                 </CRow>
//               </CForm>
//             </CCardBody>
//           </>
//         )}
//       </CCard>
//     </CContainer>
//   );
// };

// export default LaboratoryUser;



//----------------------------------
// import React, { useState, useEffect } from 'react';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CProgress,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CButton,
//   CContainer,
//   CSpinner,
//   CAlert
// } from '@coreui/react';
// import { getAPICall, put } from '../../util/api'; // Import the API utility

// const LaboratoryUser = () => {
//   // State for milk data
//   const [buffaloQuantity, setBuffaloQuantity] = useState('');
//   const [buffaloSNF, setBuffaloSNF] = useState('');
//   const [buffaloTS, setBuffaloTS] = useState('');
//   const [cowQuantity, setCowQuantity] = useState('');
//   const [cowSNF, setCowSNF] = useState('');
//   const [cowTS, setCowTS] = useState('');

//   // State for tanks data
//   const [tanks, setTanks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');

//   // Fetch milk tanks data on component mount
//   useEffect(() => {
//     fetchMilkTanks();
//   }, []);

//   // Function to fetch milk tanks data
//   const fetchMilkTanks = async () => {
//     try {
//       setLoading(true);
//       const response = await getAPICall(`/api/milk-tanks`);
//       console.log('API Response:', response); // Debug log to check the structure

//       // Check if response has a data property (for nested response structure)
//       const tanksData = response.data ? response.data : response;
//       setTanks(tanksData);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching milk tanks:', err);
//       setError('Failed to load milk tanks data');
//       setLoading(false);
//     }
//   };

//   // Updated function for making PUT requests with all required fields
//   const updateTank = async (tankId, updateData) => {
//     try {
//       // Get the current tank data to ensure we have all required fields
//       const currentTank = tanks.find(tank => tank.id === tankId);

//       if (!currentTank) {
//         throw new Error(`Tank with ID ${tankId} not found`);
//       }

//       // Create a complete payload with all required fields
//       const completePayload = {
//         company_id: currentTank.company_id,
//         number: currentTank.number || 0,
//         name: currentTank.name,
//         capacity: currentTank.capacity,
//         quantity: currentTank.quantity,
//         snf: currentTank.snf,
//         ts: currentTank.ts,
//         isVisible: currentTank.isVisible !== undefined ? currentTank.isVisible : true,
//         // Override with the updated fields
//         ...updateData
//       };

//       console.log(`Sending complete payload for tank ${tankId}:`, completePayload);

//       // Use the PUT function to update the tank
//       const response = await put(`/api/milk-tanks/${tankId}`, completePayload);
//       return response;

//     } catch (error) {
//       console.error(`Error updating tank ${tankId}:`, error);
//       throw error;
//     }
//   };

//   // Handle form save for milk parameters
//   const handleSaveMilkParams = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Find the tank IDs for buffalo and cow milk
//       const buffaloTank = tanks.find(tank => tank.name === 'Buffalo');
//       const cowTank = tanks.find(tank => tank.name === 'Cow');

//       // Update Buffalo Milk Tank
//       if (buffaloTank && (buffaloQuantity || buffaloSNF || buffaloTS)) {
//         const updateData = {};
//         if (buffaloQuantity) updateData.quantity = parseFloat(buffaloQuantity);
//         if (buffaloSNF) updateData.snf = parseFloat(buffaloSNF);
//         if (buffaloTS) updateData.ts = parseFloat(buffaloTS);

//         console.log(`Updating Buffalo tank ${buffaloTank.id} with:`, updateData);
//         await updateTank(buffaloTank.id, updateData);
//       }

//       // Update Cow Milk Tank
//       if (cowTank && (cowQuantity || cowSNF || cowTS)) {
//         const updateData = {};
//         if (cowQuantity) updateData.quantity = parseFloat(cowQuantity);
//         if (cowSNF) updateData.snf = parseFloat(cowSNF);
//         if (cowTS) updateData.ts = parseFloat(cowTS);

//         console.log(`Updating Cow tank ${cowTank.id} with:`, updateData);
//         await updateTank(cowTank.id, updateData);
//       }

//       // Refresh milk tanks data
//       await fetchMilkTanks();

//       // Reset form fields
//       handleCancelMilkParams();

//       // Show success message
//       setSuccessMessage('Milk parameters updated successfully');
//       setTimeout(() => setSuccessMessage(''), 3000);

//     } catch (err) {
//       console.error('Error updating milk parameters:', err);
//       setError(`Failed to update milk parameters: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle form cancel for milk parameters
//   const handleCancelMilkParams = () => {
//     // Reset form fields
//     setBuffaloQuantity('');
//     setBuffaloSNF('');
//     setBuffaloTS('');
//     setCowQuantity('');
//     setCowSNF('');
//     setCowTS('');
//     // Clear any error messages
//     setError(null);
//   };

//   // Calculate percentage function
//   const calculatePercentage = (quantity, capacity) => {
//     if (!capacity) return 0;
//     const percentage = (quantity / capacity) * 100;
//     return Math.round(percentage);
//   };

//   // Get appropriate color based on percentage
//   const getColorByPercentage = (percentage) => {
//     if (percentage >= 90) return 'danger';
//     if (percentage >= 60) return 'success';
//     if (percentage >= 30) return 'warning';
//     return 'info';
//   };

//   // Get tanks by type (cow/buffalo)
//   const getBuffaloTank = () => {
//     const buffaloTank = tanks.find(t => t.name === 'Buffalo');
//     return buffaloTank || { id: 0, name: 'Buffalo', quantity: 0, capacity: 0, snf: 0, ts: 0 };
//   };

//   const getCowTank = () => {
//     // Get the first cow tank (or could implement logic to choose a specific one)
//     const cowTank = tanks.find(t => t.name === 'Cow');
//     return cowTank || { id: 0, name: 'Cow', quantity: 0, capacity: 0, snf: 0, ts: 0 };
//   };

//   const buffaloTank = getBuffaloTank();
//   const cowTank = getCowTank();

//   const buffaloPercentage = calculatePercentage(buffaloTank.quantity, buffaloTank.capacity);
//   const cowPercentage = calculatePercentage(cowTank.quantity, cowTank.capacity);

//   return (
//     <CContainer fluid className="p-0">
//       {/* Main card with laboratory user header */}
//       <CCard className="mb-2">
//         <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h5 className="mb-0">Laboratory User</h5>
//           </div>
//         </CCardHeader>

//         {loading && (
//           <div className="text-center my-3">
//             <CSpinner color="primary" />
//             <p className="mt-2">Loading data...</p>
//           </div>
//         )}

//         {error && (
//           <CAlert color="danger" dismissible onClose={() => setError(null)}>
//             {error}
//           </CAlert>
//         )}

//         {successMessage && (
//           <CAlert color="success" dismissible onClose={() => setSuccessMessage('')}>
//             {successMessage}
//           </CAlert>
//         )}

//         {!loading && (
//           <>
//             {/* Milk info header */}
//             <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.75rem' }}>
//               <CRow>
//                 <CCol md={6}>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Buffalo Milk</h5>
//                     <span>Capacity: {buffaloTank.quantity?.toFixed(1) || 0} / {buffaloTank.capacity || 0} Ltr</span>
//                   </div>
//                   <CProgress
//                     value={buffaloPercentage}
//                     color={getColorByPercentage(buffaloPercentage)}
//                     className="mb-0"
//                     height={20}
//                   >
//                     {buffaloPercentage}%
//                   </CProgress>
//                 </CCol>
//                 <CCol md={6}>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0">Cow Milk</h5>
//                     <span>Capacity: {cowTank.quantity?.toFixed(1) || 0} / {cowTank.capacity || 0} Ltr</span>
//                   </div>
//                   <CProgress
//                     value={cowPercentage}
//                     color={getColorByPercentage(cowPercentage)}
//                     className="mb-0"
//                     height={20}
//                   >
//                     {cowPercentage}%
//                   </CProgress>
//                 </CCol>
//               </CRow>
//             </CCardHeader>

//             <CCardBody className="p-3">
//               <CForm>
//                 <CRow className="mb-3">
//                   <CCol md={2}>
//                     <CFormLabel className="mb-0">Buffalo milk</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       value={buffaloQuantity}
//                       onChange={(e) => setBuffaloQuantity(e.target.value)}
//                       placeholder="Quantity"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">SNF</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={buffaloSNF}
//                       onChange={(e) => setBuffaloSNF(e.target.value)}
//                       placeholder="SNF Value"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">TS</CFormLabel>
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={buffaloTS}
//                       onChange={(e) => setBuffaloTS(e.target.value)}
//                       placeholder="TS Value"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow className="mb-3">
//                   <CCol md={2}>
//                     <CFormLabel className="mb-0">Cow Milk</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       value={cowQuantity}
//                       onChange={(e) => setCowQuantity(e.target.value)}
//                       placeholder="Quantity"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">SNF</CFormLabel>
//                   </CCol>
//                   <CCol md={3}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={cowSNF}
//                       onChange={(e) => setCowSNF(e.target.value)}
//                       placeholder="SNF Value"
//                     />
//                   </CCol>
//                   <CCol md={1} className="text-center">
//                     <CFormLabel className="mb-0">TS</CFormLabel>
//                   </CCol>
//                   <CCol md={2}>
//                     <CFormInput
//                       type="number"
//                       step="0.01"
//                       value={cowTS}
//                       onChange={(e) => setCowTS(e.target.value)}
//                       placeholder="TS Value"
//                     />
//                   </CCol>
//                 </CRow>

//                 <CRow>
//                   <CCol xs={6} md={2}>
//                     <CButton
//                       color="primary"
//                       className="px-4 w-100"
//                       onClick={handleSaveMilkParams}
//                       disabled={loading}
//                     >
//                       {loading ? <CSpinner size="sm" /> : 'SAVE'}
//                     </CButton>
//                   </CCol>
//                   <CCol xs={6} md={2}>
//                     <CButton
//                       color="danger"
//                       className="px-4 border w-100"
//                       onClick={handleCancelMilkParams}
//                       disabled={loading}
//                     >
//                       Cancel
//                     </CButton>
//                   </CCol>
//                 </CRow>
//               </CForm>
//             </CCardBody>
//           </>
//         )}
//       </CCard>
//     </CContainer>
//   );
// };

// export default LaboratoryUser;
