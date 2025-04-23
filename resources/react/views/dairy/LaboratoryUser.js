import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CProgressBar,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer,
  CSpinner,
  CAlert,
  CBadge
} from '@coreui/react';
import { getAPICall, put } from './../../util/api';

const LaboratoryUser = () => {
  // State for milk tanks data
  const [milkTanks, setMilkTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // State for milk data form
  const [selectedTankId, setSelectedTankId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [snf, setSnf] = useState('');
  const [ts, setTs] = useState('');

  // State to track which form is visible
  const [showForm, setShowForm] = useState(false);

  // Fetch current user and milk tanks data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // First get the current user information
        const userData = await getAPICall('/api/user');
        console.log("Current user data:", userData);
        setCurrentUser(userData);

        if (userData && userData.company_id) {
          // Then fetch milk tanks with explicit company filter
          await fetchMilkTanks(userData.company_id);
        } else {
          setError('User information or company ID is missing');
        }
      } catch (err) {
        setError('Error initializing data: ' + err.message);
        console.error('Error during initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Fetch milk tanks data for the user's company
  const fetchMilkTanks = async (companyId) => {
    try {
      // Get milk tanks, we'll add explicit filtering here
      const response = await getAPICall('/api/milk-tanks');
      console.log("Raw milk tanks response:", response);

      if (response.success) {
        // Filter tanks by company_id on the frontend as well
        // This is a safety measure in case the backend isn't filtering properly
        const filteredTanks = response.data.filter(tank => tank.company_id === companyId);
        console.log(`Filtered ${filteredTanks.length} tanks for company ${companyId}`);
        setMilkTanks(filteredTanks);

        // Log a warning if we had to filter on the frontend
        if (filteredTanks.length !== response.data.length) {
          console.warn(`Warning: Backend returned ${response.data.length} tanks, but only ${filteredTanks.length} belong to company ${companyId}`);
        }
      } else {
        setError('Failed to fetch milk tanks data');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
      console.error('Error fetching milk tanks:', err);
    }
  };

  // Toggle form visibility for a specific tank
  const toggleForm = (tankId) => {
    if (selectedTankId === tankId && showForm) {
      // If clicking on already selected tank, close the form
      setShowForm(false);
      setSelectedTankId(null);
    } else {
      // Show form for the selected tank
      setShowForm(true);
      setSelectedTankId(tankId);
      // Reset form values
      resetForm();
    }
  };

  // Reset form fields
  const resetForm = () => {
    setQuantity('');
    setSnf('');
    setTs('');
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  // Handle form save for milk parameters
  const handleSaveMilkParams = async () => {
    if (!selectedTankId) return;

    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Validate input
      if (!quantity || !snf || !ts) {
        setUpdateError('All fields are required');
        return;
      }

      // Prepare data for API
      const data = {
        added_quantity: parseFloat(quantity),
        new_snf: parseFloat(snf),
        new_ts: parseFloat(ts)
      };

      // Call laboratory update API endpoint
      const response = await put(`/api/milk-tanks/${selectedTankId}/laboratory-update`, data);

      if (response.success) {
        setUpdateSuccess(true);
        resetForm();

        // Refresh milk tanks data
        if (currentUser && currentUser.company_id) {
          fetchMilkTanks(currentUser.company_id);
        }
      } else {
        setUpdateError(response.message || 'Failed to update milk parameters');
      }
    } catch (err) {
      setUpdateError('Error: ' + err.message);
      console.error('Error updating milk parameters:', err);
    }
  };

  // Calculate percentage of tank capacity used
  const calculatePercentage = (current, capacity) => {
    if (!current || !capacity || capacity === 0) return 0;
    const percentage = Math.round((current / capacity) * 100);
    return percentage > 100 ? 100 : percentage; // Cap at 100%
  };

  // Handle form cancel
  const handleCancelMilkParams = () => {
    resetForm();
    setShowForm(false);
    setSelectedTankId(null);
  };

  // If loading, show spinner
  if (loading) {
    return (
      <CContainer className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <CSpinner color="primary" />
      </CContainer>
    );
  }

  return (
    <CContainer fluid className="p-0">
      {/* Main card with laboratory user header */}
      <CCard className="mb-2">
        <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0">Laboratory User</h5>
            {currentUser && (
              <div className="text-muted">
                <small>Company ID: {currentUser.company_id} • User: {currentUser.name}</small>
              </div>
            )}
          </div>
        </CCardHeader>

        {/* Error alert if any */}
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError(null)}>
            {error}
          </CAlert>
        )}

        {/* Success message */}
        {updateSuccess && (
          <CAlert color="success" dismissible onClose={() => setUpdateSuccess(false)}>
            Milk parameters updated successfully!
          </CAlert>
        )}

        {/* Update error message */}
        {updateError && (
          <CAlert color="danger" dismissible onClose={() => setUpdateError(null)}>
            {updateError}
          </CAlert>
        )}

        {/* Milk tanks display */}
        <CCardHeader style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.75rem' }}>
          <CRow>
            {milkTanks.length > 0 ? (
              milkTanks.map((tank) => {
                const percentage = calculatePercentage(tank.quantity, tank.capacity);

                return (
                  <CCol md={6} key={tank.id} className="mb-3">
                    <div
                      className={`tank-card p-3 ${selectedTankId === tank.id ? 'selected-tank' : ''}`}
                      style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedTankId === tank.id ? '#f0f0ff' : 'white'
                      }}
                      onClick={() => toggleForm(tank.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0 fw-bold">{tank.name}</h5>
                        <CBadge color="info" shape="rounded-pill" className="px-3">
                          {tank.quantity} / {tank.capacity} Ltr
                        </CBadge>
                      </div>

                      {/* Completely revised progress bar implementation */}
                      <div className="position-relative mb-3">
                        {/* Using standard HTML/CSS for maximum reliability */}
                        <div style={{
                          width: '100%',
                          height: '24px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: percentage < 30 ? '#dc3545' : percentage < 70 ? '#ffc107' : '#28a745',
                            transition: 'width 0.3s ease'
                          }}></div>
                          <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: percentage > 50 ? 'white' : 'black',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}>
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Improved metrics display */}
                      <div className="d-flex justify-content-between">
                        <div className="d-flex align-items-center">
                          <div className="metric-badge me-3" style={{
                            background: '#e9f5ff',
                            color: '#0d6efd',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            SNF: {tank.snf}%
                          </div>
                          <div className="metric-badge" style={{
                            background: '#fff4e6',
                            color: '#fd7e14',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            TS: {tank.ts}%
                          </div>
                        </div>
                        <div className="company-id" style={{
                          fontSize: '0.75rem',
                          color: '#6c757d',
                          alignSelf: 'flex-end'
                        }}>
                          ID: {tank.company_id}
                        </div>
                      </div>
                    </div>
                  </CCol>
                );
              })
            ) : (
              <CCol>
                <div className="text-center p-3">
                  {error ? 'Failed to load milk tanks' : 'No milk tanks available for your company'}
                </div>
              </CCol>
            )}
          </CRow>
        </CCardHeader>

        <CCardBody className="p-3">
          <CForm>
            {/* Milk parameters form - only shown when a tank is selected */}
            {showForm && selectedTankId && (
              <>
                <CRow className="mb-3">
                  <CCol md={2}>
                    <CFormLabel className="mb-0 fw-bold">
                      {milkTanks.find(tank => tank.id === selectedTankId)?.name || 'Milk Tank'}
                    </CFormLabel>
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Quantity to Add (Ltr)"
                    />
                  </CCol>
                  <CCol md={1} className="text-center">
                    <CFormLabel className="mb-0">SNF</CFormLabel>
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="number"
                      step="0.01"
                      value={snf}
                      onChange={(e) => setSnf(e.target.value)}
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
                      value={ts}
                      onChange={(e) => setTs(e.target.value)}
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
                      variant="outline"
                      className="px-4 w-100"
                      onClick={handleCancelMilkParams}
                    >
                      Cancel
                    </CButton>
                  </CCol>
                </CRow>
              </>
            )}
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default LaboratoryUser;

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
