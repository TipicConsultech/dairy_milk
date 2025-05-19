import React, { useEffect, useState, useCallback } from 'react';
import { getAPICall } from '../../util/api';
import { Calendar as CalendarIcon } from 'lucide-react';
import CIcon from '@coreui/icons-react';
import { cilChevronBottom, cilX, cilSync, cilChevronLeft, cilChevronRight } from '@coreui/icons';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CAlert,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter
} from '@coreui/react';
import { useTranslation } from 'react-i18next';

function DailyProductLog() {
  // Add translation hook
  const { t, i18n } = useTranslation("global");

  const [productData, setProductData] = useState({
    cow: { retail: [], factory: [] },
    buffalo: { retail: [], factory: [] }
  });
  const [milkTankData, setMilkTankData] = useState({
    cow: { openingBalance: 0, morningEntry: 0, eveningEntry: 0, waste: 0 },
    buffalo: { openingBalance: 0, morningEntry: 0, eveningEntry: 0, waste: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tankIds, setTankIds] = useState({ cow: null, buffalo: null });

  // Format date for API call (YYYY-MM-DD)
  const formatDateForAPI = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchTankIds = useCallback(async () => {
    try {
      const response = await getAPICall('/api/milk-tanks/by-company');
      const tanks = response?.data || [];

      const cowTank = tanks.find(t => t.name.toLowerCase() === 'cow');
      const buffaloTank = tanks.find(t => t.name.toLowerCase() === 'buffalo');

      if (!cowTank || !buffaloTank) {
        console.warn('Milk tanks not properly defined for this company');
      }

      const newTankIds = {
        cow: cowTank?.id || null,
        buffalo: buffaloTank?.id || null,
      };

      setTankIds(newTankIds);
      return newTankIds; // Return the tank IDs for immediate use
    } catch (err) {
      console.error('Failed to fetch tank IDs', err);
      return null;
    }
  }, []);

  const fetchMilkTankData = useCallback(async (date, tankIdsToUse) => {
    try {
      // Use either passed tankIds or state tankIds
      const idsToUse = tankIdsToUse || tankIds;

      if (!idsToUse.cow || !idsToUse.buffalo) {
        console.warn('Tank IDs not available yet');
        return;
      }

      const formattedDate = formatDateForAPI(date);
      const response = await getAPICall(`/api/milk-tanks/trackers/grouped?date=${formattedDate}`);

      const cowTank = response?.data?.find(tank => tank.milk_tank_id === idsToUse.cow) || {};
      const buffaloTank = response?.data?.find(tank => tank.milk_tank_id === idsToUse.buffalo) || {};

      const tankData = {
        cow: {
          openingBalance: cowTank.opening_balance || 0,
          morningEntry: cowTank.morning_quantity || 0,
          eveningEntry: cowTank.evening_quantity || 0,
          waste: cowTank.waste_quantity || 0,
        },
        buffalo: {
          openingBalance: buffaloTank.opening_balance || 0,
          morningEntry: buffaloTank.morning_quantity || 0,
          eveningEntry: buffaloTank.evening_quantity || 0,
          waste: buffaloTank.waste_quantity || 0,
        }
      };

      setMilkTankData(tankData);
    } catch (error) {
      console.error('Error fetching milk tank data:', error);
      setError(t('MSG.failedToLoadMilkTankData'));
    }
  }, [tankIds, t]);

  const fetchProductData = useCallback(async () => {
    try {
      const response = await getAPICall('/api/daily-tallies');

      // Handle the new data structure
      if (response && (response.cow || response.buffalo)) {
        setProductData({
          cow: {
            retail: response.cow?.retail || [],
            factory: response.cow?.factory || []
          },
          buffalo: {
            retail: response.buffalo?.retail || [],
            factory: response.buffalo?.factory || []
          }
        });
      } else {
        // Fallback to original data structure if the new one isn't found
        const retailData = response.retail || [];
        const factoryData = response.factory || [];

        // Convert to new structure
        setProductData({
          cow: {
            retail: retailData.filter(item => item.source === 'cow' || item.source === undefined),
            factory: factoryData.filter(item => item.source === 'cow' || item.source === undefined)
          },
          buffalo: {
            retail: retailData.filter(item => item.source === 'buffalo'),
            factory: factoryData.filter(item => item.source === 'buffalo')
          }
        });
      }

      // Extract unique dates from all data sets
      const allDates = [
        ...(response.cow?.retail || []),
        ...(response.cow?.factory || []),
        ...(response.buffalo?.retail || []),
        ...(response.buffalo?.factory || []),
        ...(response.retail || []),
        ...(response.factory || [])
      ]
        .map(item => item.tally_date)
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a)); // Sort dates in descending order

      setAvailableDates(allDates.map(date => new Date(date)));
      setError(null);
    } catch (error) {
      console.error('Error fetching daily tallies:', error);
      setError(t('MSG.failedToLoadProductData'));
    }
  }, [t]);

  // Initial data loading
 useEffect(() => {
  async function initializeData() {
    setLoading(true);
    try {
      const fetchedTankIds = await fetchTankIds();
      await Promise.all([
        fetchProductData(),
        fetchMilkTankData(selectedDate, fetchedTankIds)
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError(t('MSG.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  }

  initializeData();
}, []); // 🚨 EMPTY dependency array




  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProductData(),
        fetchMilkTankData(selectedDate)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(t('MSG.failedToRefreshData'));
    } finally {
      setLoading(false);
    }
  };

  // Custom calendar functions
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const months = [
    t('LABELS.january'), t('LABELS.february'), t('LABELS.march'), t('LABELS.april'),
    t('LABELS.may'), t('LABELS.june'), t('LABELS.july'), t('LABELS.august'),
    t('LABELS.september'), t('LABELS.october'), t('LABELS.november'), t('LABELS.december')
  ];

  const daysOfWeek = [
    t('LABELS.sun'), t('LABELS.mon'), t('LABELS.tue'), t('LABELS.wed'),
    t('LABELS.thu'), t('LABELS.fri'), t('LABELS.sat')
  ];

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter data based on selected date
  const getFilteredData = (sourceType, productType) => {
    if (!selectedDate || !productData[sourceType] || !productData[sourceType][productType]) {
      return [];
    }

    return productData[sourceType][productType].filter(item => {
      const itemDate = new Date(item.tally_date);
      return itemDate.setHours(0, 0, 0, 0) === new Date(selectedDate).setHours(0, 0, 0, 0);
    });
  };

  // Get filtered data for each category
  const filteredCowRetail = getFilteredData('cow', 'retail');
  const filteredCowFactory = getFilteredData('cow', 'factory');
  const filteredBuffaloRetail = getFilteredData('buffalo', 'retail');
  const filteredBuffaloFactory = getFilteredData('buffalo', 'factory');

  const handleDateChange = async (date) => {
  setSelectedDate(date);
  setCalendarVisible(false);

  setLoading(true);
  try {
    await Promise.all([
      fetchProductData(),
      fetchMilkTankData(date) // Pass the selected date
    ]);
  } catch (error) {
    console.error('Error fetching data for selected date:', error);
    setError(t('MSG.failedToLoadData'));
  } finally {
    setLoading(false);
  }
};


  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
    // Reset current month to match selected date when opening calendar
    if (!calendarVisible) {
      setCurrentMonth(new Date(selectedDate));
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateAvailable = (date) => {
    return availableDates.some(availableDate =>
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    );
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  // Calculate totals for summary
  const calculateTotals = (tankData, factoryData) => {
    const total = tankData.openingBalance + tankData.morningEntry + tankData.eveningEntry;

    // Calculate product quantity from factory data
    let totalQuantity = 0;

    // Sum the numeric part of all factory product sizes
    factoryData.forEach(product => {
      if (product.quantity && product.unit) {
        const numericPart = parseFloat(product.quantity);
        if (!isNaN(numericPart)) {
          totalQuantity += numericPart;
        }
      }
    });

    const waste_quantity = tankData.waste || 0;
    const remaining = total - (totalQuantity + waste_quantity);

    return {
      total,
      productQuantity: totalQuantity.toFixed(2),
      remaining,
      waste_quantity
    };
  };

  const cowTotals = calculateTotals(milkTankData.cow, filteredCowFactory);
  const buffaloTotals = calculateTotals(milkTankData.buffalo, filteredBuffaloFactory);
  return (
    <CCard className="mb-2">
      <CCardHeader style={{ backgroundColor: '#d4edda' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0">{t('LABELS.dailyTallyReport')}</h5>
          <div className="d-flex align-items-center">
            <div style={{ position: 'relative', marginRight: '10px' }}>
              <CButton
                variant="outline"
                onClick={toggleCalendar}
                className="d-flex align-items-center"
                style={{ minWidth: '180px', justifyContent: 'space-between' }}
              >
                <div className="d-flex align-items-center">
                  <CalendarIcon size={18} className="me-2" />
                  {selectedDate ? formatDateForDisplay(selectedDate) : t('LABELS.selectDate')}
                </div>
                <CIcon icon={calendarVisible ? cilX : cilChevronBottom} size="sm" />
              </CButton>

              {calendarVisible && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    padding: '12px',
                    width: '300px'
                  }}
                >
                  {/* Calendar Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <CButton color="light" size="sm" onClick={prevMonth}>
                      <CIcon icon={cilChevronLeft} size="sm" />
                    </CButton>
                    <div style={{ fontWeight: 'bold' }}>
                      {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    <CButton color="light" size="sm" onClick={nextMonth}>
                      <CIcon icon={cilChevronRight} size="sm" />
                    </CButton>
                  </div>

                  {/* Days of Week */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
                    {daysOfWeek.map(day => (
                      <div key={day} style={{ padding: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {/* Empty cells for days before the first day of month */}
                    {[...Array(getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()))].map((_, index) => (
                      <div key={`empty-${index}`} style={{ padding: '8px' }}></div>
                    ))}

                    {/* Actual days of the month */}
                    {[...Array(getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()))].map((_, index) => {
                      const dayNumber = index + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                      const isToday = isSameDay(date, new Date());
                      const isSelected = isSameDay(date, selectedDate);
                      const hasData = isDateAvailable(date);
                      const isPastDate = date <= new Date();

                      return (
                        <div
                          key={`day-${dayNumber}`}
                          onClick={() => isPastDate && handleDateChange(date)}
                          style={{
                            padding: '8px',
                            textAlign: 'center',
                            cursor: isPastDate ? 'pointer' : 'default',
                            backgroundColor: isSelected ? '#0d6efd' : hasData ? '#d4edda' : 'transparent',
                            color: isSelected ? 'white' : isToday ? '#0d6efd' : 'inherit',
                            borderRadius: '4px',
                            opacity: isPastDate ? 1 : 0.5,
                            fontWeight: isToday ? 'bold' : 'normal'
                          }}
                        >
                          {dayNumber}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer with indicators */}
                  <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#d4edda', marginRight: '4px', borderRadius: '2px' }}></span>
                      <span>{t('LABELS.dataAvailable')}</span>
                    </div>
                    <div>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#0d6efd', marginRight: '4px', borderRadius: '2px' }}></span>
                      <span>{t('LABELS.selected')} / {t('LABELS.current')} </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* <CButton
              color="light"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              title={t('LABELS.refreshData')}
            >
              <CIcon icon={cilSync} size="sm" />
            </CButton> */}
          </div>
        </div>
      </CCardHeader>

      <CCardBody>
        {/* Error Alert */}
        {error && (
          <CAlert color="danger" className="mb-2">
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
            {/* Milk Capacity Section */}
            <div className="mb-2">
              <CRow>
                <CCol md={6}>
                  <CCard className="h-100 border-primary">
                    <CCardHeader style={{ backgroundColor: '#e2efff' }}>
                      <h6 className="mb-0 text-primary">{t('LABELS.cowTank')}</h6>
                    </CCardHeader>
                    <CCardBody>
                      <table className="table table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th style={{ width: '40%' }}>{t('LABELS.openingBalance')}</th>
                            <td>{milkTankData.cow.openingBalance} {t('LABELS.liters')}</td>
                          </tr>
                          <tr>
                            <th>{t('LABELS.morningEntry')}</th>
                            <td>{milkTankData.cow.morningEntry} {t('LABELS.liters')}</td>
                          </tr>
                          <tr>
                            <th>{t('LABELS.eveningEntry')}</th>
                            <td>{milkTankData.cow.eveningEntry} {t('LABELS.liters')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={6}>
                  <CCard className="h-100 border-info">
                    <CCardHeader style={{ backgroundColor: '#e0f7fa' }}>
                      <h6 className="mb-0 text-info">{t('LABELS.buffaloTank')}</h6>
                    </CCardHeader>
                    <CCardBody>
                      <table className="table table-bordered mb-0">
                        <tbody>
                          <tr>
                            <th style={{ width: '40%' }}>{t('LABELS.openingBalance')}</th>
                            <td>{milkTankData.buffalo.openingBalance} {t('LABELS.liters')}</td>
                          </tr>
                          <tr>
                            <th>{t('LABELS.morningEntry')}</th>
                            <td>{milkTankData.buffalo.morningEntry} {t('LABELS.liters')}</td>
                          </tr>
                          <tr>
                            <th>{t('LABELS.eveningEntry')}</th>
                            <td>{milkTankData.buffalo.eveningEntry} {t('LABELS.liters')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </div>

            {/* Product Log Section */}
            <div className="mb-2">
              <CRow>
                <CCol md={6}>

                  <div className="mb-2" style={{ height: '250px', overflow: 'auto' }}>
                    <CCard className="h-100 border">
                      <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
                        <h6 className="mb-0">{t('LABELS.cowfactoryProducts')}</h6>
                      </CCardHeader>
                      <CCardBody style={{ padding: 0 }}>
                        {filteredCowFactory.length > 0 ? (
                          <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th>{t('LABELS.productName')}</th>
                                <th>{t('LABELS.size')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCowFactory.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product_name}</td>
                                  <td>{item.quantity} {item.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            {t('MSG.noDataAvailable')}
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  </div>
                  <div style={{ height: '250px', overflow: 'auto' }}>
                    <CCard className="h-100 border">
                      <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
                        <h6 className="mb-0">{t('LABELS.cowretailProducts')}</h6>
                      </CCardHeader>
                      <CCardBody style={{ padding: 0 }}>
                        {filteredCowRetail.length > 0 ? (
                          <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th>{t('LABELS.productName')}</th>
                                <th>{t('LABELS.size')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredCowRetail.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product_name}</td>
                                  <td>{item.quantity} packets</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            {t('MSG.noDataAvailable')}
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  </div>
                </CCol>
                <CCol md={6}>

                  <div className="mb-2" style={{ height: '250px', overflow: 'auto' }}>
                    <CCard className="h-100 border">
                      <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
                        <h6 className="mb-0">{t('LABELS.buffalofactoryProducts')}</h6>
                      </CCardHeader>
                      <CCardBody style={{ padding: 0 }}>
                        {filteredBuffaloFactory.length > 0 ? (
                          <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th>{t('LABELS.productName')}</th>
                                <th>{t('LABELS.size')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBuffaloFactory.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product_name}</td>
                                  <td>{item.quantity} {item.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            {t('MSG.noDataAvailable')}
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  </div>
                  <div style={{ height: '250px', overflow: 'auto' }}>
                    <CCard className="h-100 border">
                      <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
                        <h6 className="mb-0">{t('LABELS.buffaloretailProducts')}</h6>
                      </CCardHeader>
                      <CCardBody style={{ padding: 0 }}>
                        {filteredBuffaloRetail.length > 0 ? (
                          <table className="table table-hover table-bordered align-middle mb-0">
                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th>{t('LABELS.productName')}</th>
                                <th>{t('LABELS.size')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBuffaloRetail.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product_name}</td>
                                  <td>{item.quantity} packets</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            {t('MSG.noDataAvailable')}
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  </div>
                </CCol>
              </CRow>
            </div>

            {/* Summary Card */}
           <div className="mt-2">
  <CRow>
    {/* Cow Summary Card */}
    <CCol md={6}>
      <CCard className="h-100 border-primary">
        <CCardHeader style={{ backgroundColor: '#e2efff' }}>
          <h6 className="mb-0 text-primary">{t('LABELS.cowSummary')}</h6>
        </CCardHeader>
        <CCardBody>
          <table className="table table-bordered mb-0">
            <tbody>
              <tr>
                <th>{t('LABELS.totalBalance')}</th>
                <td>{cowTotals.total} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.quantityUsed')}</th>
                <td>{cowTotals.productQuantity} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.wasteMilk')}</th>
                <td>{cowTotals.waste_quantity} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.remainingBalance')}</th>
                <td>{cowTotals.remaining} {t('LABELS.liters')}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    </CCol>

    {/* Buffalo Summary Card */}
    <CCol md={6}>
      <CCard className="h-100 border-info">
        <CCardHeader style={{ backgroundColor: '#e0f7fa' }}>
          <h6 className="mb-0 text-info">{t('LABELS.buffaloSummary')}</h6>
        </CCardHeader>
        <CCardBody>
          <table className="table table-bordered mb-0">
            <tbody>
              <tr>
                <th>{t('LABELS.totalBalance')}</th>
                <td>{buffaloTotals.total} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.quantityUsed')}</th>
                <td>{buffaloTotals.productQuantity} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.wasteMilk')}</th>
                <td>{buffaloTotals.waste_quantity} {t('LABELS.liters')}</td>
              </tr>
              <tr>
                <th>{t('LABELS.remainingBalance')}</th>
                <td>{buffaloTotals.remaining} {t('LABELS.liters')}</td>
              </tr>
            </tbody>
          </table>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</div>

          </>
        )}
      </CCardBody>
    </CCard>
  );
}

export default DailyProductLog;
