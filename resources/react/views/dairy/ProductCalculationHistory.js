// import React, { useState, useEffect } from 'react';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CRow,
//   CCol,
//   CButton,
//   CSpinner,
//   CAlert,
//   CPagination,
//   CPaginationItem,
//   CButtonGroup,
// } from '@coreui/react';
// import { useTranslation } from 'react-i18next';
// import { get } from '../../util/api';

// const ProductCalculationHistory = () => {
//   // Add translation hook
//   const { t, i18n } = useTranslation("global");

//   // State for date range and filters
//   const [dateRange, setDateRange] = useState({
//     startDate: '',
//     endDate: '',
//   });

//   const [filters, setFilters] = useState({
//     product_type: '',
//   });

//   // State for history data
//   const [historyData, setHistoryData] = useState([]);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     per_page: 10,
//     current_page: 1,
//     last_page: 1,
//   });

//   // UI state
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [viewMode, setViewMode] = useState('filtered'); // 'filtered' or 'all'

//   // Product options for filter
//   const productOptions = [
//     { label: t('LABELS.allProducts'), value: '' },
//     { label: t('LABELS.paneer'), value: 'Paneer' },
//     { label: t('LABELS.tup'), value: 'Tup' },
//   ];

//   // Update date range
//   const handleDateChange = (e) => {
//     setDateRange({
//       ...dateRange,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Update filters
//   const handleFilterChange = (e) => {
//     setFilters({
//       ...filters,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Fetch history data based on filters
//   const fetchHistory = async (page = 1) => {
//     setIsLoading(true);
//     setError('');

//     try {
//       let endpoint = '';
//       let params = { page };

//       // FIX: Properly determine which endpoint to use based on viewMode
//       if (viewMode === 'all') {
//         // When "Show All Calculations" is selected
//         endpoint = '/api/product-calculations/all';
//       } else {
//         // When "Filtered View" is selected
//         if (dateRange.startDate && dateRange.endDate) {
//           endpoint = '/api/calculations/date-range';
//           params = {
//             ...params,
//             startDate: dateRange.startDate,
//             endDate: dateRange.endDate,
//             product_type: filters.product_type,
//           };
//         } else {
//           endpoint = '/api/history';
//           params = {
//             ...params,
//             product_type: filters.product_type,
//           };
//         }
//       }

//       // Make API request with appropriate params
//       const response = await get(endpoint, params);

//       if (response.success) {
//         // Ensure we're setting an array
//         setHistoryData(Array.isArray(response.data) ? response.data : []);

//         // Handle pagination data
//         if (response.pagination) {
//           setPagination({
//             total: response.pagination.total || 0,
//             per_page: response.pagination.per_page || 10,
//             current_page: response.pagination.current_page || 1,
//             last_page: response.pagination.last_page || 1,
//           });
//         } else {
//           // If backend doesn't return pagination info, calculate it from the count
//           const count = response.count || 0;
//           const perPage = 10;
//           setPagination({
//             total: count,
//             per_page: perPage,
//             current_page: page,
//             last_page: Math.max(1, Math.ceil(count / perPage)),
//           });
//         }
//       } else {
//         setError(t('MSG.failedToLoadHistoryData'));
//         setHistoryData([]);
//       }
//     } catch (err) {
//       setError(err.message || t('MSG.failedToLoadHistoryData'));
//       console.error('History fetch error:', err);
//       setHistoryData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Apply filters and fetch data
//   const applyFilters = () => {
//     setViewMode('filtered');
//     fetchHistory(1); // Reset to first page when applying new filters
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setDateRange({
//       startDate: '',
//       endDate: '',
//     });
//     setFilters({
//       product_type: '',
//     });
//     setViewMode('filtered');
//     // Fetch data with reset filters
//     fetchHistory(1);
//   };

//   // Show all calculations
//   const showAllCalculations = () => {
//     setViewMode('all');
//     fetchHistory(1); // Reset to first page when switching to all calculations
//   };

//   // Handle pagination click
//   const handlePageChange = (page) => {
//     fetchHistory(page);
//   };

//   // Initial data load
//   useEffect(() => {
//     // FIX: Initially load with current viewMode
//     fetchHistory();
//   }, []); // Empty dependency array means this runs once on mount

//   // FIX: Add effect to refetch when viewMode changes
//   useEffect(() => {
//     fetchHistory(1);
//   }, [viewMode]);

//   return (
//     <CCard className="border-0 shadow-sm mt-4">
//       <CCardHeader className="bg-info text-white px-1 py-1 py-sm-1">
//         <h4 className="mb-0 d-flex align-items-center">
//           {t('LABELS.productCalculationHistory')}
//         </h4>
//       </CCardHeader>

//       <CCardBody className="bg-light py-3">
//         {/* Error Alert */}
//         {error && (
//           <CAlert color="danger" className="mb-3 d-flex align-items-center">
//             {error}
//           </CAlert>
//         )}

//         {/* Success Alert */}
//         {successMessage && (
//           <CAlert color="success" className="mb-3 d-flex align-items-center">
//             {successMessage}
//           </CAlert>
//         )}

//         {/* View Mode Selector */}
//         <CRow className="mb-4">
//           <CCol xs={12}>
//             <CButtonGroup className="mb-3">
//               <CButton
//                 color={viewMode === 'filtered' ? 'primary' : 'outline-primary'}
//                 onClick={() => setViewMode('filtered')}
//               >
//                 {t('LABELS.filteredView')}
//               </CButton>
//               <CButton
//                 color={viewMode === 'all' ? 'primary' : 'outline-primary'}
//                 onClick={() => setViewMode('all')}
//               >
//                 {t('LABELS.showAllCalculations')}
//               </CButton>
//             </CButtonGroup>
//           </CCol>
//         </CRow>

//         {/* Filters - Only show if in filtered view mode */}
//         {viewMode === 'filtered' && (
//           <CRow className="mb-4 g-3">
//             <CCol xs={12} md={6} lg={3}>
//               <CFormLabel htmlFor="startDate" className="fw-bold mb-1">{t('LABELS.startDate')}</CFormLabel>
//               <CFormInput
//                 type="date"
//                 id="startDate"
//                 name="startDate"
//                 value={dateRange.startDate}
//                 onChange={handleDateChange}
//                 aria-label={t('LABELS.startDate')}
//               />
//             </CCol>

//             <CCol xs={12} md={6} lg={3}>
//               <CFormLabel htmlFor="endDate" className="fw-bold mb-1">{t('LABELS.endDate')}</CFormLabel>
//               <CFormInput
//                 type="date"
//                 id="endDate"
//                 name="endDate"
//                 value={dateRange.endDate}
//                 onChange={handleDateChange}
//                 aria-label={t('LABELS.endDate')}
//               />
//             </CCol>

//             <CCol xs={12} md={6} lg={3}>
//               <CFormLabel htmlFor="productType" className="fw-bold mb-1">{t('LABELS.productType')}</CFormLabel>
//               <CFormSelect
//                 id="productType"
//                 name="product_type"
//                 value={filters.product_type}
//                 onChange={handleFilterChange}
//                 options={productOptions}
//                 aria-label={t('LABELS.productType')}
//               />
//             </CCol>

//             <CCol xs={12} md={6} lg={3} className="d-flex align-items-end">
//               <div className="d-flex gap-2 w-100">
//                 <CButton
//                   color="primary"
//                   className="flex-fill"
//                   onClick={applyFilters}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? <CSpinner size="sm" /> : t('LABELS.applyFilters')}
//                 </CButton>

//                 <CButton
//                   color="secondary"
//                   className="flex-fill"
//                   onClick={resetFilters}
//                   disabled={isLoading}
//                 >
//                   {t('LABELS.reset')}
//                 </CButton>
//               </div>
//             </CCol>
//           </CRow>
//         )}

//         {/* View Mode Indicator */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h5 className="mb-0">
//             {viewMode === 'all' ? t('LABELS.showingAllCalculations') : t('LABELS.showingFilteredCalculations')}
//             {pagination.total > 0 && ` (${pagination.total} ${t('LABELS.records')})`}
//           </h5>

//           {viewMode === 'all' && (
//             <CButton
//               color="outline-secondary"
//               size="sm"
//               onClick={() => setViewMode('filtered')}
//             >
//               {t('LABELS.backToFilteredView')}
//             </CButton>
//           )}
//         </div>

//         {/* History Table */}
//         <div className="table-responsive">
//           <CTable hover bordered>
//             <CTableHead className="bg-light">
//               <CTableRow>
//                 <CTableHeaderCell scope="col">{t('LABELS.srNo')}</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">{t('LABELS.date')}</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">{t('LABELS.time')}</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">{t('LABELS.productType')}</CTableHeaderCell>
//                 <CTableHeaderCell scope="col">{t('LABELS.details')}</CTableHeaderCell>
//               </CTableRow>
//             </CTableHead>

//             <CTableBody>
//               {isLoading ? (
//                 <CTableRow>
//                   <CTableDataCell colSpan={5} className="text-center py-4">
//                     <CSpinner color="primary" />
//                   </CTableDataCell>
//                 </CTableRow>
//               ) : historyData.length === 0 ? (
//                 <CTableRow>
//                   <CTableDataCell colSpan={5} className="text-center py-3">
//                     {t('MSG.noRecordsFound')}
//                   </CTableDataCell>
//                 </CTableRow>
//               ) : (
//                 historyData.map((item, index) => (
//                   <CTableRow key={item.id || index}>
//                     <CTableDataCell>
//                       {(pagination.current_page - 1) * pagination.per_page + index + 1}
//                     </CTableDataCell>
//                     <CTableDataCell>{item.formatted_date || item.date || t('LABELS.notAvailable')}</CTableDataCell>
//                     <CTableDataCell>{item.time || t('LABELS.notAvailable')}</CTableDataCell>
//                     <CTableDataCell>
//                       <span className={`badge ${item.product_type === 'Paneer' ? 'bg-success' : 'bg-info'}`}>
//                         {item.product_type || t('LABELS.unknown')}
//                       </span>
//                     </CTableDataCell>
//                     <CTableDataCell>
//                       {item.product_type === 'Paneer' ? (
//                         <div className="small">
//                           <div><strong>{t('LABELS.intake')}:</strong> {item.details?.intake_value || t('LABELS.notAvailable')} {t('LABELS.ltr')}</div>
//                           <div><strong>{t('LABELS.snf')}:</strong> {item.details?.snf_value || t('LABELS.notAvailable')}</div>
//                           <div><strong>{t('LABELS.ts')}:</strong> {item.details?.ts_value || t('LABELS.notAvailable')}</div>
//                           <div><strong>{t('LABELS.created')}:</strong> {item.details?.panner_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
//                           <div><strong>{t('LABELS.difference')}:</strong> {item.details?.difference_in_creation || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
//                         </div>
//                       ) : (
//                         <div className="small">
//                           <div><strong>{t('LABELS.milkIntake')}:</strong> {item.details?.milk_intake || t('LABELS.notAvailable')} {t('LABELS.ltr')}</div>
//                           <div><strong>{t('LABELS.creamCreated')}:</strong> {item.details?.cream_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
//                           <div><strong>{t('LABELS.tupCreated')}:</strong> {item.details?.tup_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
//                           <div><strong>{t('LABELS.tupUtaar')}:</strong> {item.details?.tup_utaar || t('LABELS.notAvailable')}%</div>
//                         </div>
//                       )}
//                     </CTableDataCell>
//                   </CTableRow>
//                 ))
//               )}
//             </CTableBody>
//           </CTable>
//         </div>

//         {/* Pagination */}
//         {historyData.length > 0 && pagination.last_page > 1 && (
//           <CPagination className="justify-content-center mt-3" aria-label={t('LABELS.pageNavigation')}>
//             <CPaginationItem
//               aria-label={t('LABELS.previous')}
//               disabled={pagination.current_page === 1}
//               onClick={() => handlePageChange(pagination.current_page - 1)}
//             >
//               <span aria-hidden="true">&laquo;</span>
//             </CPaginationItem>

//             {[...Array(pagination.last_page).keys()].map(page => (
//               <CPaginationItem
//                 key={page + 1}
//                 active={page + 1 === pagination.current_page}
//                 onClick={() => handlePageChange(page + 1)}
//               >
//                 {page + 1}
//               </CPaginationItem>
//             ))}

//             <CPaginationItem
//               aria-label={t('LABELS.next')}
//               disabled={pagination.current_page === pagination.last_page}
//               onClick={() => handlePageChange(pagination.current_page + 1)}
//             >
//               <span aria-hidden="true">&raquo;</span>
//             </CPaginationItem>
//           </CPagination>
//         )}
//       </CCardBody>
//     </CCard>
//   );
// };

// export default ProductCalculationHistory;

import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import { useTranslation } from 'react-i18next';
import { get } from '../../util/api';

const ProductCalculationHistory = () => {
  const { t } = useTranslation("global");

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filters, setFilters] = useState({ product_type: '' });
  const [historyData, setHistoryData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, per_page: 10, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const productOptions = [
    { label: t('LABELS.allProducts'), value: '' },
    { label: t('LABELS.paneer'), value: 'Paneer' },
    { label: t('LABELS.tup'), value: 'Tup' },
  ];

  const handleDateChange = (e) => setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  // const fetchHistory = async (page = 1) => {
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     let endpoint = '/api/calculations/date-range';
  //     let params = {
  //       page,
  //       startDate: dateRange.startDate,
  //       endDate: dateRange.endDate,
  //       product_type: filters.product_type
  //     };

  //     if (!dateRange.startDate || !dateRange.endDate) {
  //       endpoint = '/api/product-calculations/all';
  //       params = { page };
  //     }

  //     const response = await get(endpoint, params);

  //     if (response.success) {
  //       setHistoryData(Array.isArray(response.data) ? response.data : []);

  //       if (response.pagination) {
  //         setPagination({
  //           total: response.pagination.total || 0,
  //           per_page: response.pagination.per_page || 10,
  //           current_page: response.pagination.current_page || 1,
  //           last_page: response.pagination.last_page || 1,
  //         });
  //       }
  //     } else {
  //       setError(t('MSG.failedToLoadHistoryData'));
  //       setHistoryData([]);
  //     }
  //   } catch (err) {
  //     setError(err.message || t('MSG.failedToLoadHistoryData'));
  //     setHistoryData([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const fetchHistory = async (page = 1, dateRangeParam = dateRange, filtersParam = filters) => {
  setIsLoading(true);
  setError('');

  try {
    let endpoint = '/api/product-calculations/all'; // default endpoint
    let params = { page };

    if (dateRangeParam.startDate && dateRangeParam.endDate) {
      endpoint = '/api/calculations/date-range';
      params = {
        page,
        startDate: dateRangeParam.startDate,
        endDate: dateRangeParam.endDate,
        product_type: filtersParam.product_type || '',
      };
    } else if (filtersParam.product_type) {
      endpoint = '/api/calculations/date-range';
      params = {
        page,
        product_type: filtersParam.product_type,
      };
    }

    const response = await get(endpoint, params);

    if (response.success) {
      setHistoryData(Array.isArray(response.data) ? response.data : []);
      if (response.pagination) {
        setPagination({
          total: response.pagination.total || 0,
          per_page: response.pagination.per_page || 10,
          current_page: response.pagination.current_page || 1,
          last_page: response.pagination.last_page || 1,
        });
      }
    } else {
      setError(t('MSG.failedToLoadHistoryData'));
      setHistoryData([]);
    }
  } catch (err) {
    setError(err.message || t('MSG.failedToLoadHistoryData'));
    setHistoryData([]);
  } finally {
    setIsLoading(false);
  }
};


  const applyFilters = () => fetchHistory(1);
  // const resetFilters = () => {
  //   setDateRange({ startDate: '', endDate: '' });
  //   setFilters({ product_type: '' });
  //   fetchHistory(1);
  // };
  const resetFilters = () => {
  const clearedDateRange = { startDate: '', endDate: '' };
  const clearedFilters = { product_type: '' };
  setDateRange(clearedDateRange);
  setFilters(clearedFilters);

  // Pass cleared filters and dateRange explicitly to fetchHistory
  fetchHistory(1, clearedDateRange, clearedFilters);
};



  const handlePageChange = (page) => fetchHistory(page);

  useEffect(() => { fetchHistory(); }, []);

  return (
    <CCard className="border-0 shadow-sm mt-4">
      <CCardHeader className="bg-info text-white px-1 py-1 py-sm-1">
        <h4 className="mb-0 d-flex align-items-center">
          {t('LABELS.productCalculationHistory')}
        </h4>
      </CCardHeader>

      <CCardBody className="bg-light py-3">
        {error && <CAlert color="danger" className="mb-3 d-flex align-items-center">{error}</CAlert>}

        <CRow className="mb-4 g-3">
          <CCol xs={12} md={6} lg={3}>
            <CFormLabel htmlFor="startDate" className="fw-bold mb-1">{t('LABELS.startDate')}</CFormLabel>
            <CFormInput
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              aria-label={t('LABELS.startDate')}
            />
          </CCol>

          <CCol xs={12} md={6} lg={3}>
            <CFormLabel htmlFor="endDate" className="fw-bold mb-1">{t('LABELS.endDate')}</CFormLabel>
            <CFormInput
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              aria-label={t('LABELS.endDate')}
            />
          </CCol>

          <CCol xs={12} md={6} lg={3}>
            <CFormLabel htmlFor="productType" className="fw-bold mb-1">{t('LABELS.productType')}</CFormLabel>
            <CFormSelect
              id="productType"
              name="product_type"
              value={filters.product_type}
              onChange={handleFilterChange}
              options={productOptions}
              aria-label={t('LABELS.productType')}
            />
          </CCol>

          <CCol xs={12} md={6} lg={3} className="d-flex align-items-end">
            <div className="d-flex gap-2 w-100">
              <CButton color="primary" className="flex-fill" onClick={applyFilters} disabled={isLoading}>
                {isLoading ? <CSpinner size="sm" /> : t('LABELS.submit')}
              </CButton>
              <CButton color="secondary" className="flex-fill" onClick={resetFilters} disabled={isLoading}>
                {t('LABELS.reset')}
              </CButton>
            </div>
          </CCol>
        </CRow>

        <div className="table-responsive">
          <CTable hover bordered>
            <CTableHead className="bg-light">
              <CTableRow>
                <CTableHeaderCell scope="col">{t('LABELS.srNo')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('LABELS.date')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('LABELS.time')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('LABELS.productType')}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{t('LABELS.details')}</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {isLoading ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center py-4">
                    <CSpinner color="primary" />
                  </CTableDataCell>
                </CTableRow>
              ) : historyData.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center py-3">
                    {t('MSG.noRecordsFound')}
                  </CTableDataCell>
                </CTableRow>
              ) : (
                historyData.map((item, index) => (
                  <CTableRow key={item.id || index}>
                    <CTableDataCell>{(pagination.current_page - 1) * pagination.per_page + index + 1}</CTableDataCell>
                    <CTableDataCell>{item.formatted_date || item.date || t('LABELS.notAvailable')}</CTableDataCell>
                    <CTableDataCell>{item.time || t('LABELS.notAvailable')}</CTableDataCell>
                    <CTableDataCell>
                      <span className={`badge ${item.product_type === 'Paneer' ? 'bg-success' : 'bg-info'}`}>{item.product_type || t('LABELS.unknown')}</span>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.product_type === 'Paneer' ? (
                        <div className="small">
                          <div><strong>{t('LABELS.intake')}:</strong> {item.details?.intake_value || t('LABELS.notAvailable')} {t('LABELS.ltr')}</div>
                          <div><strong>{t('LABELS.snf')}:</strong> {item.details?.snf_value || t('LABELS.notAvailable')}</div>
                          <div><strong>{t('LABELS.ts')}:</strong> {item.details?.ts_value || t('LABELS.notAvailable')}</div>
                          <div><strong>{t('LABELS.created')}:</strong> {item.details?.panner_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
                          <div><strong>{t('LABELS.difference')}:</strong> {item.details?.difference_in_creation || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
                        </div>
                      ) : (
                        <div className="small">
                          <div><strong>{t('LABELS.milkIntake')}:</strong> {item.details?.milk_intake || t('LABELS.notAvailable')} {t('LABELS.ltr')}</div>
                          <div><strong>{t('LABELS.creamCreated')}:</strong> {item.details?.cream_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
                          <div><strong>{t('LABELS.tupCreated')}:</strong> {item.details?.tup_created || t('LABELS.notAvailable')} {t('LABELS.kg')}</div>
                          <div><strong>{t('LABELS.tupUtaar')}:</strong> {item.details?.tup_utaar || t('LABELS.notAvailable')}%</div>
                        </div>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </div>

        {historyData.length > 0 && pagination.last_page > 1 && (
          <CPagination className="justify-content-center mt-3" aria-label={t('LABELS.pageNavigation')}>
            <CPaginationItem aria-label={t('LABELS.previous')} disabled={pagination.current_page === 1} onClick={() => handlePageChange(pagination.current_page - 1)}>
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>
            {[...Array(pagination.last_page).keys()].map(page => (
              <CPaginationItem key={page + 1} active={page + 1 === pagination.current_page} onClick={() => handlePageChange(page + 1)}>
                {page + 1}
              </CPaginationItem>
            ))}
            <CPaginationItem aria-label={t('LABELS.next')} disabled={pagination.current_page === pagination.last_page} onClick={() => handlePageChange(pagination.current_page + 1)}>
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ProductCalculationHistory;
