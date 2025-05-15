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
  CButtonGroup,
} from '@coreui/react';
import { get } from '../../util/api';

const ProductCalculationHistory = () => {
  // State for date range and filters
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [filters, setFilters] = useState({
    product_type: '',
  });

  // State for history data
  const [historyData, setHistoryData] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('filtered'); // 'filtered' or 'all'

  // Product options for filter
  const productOptions = [
    { label: 'All Products', value: '' },
    { label: 'Paneer', value: 'Paneer' },
    { label: 'Tup', value: 'Tup' },
  ];

  // Update date range
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  // Update filters
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // Fetch history data based on filters
  const fetchHistory = async (page = 1) => {
    setIsLoading(true);
    setError('');

    try {
      let endpoint = '';
      let params = { page };

      // FIX: Properly determine which endpoint to use based on viewMode
      if (viewMode === 'all') {
        // When "Show All Calculations" is selected
        endpoint = '/api/product-calculations/all';
      } else {
        // When "Filtered View" is selected
        if (dateRange.startDate && dateRange.endDate) {
          endpoint = '/api/calculations/date-range';
          params = {
            ...params,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            product_type: filters.product_type,
          };
        } else {
          endpoint = '/api/history';
          params = {
            ...params,
            product_type: filters.product_type,
          };
        }
      }

      // Make API request with appropriate params
      const response = await get(endpoint, params);

      if (response.success) {
        // Ensure we're setting an array
        setHistoryData(Array.isArray(response.data) ? response.data : []);

        // Handle pagination data
        if (response.pagination) {
          setPagination({
            total: response.pagination.total || 0,
            per_page: response.pagination.per_page || 10,
            current_page: response.pagination.current_page || 1,
            last_page: response.pagination.last_page || 1,
          });
        } else {
          // If backend doesn't return pagination info, calculate it from the count
          const count = response.count || 0;
          const perPage = 10;
          setPagination({
            total: count,
            per_page: perPage,
            current_page: page,
            last_page: Math.max(1, Math.ceil(count / perPage)),
          });
        }
      } else {
        setError('Failed to load history data');
        setHistoryData([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load history data');
      console.error('History fetch error:', err);
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and fetch data
  const applyFilters = () => {
    setViewMode('filtered');
    fetchHistory(1); // Reset to first page when applying new filters
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({
      startDate: '',
      endDate: '',
    });
    setFilters({
      product_type: '',
    });
    setViewMode('filtered');
    // Fetch data with reset filters
    fetchHistory(1);
  };

  // Show all calculations
  const showAllCalculations = () => {
    setViewMode('all');
    fetchHistory(1); // Reset to first page when switching to all calculations
  };

  // Handle pagination click
  const handlePageChange = (page) => {
    fetchHistory(page);
  };

  // Initial data load
  useEffect(() => {
    // FIX: Initially load with current viewMode
    fetchHistory();
  }, []); // Empty dependency array means this runs once on mount

  // FIX: Add effect to refetch when viewMode changes
  useEffect(() => {
    fetchHistory(1);
  }, [viewMode]);

  return (
    <CCard className="border-0 shadow-sm mt-4">
      <CCardHeader className="bg-info text-white py-2 py-sm-3">
        <h4 className="mb-0 d-flex align-items-center">
          Product Calculation History
        </h4>
      </CCardHeader>

      <CCardBody className="bg-light py-3">
        {/* Error Alert */}
        {error && (
          <CAlert color="danger" className="mb-3 d-flex align-items-center">
            {error}
          </CAlert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <CAlert color="success" className="mb-3 d-flex align-items-center">
            {successMessage}
          </CAlert>
        )}

        {/* View Mode Selector */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CButtonGroup className="mb-3">
              <CButton
                color={viewMode === 'filtered' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('filtered')}
              >
                Filtered View
              </CButton>
              <CButton
                color={viewMode === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('all')}
              >
                Show All Calculations
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>

        {/* Filters - Only show if in filtered view mode */}
        {viewMode === 'filtered' && (
          <CRow className="mb-4 g-3">
            <CCol xs={12} md={6} lg={3}>
              <CFormLabel htmlFor="startDate" className="fw-bold mb-1">Start Date</CFormLabel>
              <CFormInput
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                aria-label="Start Date"
              />
            </CCol>

            <CCol xs={12} md={6} lg={3}>
              <CFormLabel htmlFor="endDate" className="fw-bold mb-1">End Date</CFormLabel>
              <CFormInput
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                aria-label="End Date"
              />
            </CCol>

            <CCol xs={12} md={6} lg={3}>
              <CFormLabel htmlFor="productType" className="fw-bold mb-1">Product Type</CFormLabel>
              <CFormSelect
                id="productType"
                name="product_type"
                value={filters.product_type}
                onChange={handleFilterChange}
                options={productOptions}
                aria-label="Product Type"
              />
            </CCol>

            <CCol xs={12} md={6} lg={3} className="d-flex align-items-end">
              <div className="d-flex gap-2 w-100">
                <CButton
                  color="primary"
                  className="flex-fill"
                  onClick={applyFilters}
                  disabled={isLoading}
                >
                  {isLoading ? <CSpinner size="sm" /> : 'Apply Filters'}
                </CButton>

                <CButton
                  color="secondary"
                  className="flex-fill"
                  onClick={resetFilters}
                  disabled={isLoading}
                >
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>
        )}

        {/* View Mode Indicator */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {viewMode === 'all' ? 'Showing All Calculations' : 'Showing Filtered Calculations'}
            {pagination.total > 0 && ` (${pagination.total} records)`}
          </h5>

          {viewMode === 'all' && (
            <CButton
              color="outline-secondary"
              size="sm"
              onClick={() => setViewMode('filtered')}
            >
              Back to Filtered View
            </CButton>
          )}
        </div>

        {/* History Table */}
        <div className="table-responsive">
          <CTable hover bordered>
            <CTableHead className="bg-light">
              <CTableRow>
                <CTableHeaderCell scope="col">Sr.No.</CTableHeaderCell>
                <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                <CTableHeaderCell scope="col">Time</CTableHeaderCell>
                <CTableHeaderCell scope="col">Product Type</CTableHeaderCell>
                <CTableHeaderCell scope="col">Details</CTableHeaderCell>
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
                    No records found
                  </CTableDataCell>
                </CTableRow>
              ) : (
                historyData.map((item, index) => (
                  <CTableRow key={item.id || index}>
                    <CTableDataCell>
                      {(pagination.current_page - 1) * pagination.per_page + index + 1}
                    </CTableDataCell>
                    <CTableDataCell>{item.formatted_date || item.date || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{item.time || 'N/A'}</CTableDataCell>
                    <CTableDataCell>
                      <span className={`badge ${item.product_type === 'Paneer' ? 'bg-success' : 'bg-info'}`}>
                        {item.product_type || 'Unknown'}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.product_type === 'Paneer' ? (
                        <div className="small">
                          <div><strong>Intake:</strong> {item.details?.intake_value || 'N/A'} L</div>
                          <div><strong>SNF:</strong> {item.details?.snf_value || 'N/A'}</div>
                          <div><strong>TS:</strong> {item.details?.ts_value || 'N/A'}</div>
                          <div><strong>Created:</strong> {item.details?.panner_created || 'N/A'} kg</div>
                          <div><strong>Difference:</strong> {item.details?.difference_in_creation || 'N/A'} kg</div>
                        </div>
                      ) : (
                        <div className="small">
                          <div><strong>Milk Intake:</strong> {item.details?.milk_intake || 'N/A'} L</div>
                          <div><strong>Cream Created:</strong> {item.details?.cream_created || 'N/A'}</div>
                          <div><strong>Tup Created:</strong> {item.details?.tup_created || 'N/A'} kg</div>
                          <div><strong>Tup Utaar:</strong> {item.details?.tup_utaar || 'N/A'}%</div>
                        </div>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </div>

        {/* Pagination */}
        {historyData.length > 0 && pagination.last_page > 1 && (
          <CPagination className="justify-content-center mt-3" aria-label="Page navigation">
            <CPaginationItem
              aria-label="Previous"
              disabled={pagination.current_page === 1}
              onClick={() => handlePageChange(pagination.current_page - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>

            {[...Array(pagination.last_page).keys()].map(page => (
              <CPaginationItem
                key={page + 1}
                active={page + 1 === pagination.current_page}
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </CPaginationItem>
            ))}

            <CPaginationItem
              aria-label="Next"
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => handlePageChange(pagination.current_page + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ProductCalculationHistory;
