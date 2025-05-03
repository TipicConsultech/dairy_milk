// import React, { useEffect, useState } from 'react';
// import { getAPICall } from '../../util/api';
// import { Calendar, RefreshCw, Filter, Search } from 'lucide-react';
// import CIcon from '@coreui/icons-react';
// import { cilChevronBottom, cilX } from '@coreui/icons';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CRow,
//   CCol,
//   CFormSelect,
//   CFormInput,
//   CButton,
//   CAlert,
//   CSpinner,
//   CBadge
// } from '@coreui/react';

// function DailyProductLog() {
//   const [retailData, setRetailData] = useState([]);
//   const [factoryData, setFactoryData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState('');
//   const [availableDates, setAvailableDates] = useState([]);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const response = await getAPICall('/api/daily-tallies');
//       setRetailData(response.retail || []);
//       setFactoryData(response.factory || []);
      
//       // Extract unique dates from both data sets
//       const allDates = [...(response.retail || []), ...(response.factory || [])]
//         .map(item => item.tally_date)
//         .filter((date, index, self) => self.indexOf(date) === index)
//         .sort((a, b) => new Date(b) - new Date(a)); // Sort dates in descending order
      
//       setAvailableDates(allDates);
      
//       // Set the most recent date as default if no date is selected
//       if (!selectedDate && allDates.length > 0) {
//         setSelectedDate(allDates[0]);
//       }
      
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching daily tallies:', error);
//       setError('Failed to load data. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Filter data based on selected date and search term
//   const filteredRetailData = retailData
//     .filter(item => !selectedDate || item.tally_date === selectedDate)
//     .filter(item => !searchTerm || 
//       item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

//   const filteredFactoryData = factoryData
//     .filter(item => !selectedDate || item.tally_date === selectedDate)
//     .filter(item => !searchTerm || 
//       item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

//   const handleDateChange = (e) => {
//     setSelectedDate(e.target.value);
//   };

//   const handleClearFilter = () => {
//     setSelectedDate('');
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const clearSearch = () => {
//     setSearchTerm('');
//   };

//   const renderTable = (data, title, color) => (
//     <CCard className="mb-4">
//       <CCardHeader style={{ backgroundColor: color }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h5 className="mb-0">{title}</h5>
//           <CBadge color={color === '#f8d7da' ? 'danger' : 'primary'} shape="rounded-pill">
//             {data.length} {data.length === 1 ? 'Entry' : 'Entries'}
//           </CBadge>
//         </div>
//       </CCardHeader>
//       <CCardBody>
//         <div className="table-container mb-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
//           {data.length > 0 ? (
//             <table className="table table-hover table-bordered align-middle mb-0">
//               <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
//                 <tr>
//                   <th>Product Name</th>
//                   <th>Size</th>
//                   <th>Tally Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((item, index) => (
//                   <tr key={index}>
//                     <td>{item.product_name}</td>
//                     <td>{item.quantity} {item.unit}</td>
//                     <td>{item.tally_date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <div className="text-center py-4 text-muted">
//               No data available for this selection
//             </div>
//           )}
//         </div>
//       </CCardBody>
//     </CCard>
//   );

//   // Custom dropdown and input styles
//   const inputContainerStyle = {
//     position: 'relative'
//   };

//   const dropdownIconStyle = {
//     position: 'absolute',
//     right: '10px',
//     top: '50%',
//     transform: 'translateY(-50%)',
//     pointerEvents: 'none',
//     zIndex: 1
//   };

//   const clearButtonStyle = {
//     position: 'absolute',
//     right: '10px',
//     top: '50%',
//     transform: 'translateY(-50%)',
//     cursor: 'pointer',
//     zIndex: 1
//   };

//   return (
//     <CCard className="mb-4">
//       <CCardHeader style={{ backgroundColor: '#d4edda' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h5 className="mb-0">Daily Product Log</h5>
//         </div>
//       </CCardHeader>

//       <CCardBody>
//         {/* Filters Card */}
//         <CCard className="mb-4">
//           <CCardHeader style={{ backgroundColor: '#E6E6FA' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h5 className="mb-0">Filters</h5>
//             </div>
//           </CCardHeader>
//           <CCardBody>
//             <CRow className="g-3 align-items-center">
//               {/* Date Filter */}
//               <CCol md={5}>
//                 <div style={inputContainerStyle}>
//                   <CFormSelect 
//                     value={selectedDate} 
//                     onChange={handleDateChange} 
//                     style={{ 
//                       appearance: 'none', 
//                       WebkitAppearance: 'none', 
//                       MozAppearance: 'none', 
//                       backgroundImage: 'none',
//                       paddingLeft: '35px'
//                     }}
//                   >
//                     <option value="">All Dates</option>
//                     {availableDates.map((date, idx) => (
//                       <option key={idx} value={date}>{date}</option>
//                     ))}
//                   </CFormSelect>
//                   <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
//                     <Calendar size={18} className="text-secondary" />
//                   </div>
//                   {selectedDate && (
//                     <div style={clearButtonStyle} onClick={handleClearFilter}>
//                       <CIcon icon={cilX} size="sm" />
//                     </div>
//                   )}
//                   {!selectedDate && (
//                     <div style={dropdownIconStyle}>
//                       <CIcon icon={cilChevronBottom} size="sm" />
//                     </div>
//                   )}
//                 </div>
//               </CCol>

//               {/* Search Input */}
//               <CCol md={5}>
//                 <div style={inputContainerStyle}>
//                   <CFormInput
//                     type="text"
//                     placeholder="Search products..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                     style={{ paddingLeft: '35px' }}
//                   />
//                   <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
//                     <Search size={18} className="text-secondary" />
//                   </div>
//                   {searchTerm && (
//                     <div style={clearButtonStyle} onClick={clearSearch}>
//                       <CIcon icon={cilX} size="sm" />
//                     </div>
//                   )}
//                 </div>
//               </CCol>

//               {/* Refresh Button */}
//               <CCol md={2}>
//                 <CButton 
//                   color="primary" 
//                   className="w-100"
//                   onClick={fetchData}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <CSpinner size="sm" />
//                   ) : (
//                     <>
//                       <RefreshCw size={18} className="me-2" />
//                       Refresh
//                     </>
//                   )}
//                 </CButton>
//               </CCol>
//             </CRow>
//           </CCardBody>
//         </CCard>

//         {/* Error Alert */}
//         {error && (
//           <CAlert color="danger" className="mb-4">
//             {error}
//           </CAlert>
//         )}

//         {/* Loading State */}
//         {loading ? (
//           <div className="d-flex justify-content-center my-5">
//             <CSpinner color="primary" />
//           </div>
//         ) : (
//           <>
//             {/* Tables */}
//             {renderTable(filteredRetailData, 'Retail Product Log', '#f8d7da')}
//             {renderTable(filteredFactoryData, 'Factory Product Log', '#E6E6FA')}

//             {/* Summary Card */}
//             <CCard>
//               <CCardHeader style={{ backgroundColor: '#d4edda' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <h5 className="mb-0">Summary</h5>
//                 </div>
//               </CCardHeader>
//               <CCardBody>
//                 <CRow>
//                   <CCol md={6}>
//                     <div className="border rounded p-3 h-100">
//                       <h6 className="mb-3 text-primary">Retail Summary</h6>
//                       <p className="mb-2">
//                         <strong>Total Entries:</strong> {filteredRetailData.length}
//                       </p>
//                       <p className="mb-2">
//                         <strong>Unique Products:</strong> {new Set(filteredRetailData.map(item => item.product_name)).size}
//                       </p>
//                       {selectedDate && (
//                         <p className="mb-0">
//                           <strong>Date:</strong> {selectedDate}
//                         </p>
//                       )}
//                     </div>
//                   </CCol>
//                   <CCol md={6}>
//                     <div className="border rounded p-3 h-100">
//                       <h6 className="mb-3 text-danger">Factory Summary</h6>
//                       <p className="mb-2">
//                         <strong>Total Entries:</strong> {filteredFactoryData.length}
//                       </p>
//                       <p className="mb-2">
//                         <strong>Unique Products:</strong> {new Set(filteredFactoryData.map(item => item.product_name)).size}
//                       </p>
//                       {selectedDate && (
//                         <p className="mb-0">
//                           <strong>Date:</strong> {selectedDate}
//                         </p>
//                       )}
//                     </div>
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>
//           </>
//         )}
//       </CCardBody>
//     </CCard>
//   );
// }

// export default DailyProductLog;
import React, { useEffect, useState } from 'react';
import { getAPICall } from '../../util/api';
import { Calendar } from 'lucide-react';
import CIcon from '@coreui/icons-react';
import { cilChevronBottom, cilX } from '@coreui/icons';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CButton,
  CAlert,
  CSpinner,
  CBadge
} from '@coreui/react';

function DailyProductLog() {
  const [retailData, setRetailData] = useState([]);
  const [factoryData, setFactoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState(null);
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAPICall('/api/daily-tallies');
      setRetailData(response.retail || []);
      setFactoryData(response.factory || []);
      
      // Extract unique dates from both data sets
      const allDates = [...(response.retail || []), ...(response.factory || [])]
        .map(item => item.tally_date)
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a)); // Sort dates in descending order
      
      setAvailableDates(allDates);
      
      // Set the most recent date as default if no date is selected
      if (!selectedDate && allDates.length > 0) {
        setSelectedDate(allDates[0]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching daily tallies:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on selected date only
  const filteredRetailData = retailData
    .filter(item => !selectedDate || item.tally_date === selectedDate);

  const filteredFactoryData = factoryData
    .filter(item => !selectedDate || item.tally_date === selectedDate);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleClearFilter = () => {
    setSelectedDate('');
  };

  const renderTable = (data, title, color) => (
    <CCard className="mb-4">
      <CCardHeader style={{ backgroundColor: color }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0">{title}</h5>
          <CBadge color={color === '#f8d7da' ? 'danger' : 'primary'} shape="rounded-pill">
            {data.length} {data.length === 1 ? 'Entry' : 'Entries'}
          </CBadge>
        </div>
      </CCardHeader>
      <CCardBody>
        <div className="table-container mb-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
          {data.length > 0 ? (
            <table className="table table-hover table-bordered align-middle mb-0">
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th>Product Name</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-muted">
              No data available for this selection
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  );

  // Custom dropdown and input styles
  const inputContainerStyle = {
    position: 'relative'
  };

  const dropdownIconStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1
  };

  const clearButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    zIndex: 1
  };

  // Format selected date for display
  const getFormattedSelectedDate = () => {
    if (!selectedDate) return '';
    try {
      const dateObj = new Date(selectedDate);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return selectedDate;
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader style={{ backgroundColor: '#d4edda' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0">Daily Product Log</h5>
          {selectedDate && (
            <div className="text-success">
              <strong>Date: {getFormattedSelectedDate()}</strong>
            </div>
          )}
        </div>
      </CCardHeader>

      <CCardBody>
        {/* Filters Card */}
        <CCard className="mb-4">
          <CCardHeader style={{ backgroundColor: '#E6E6FA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0">Filters</h5>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3 align-items-center">
              {/* Date Filter */}
              <CCol md={6} className="mx-auto">
                <div style={inputContainerStyle}>
                  <CFormSelect 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                    style={{ 
                      appearance: 'none', 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none', 
                      backgroundImage: 'none',
                      paddingLeft: '35px'
                    }}
                  >
                    <option value="">All Dates</option>
                    {availableDates.map((date, idx) => {
                      // Format date as DD-MM-YYYY
                      let formattedDate = date;
                      try {
                        const dateObj = new Date(date);
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear();
                        formattedDate = `${day}-${month}-${year}`;
                      } catch (e) {
                        // Use original date if formatting fails
                      }
                      return (
                        <option key={idx} value={date}>{formattedDate}</option>
                      );
                    })}
                  </CFormSelect>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <Calendar size={18} className="text-secondary" />
                  </div>
                  {selectedDate && (
                    <div style={clearButtonStyle} onClick={handleClearFilter}>
                      <CIcon icon={cilX} size="sm" />
                    </div>
                  )}
                  {!selectedDate && (
                    <div style={dropdownIconStyle}>
                      <CIcon icon={cilChevronBottom} size="sm" />
                    </div>
                  )}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Error Alert */}
        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <>
            {/* Tables */}
            {renderTable(filteredRetailData, 'Retail Product Log', '#f8d7da')}
            {renderTable(filteredFactoryData, 'Factory Product Log', '#E6E6FA')}

            {/* Summary Card */}
            <CCard>
              <CCardHeader style={{ backgroundColor: '#d4edda' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 className="mb-0">Summary</h5>
                </div>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className="mb-3 text-danger">Retail Summary</h6>
                      <p className="mb-2">
                        <strong>Total Entries:</strong> {filteredRetailData.length}
                      </p>
                      <p className="mb-2">
                        <strong>Unique Products:</strong> {new Set(filteredRetailData.map(item => item.product_name)).size}
                      </p>
                      
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className="mb-3 text-primary">Factory Summary</h6>
                      <p className="mb-2">
                        <strong>Total Entries:</strong> {filteredFactoryData.length}
                      </p>
                      <p className="mb-2">
                        <strong>Unique Products:</strong> {new Set(filteredFactoryData.map(item => item.product_name)).size}
                      </p>
                     
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </>
        )}
      </CCardBody>
    </CCard>
  );
}

export default DailyProductLog;