import React, { useEffect, useState } from 'react';
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

  const fetchProductData = async () => {
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
  };

  const fetchMilkTankData = async (date) => {
    try {
      const formattedDate = formatDateForAPI(date);
      const response = await getAPICall(`/api/milk-tanks/trackers/grouped?date=${formattedDate}`);

      const cowTank = response?.data?.find(tank => tank.milk_tank_id === 1) || {};
      const buffaloTank = response?.data?.find(tank => tank.milk_tank_id === 2) || {};

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
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProductData(),
        fetchMilkTankData(selectedDate)
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchMilkTankData(selectedDate);
    }
  }, [selectedDate]);

  // Format date for API call (YYYY-MM-DD)
  const formatDateForAPI = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
    // Reset current month to match selected date when opening calendar
    if (!calendarVisible) {
      setCurrentMonth(new Date(selectedDate));
    }
  };

  const handleRefresh = () => {
    fetchAllData();
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
    <CCard className="mb-4">
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
                      <span>{t('LABELS.selected')}</span>
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
            {/* Milk Capacity Section */}
            <CCard className="mb-4">
              <CCardHeader style={{ backgroundColor: '#cce5ff' }}>
                <h5 className="mb-0">{t('LABELS.milkCapacity')}</h5>
              </CCardHeader>
              <CCardBody>
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
              </CCardBody>
            </CCard>

            {/* Product Log Section */}
            <CCard className="mb-4">
              <CCardHeader style={{ backgroundColor: '#fff3cd' }}>
                <h5 className="mb-0">{t('LABELS.dailyProduction')}</h5>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <h6 className="mb-3 text-primary">{t('LABELS.cowProducts')}</h6>
                    <div className="mb-3" style={{ height: '250px', overflow: 'auto' }}>
                      <CCard className="h-100 border">
                        <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
                          <h6 className="mb-0">{t('LABELS.factoryProducts')}</h6>
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
                    <div style={{ height: '250px', overflow: 'auto' }}>
                      <CCard className="h-100 border">
                        <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
                          <h6 className="mb-0">{t('LABELS.retailProducts')}</h6>
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
                    <h6 className="mb-3 text-info">{t('LABELS.buffaloProducts')}</h6>
                    <div className="mb-3" style={{ height: '250px', overflow: 'auto' }}>
                      <CCard className="h-100 border">
                        <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
                          <h6 className="mb-0">{t('LABELS.factoryProducts')}</h6>
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
                    <div style={{ height: '250px', overflow: 'auto' }}>
                      <CCard className="h-100 border">
                        <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
                          <h6 className="mb-0">{t('LABELS.retailProducts')}</h6>
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
              </CCardBody>
            </CCard>

            {/* Summary Card */}
            <CCard>
              <CCardHeader style={{ backgroundColor: '#d4edda' }}>
                <h5 className="mb-0">{t('LABELS.summary')}</h5>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className="mb-3 text-primary">{t('LABELS.cowSummary')}</h6>
                      <table className="table table-bordered">
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
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className="mb-3 text-info">{t('LABELS.buffaloSummary')}</h6>
                      <table className="table table-bordered">
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

//------------------------------------------------------------------

// import React, { useEffect, useState } from 'react';
// import { getAPICall } from '../../util/api';
// import { Calendar as CalendarIcon } from 'lucide-react';
// import CIcon from '@coreui/icons-react';
// import { cilChevronBottom, cilX, cilSync, cilChevronLeft, cilChevronRight } from '@coreui/icons';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody,
//   CRow,
//   CCol,
//   CButton,
//   CAlert,
//   CSpinner,
//   CBadge,
//   CModal,
//   CModalHeader,
//   CModalBody,
//   CModalTitle,
//   CModalFooter
// } from '@coreui/react';

// function DailyProductLog() {
//   const [productData, setProductData] = useState({
//     cow: { retail: [], factory: [] },
//     buffalo: { retail: [], factory: [] }
//   });
//   const [milkTankData, setMilkTankData] = useState({
//     cow: { openingBalance: 0, morningEntry: 0, eveningEntry: 0, waste: 0 },
//     buffalo: { openingBalance: 0, morningEntry: 0, eveningEntry: 0, waste: 0 }
//   });
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
//   const [availableDates, setAvailableDates] = useState([]);
//   const [error, setError] = useState(null);
//   const [calendarVisible, setCalendarVisible] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   // Custom calendar functions
//   const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
//   const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   const fetchProductData = async () => {
//     try {
//       const response = await getAPICall('/api/daily-tallies');

//       // Handle the new data structure
//       if (response && (response.cow || response.buffalo)) {
//         setProductData({
//           cow: {
//             retail: response.cow?.retail || [],
//             factory: response.cow?.factory || []
//           },
//           buffalo: {
//             retail: response.buffalo?.retail || [],
//             factory: response.buffalo?.factory || []
//           }
//         });
//       } else {
//         // Fallback to original data structure if the new one isn't found
//         const retailData = response.retail || [];
//         const factoryData = response.factory || [];

//         // Convert to new structure
//         setProductData({
//           cow: {
//             retail: retailData.filter(item => item.source === 'cow' || item.source === undefined),
//             factory: factoryData.filter(item => item.source === 'cow' || item.source === undefined)
//           },
//           buffalo: {
//             retail: retailData.filter(item => item.source === 'buffalo'),
//             factory: factoryData.filter(item => item.source === 'buffalo')
//           }
//         });
//       }

//       // Extract unique dates from all data sets
//       const allDates = [
//         ...(response.cow?.retail || []),
//         ...(response.cow?.factory || []),
//         ...(response.buffalo?.retail || []),
//         ...(response.buffalo?.factory || []),
//         ...(response.retail || []),
//         ...(response.factory || [])
//       ]
//         .map(item => item.tally_date)
//         .filter((date, index, self) => self.indexOf(date) === index)
//         .sort((a, b) => new Date(b) - new Date(a)); // Sort dates in descending order

//       setAvailableDates(allDates.map(date => new Date(date)));
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching daily tallies:', error);
//       setError('Failed to load product data. Please try again later.');
//     }
//   };

//   const fetchMilkTankData = async (date) => {
//     try {
//       const formattedDate = formatDateForAPI(date);
//       const response = await getAPICall(`/api/milk-tanks/trackers/grouped?date=${formattedDate}`);

//       const cowTank = response?.data?.find(tank => tank.milk_tank_id === 1) || {};
//       const buffaloTank = response?.data?.find(tank => tank.milk_tank_id === 2) || {};

//       const tankData = {
//         cow: {
//           openingBalance: cowTank.opening_balance || 0,
//           morningEntry: cowTank.morning_quantity || 0,
//           eveningEntry: cowTank.evening_quantity || 0,
//           waste: cowTank.waste_quantity || 0,
//         },
//         buffalo: {
//           openingBalance: buffaloTank.opening_balance || 0,
//           morningEntry: buffaloTank.morning_quantity || 0,
//           eveningEntry: buffaloTank.evening_quantity || 0,
//           waste: buffaloTank.waste_quantity || 0,
//         }
//       };

//       setMilkTankData(tankData);
//     } catch (error) {
//       console.error('Error fetching milk tank data:', error);
//       setError('Failed to load milk tank data. Please try again later.');
//     }
//   };

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         fetchProductData(),
//         fetchMilkTankData(selectedDate)
//       ]);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchMilkTankData(selectedDate);
//     }
//   }, [selectedDate]);

//   // Format date for API call (YYYY-MM-DD)
//   const formatDateForAPI = (dateObj) => {
//     const year = dateObj.getFullYear();
//     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//     const day = String(dateObj.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Format date for display (DD-MM-YYYY)
//   const formatDateForDisplay = (dateObj) => {
//     const day = String(dateObj.getDate()).padStart(2, '0');
//     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//     const year = dateObj.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Filter data based on selected date
//   const getFilteredData = (sourceType, productType) => {
//     if (!selectedDate || !productData[sourceType] || !productData[sourceType][productType]) {
//       return [];
//     }

//     return productData[sourceType][productType].filter(item => {
//       const itemDate = new Date(item.tally_date);
//       return itemDate.setHours(0, 0, 0, 0) === new Date(selectedDate).setHours(0, 0, 0, 0);
//     });
//   };

//   // Get filtered data for each category
//   const filteredCowRetail = getFilteredData('cow', 'retail');
//   const filteredCowFactory = getFilteredData('cow', 'factory');
//   const filteredBuffaloRetail = getFilteredData('buffalo', 'retail');
//   const filteredBuffaloFactory = getFilteredData('buffalo', 'factory');

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     setCalendarVisible(false);
//   };

//   const toggleCalendar = () => {
//     setCalendarVisible(!calendarVisible);
//     // Reset current month to match selected date when opening calendar
//     if (!calendarVisible) {
//       setCurrentMonth(new Date(selectedDate));
//     }
//   };

//   const handleRefresh = () => {
//     fetchAllData();
//   };

//   const prevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const nextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   const isDateAvailable = (date) => {
//     return availableDates.some(availableDate =>
//       availableDate.getDate() === date.getDate() &&
//       availableDate.getMonth() === date.getMonth() &&
//       availableDate.getFullYear() === date.getFullYear()
//     );
//   };

//   const isSameDay = (date1, date2) => {
//     return date1.getDate() === date2.getDate() &&
//            date1.getMonth() === date2.getMonth() &&
//            date1.getFullYear() === date2.getFullYear();
//   };

//   // Calculate totals for summary
//   const calculateTotals = (tankData, factoryData) => {
//     const total = tankData.openingBalance + tankData.morningEntry + tankData.eveningEntry;

//     // Calculate product quantity from factory data
//     let totalQuantity = 0;

//     // Sum the numeric part of all factory product sizes
//     factoryData.forEach(product => {
//       if (product.quantity && product.unit) {
//         const numericPart = parseFloat(product.quantity);
//         if (!isNaN(numericPart)) {
//           totalQuantity += numericPart;
//         }
//       }
//     });

//     const waste_quantity = tankData.waste || 0;
//     const remaining = total - (totalQuantity + waste_quantity);

//     return {
//       total,
//       productQuantity: totalQuantity.toFixed(2),
//       remaining,
//       waste_quantity
//     };
//   };

//   const cowTotals = calculateTotals(milkTankData.cow, filteredCowFactory);
//   const buffaloTotals = calculateTotals(milkTankData.buffalo, filteredBuffaloFactory);

//   return (
//     <CCard className="mb-4">
//       <CCardHeader style={{ backgroundColor: '#d4edda' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h5 className="mb-0">Daily Tally Report</h5>
//           <div className="d-flex align-items-center">
//             <div style={{ position: 'relative', marginRight: '10px' }}>
//               <CButton
//                 variant="outline"
//                 onClick={toggleCalendar}
//                 className="d-flex align-items-center"
//                 style={{ minWidth: '180px', justifyContent: 'space-between' }}
//               >
//                 <div className="d-flex align-items-center">
//                   <CalendarIcon size={18} className="me-2" />
//                   {selectedDate ? formatDateForDisplay(selectedDate) : 'Select Date'}
//                 </div>
//                 <CIcon icon={calendarVisible ? cilX : cilChevronBottom} size="sm" />
//               </CButton>

//               {calendarVisible && (
//                 <div
//                   style={{
//                     position: 'absolute',
//                     zIndex: 1000,
//                     top: '100%',
//                     right: 0,
//                     backgroundColor: 'white',
//                     boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//                     borderRadius: '4px',
//                     padding: '12px',
//                     width: '300px'
//                   }}
//                 >
//                   {/* Calendar Header */}
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//                     <CButton color="light" size="sm" onClick={prevMonth}>
//                       <CIcon icon={cilChevronLeft} size="sm" />
//                     </CButton>
//                     <div style={{ fontWeight: 'bold' }}>
//                       {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//                     </div>
//                     <CButton color="light" size="sm" onClick={nextMonth}>
//                       <CIcon icon={cilChevronRight} size="sm" />
//                     </CButton>
//                   </div>

//                   {/* Days of Week */}
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
//                     {daysOfWeek.map(day => (
//                       <div key={day} style={{ padding: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>
//                         {day}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Calendar Days */}
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
//                     {/* Empty cells for days before the first day of month */}
//                     {[...Array(getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()))].map((_, index) => (
//                       <div key={`empty-${index}`} style={{ padding: '8px' }}></div>
//                     ))}

//                     {/* Actual days of the month */}
//                     {[...Array(getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()))].map((_, index) => {
//                       const dayNumber = index + 1;
//                       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
//                       const isToday = isSameDay(date, new Date());
//                       const isSelected = isSameDay(date, selectedDate);
//                       const hasData = isDateAvailable(date);
//                       const isPastDate = date <= new Date();

//                       return (
//                         <div
//                           key={`day-${dayNumber}`}
//                           onClick={() => isPastDate && handleDateChange(date)}
//                           style={{
//                             padding: '8px',
//                             textAlign: 'center',
//                             cursor: isPastDate ? 'pointer' : 'default',
//                             backgroundColor: isSelected ? '#0d6efd' : hasData ? '#d4edda' : 'transparent',
//                             color: isSelected ? 'white' : isToday ? '#0d6efd' : 'inherit',
//                             borderRadius: '4px',
//                             opacity: isPastDate ? 1 : 0.5,
//                             fontWeight: isToday ? 'bold' : 'normal'
//                           }}
//                         >
//                           {dayNumber}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Footer with indicators */}
//                   <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
//                     <div>
//                       <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#d4edda', marginRight: '4px', borderRadius: '2px' }}></span>
//                       <span>Data Available</span>
//                     </div>
//                     <div>
//                       <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#0d6efd', marginRight: '4px', borderRadius: '2px' }}></span>
//                       <span>Selected</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <CButton
//               color="light"
//               variant="outline"
//               size="sm"
//               onClick={handleRefresh}
//               title="Refresh Data"
//             >
//               <CIcon icon={cilSync} size="sm" />
//             </CButton>
//           </div>
//         </div>
//       </CCardHeader>

//       <CCardBody>
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
//             {/* Milk Capacity Section */}
//             <CCard className="mb-4">
//               <CCardHeader style={{ backgroundColor: '#cce5ff' }}>
//                 <h5 className="mb-0">Milk Capacity</h5>
//               </CCardHeader>
//               <CCardBody>
//                 <CRow>
//                   <CCol md={6}>
//                     <CCard className="h-100 border-primary">
//                       <CCardHeader style={{ backgroundColor: '#e2efff' }}>
//                         <h6 className="mb-0">Cow Tank</h6>
//                       </CCardHeader>
//                       <CCardBody>
//                         <table className="table table-bordered mb-0">
//                           <tbody>
//                             <tr>
//                               <th style={{ width: '40%' }}>Opening Balance</th>
//                               <td>{milkTankData.cow.openingBalance} liters</td>
//                             </tr>
//                             <tr>
//                               <th>Morning Entry</th>
//                               <td>{milkTankData.cow.morningEntry} liters</td>
//                             </tr>
//                             <tr>
//                               <th>Evening Entry</th>
//                               <td>{milkTankData.cow.eveningEntry} liters</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </CCardBody>
//                     </CCard>
//                   </CCol>
//                   <CCol md={6}>
//                     <CCard className="h-100 border-info">
//                       <CCardHeader style={{ backgroundColor: '#e0f7fa' }}>
//                         <h6 className="mb-0">Buffalo Tank</h6>
//                       </CCardHeader>
//                       <CCardBody>
//                         <table className="table table-bordered mb-0">
//                           <tbody>
//                             <tr>
//                               <th style={{ width: '40%' }}>Opening Balance</th>
//                               <td>{milkTankData.buffalo.openingBalance} liters</td>
//                             </tr>
//                             <tr>
//                               <th>Morning Entry</th>
//                               <td>{milkTankData.buffalo.morningEntry} liters</td>
//                             </tr>
//                             <tr>
//                               <th>Evening Entry</th>
//                               <td>{milkTankData.buffalo.eveningEntry} liters</td>
//                             </tr>
//                           </tbody>
//                         </table>
//                       </CCardBody>
//                     </CCard>
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>

//             {/* Product Log Section */}
//             <CCard className="mb-4">
//               <CCardHeader style={{ backgroundColor: '#fff3cd' }}>
//                 <h5 className="mb-0">Daily Production</h5>
//               </CCardHeader>
//               <CCardBody>
//                 <CRow>
//                   <CCol md={6}>
//                     <h6 className="mb-3">Cow Products</h6>
//                     <div className="mb-3" style={{ height: '250px', overflow: 'auto' }}>
//                       <CCard className="h-100 border">
//                         <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
//                           <h6 className="mb-0">Factory Products</h6>
//                         </CCardHeader>
//                         <CCardBody style={{ padding: 0 }}>
//                           {filteredCowFactory.length > 0 ? (
//                             <table className="table table-hover table-bordered align-middle mb-0">
//                               <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
//                                 <tr>
//                                   <th>Product Name</th>
//                                   <th>Size</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {filteredCowFactory.map((item, index) => (
//                                   <tr key={index}>
//                                     <td>{item.product_name}</td>
//                                     <td>{item.quantity} {item.unit}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="text-center py-4 text-muted">
//                               No data available
//                             </div>
//                           )}
//                         </CCardBody>
//                       </CCard>
//                     </div>
//                     <div style={{ height: '250px', overflow: 'auto' }}>
//                       <CCard className="h-100 border">
//                         <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
//                           <h6 className="mb-0">Retail Products</h6>
//                         </CCardHeader>
//                         <CCardBody style={{ padding: 0 }}>
//                           {filteredCowRetail.length > 0 ? (
//                             <table className="table table-hover table-bordered align-middle mb-0">
//                               <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
//                                 <tr>
//                                   <th>Product Name</th>
//                                   <th>Size</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {filteredCowRetail.map((item, index) => (
//                                   <tr key={index}>
//                                     <td>{item.product_name}</td>
//                                     <td>{item.quantity} {item.unit}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="text-center py-4 text-muted">
//                               No data available
//                             </div>
//                           )}
//                         </CCardBody>
//                       </CCard>
//                     </div>
//                   </CCol>
//                   <CCol md={6}>
//                     <h6 className="mb-3">Buffalo Products</h6>
//                     <div className="mb-3" style={{ height: '250px', overflow: 'auto' }}>
//                       <CCard className="h-100 border">
//                         <CCardHeader style={{ backgroundColor: '#E6E6FA', position: 'sticky', top: 0, zIndex: 2 }}>
//                           <h6 className="mb-0">Factory Products</h6>
//                         </CCardHeader>
//                         <CCardBody style={{ padding: 0 }}>
//                           {filteredBuffaloFactory.length > 0 ? (
//                             <table className="table table-hover table-bordered align-middle mb-0">
//                               <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
//                                 <tr>
//                                   <th>Product Name</th>
//                                   <th>Size</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {filteredBuffaloFactory.map((item, index) => (
//                                   <tr key={index}>
//                                     <td>{item.product_name}</td>
//                                     <td>{item.quantity} {item.unit}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="text-center py-4 text-muted">
//                               No data available
//                             </div>
//                           )}
//                         </CCardBody>
//                       </CCard>
//                     </div>
//                     <div style={{ height: '250px', overflow: 'auto' }}>
//                       <CCard className="h-100 border">
//                         <CCardHeader style={{ backgroundColor: '#f8d7da', position: 'sticky', top: 0, zIndex: 2 }}>
//                           <h6 className="mb-0">Retail Products</h6>
//                         </CCardHeader>
//                         <CCardBody style={{ padding: 0 }}>
//                           {filteredBuffaloRetail.length > 0 ? (
//                             <table className="table table-hover table-bordered align-middle mb-0">
//                               <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
//                                 <tr>
//                                   <th>Product Name</th>
//                                   <th>Size</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {filteredBuffaloRetail.map((item, index) => (
//                                   <tr key={index}>
//                                     <td>{item.product_name}</td>
//                                     <td>{item.quantity} {item.unit}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="text-center py-4 text-muted">
//                               No data available
//                             </div>
//                           )}
//                         </CCardBody>
//                       </CCard>
//                     </div>
//                   </CCol>
//                 </CRow>
//               </CCardBody>
//             </CCard>

//             {/* Summary Card */}
//             <CCard>
//               <CCardHeader style={{ backgroundColor: '#d4edda' }}>
//                 <h5 className="mb-0">Summary</h5>
//               </CCardHeader>
//               <CCardBody>
//                 <CRow>
//                   <CCol md={6}>
//                     <div className="border rounded p-3 h-100">
//                       <h6 className="mb-3 text-primary">Cow Summary</h6>
//                       <table className="table table-bordered">
//                         <tbody>
//                           <tr>
//                             <th>Total Balance</th>
//                             <td>{cowTotals.total} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Quantity Used</th>
//                             <td>{cowTotals.productQuantity} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Waste Milk </th>
//                             <td>{cowTotals.waste_quantity} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Remaining Balance</th>
//                             <td>{cowTotals.remaining} liters</td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </CCol>
//                   <CCol md={6}>
//                     <div className="border rounded p-3 h-100">
//                       <h6 className="mb-3 text-info">Buffalo Summary</h6>
//                       <table className="table table-bordered">
//                         <tbody>
//                           <tr>
//                             <th>Total Balance</th>
//                             <td>{buffaloTotals.total} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Quantity Used</th>
//                             <td>{buffaloTotals.productQuantity} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Waste Milk </th>
//                             <td>{buffaloTotals.waste_quantity} liters</td>
//                           </tr>
//                           <tr>
//                             <th>Remaining Balance</th>
//                             <td>{buffaloTotals.remaining} liters</td>
//                           </tr>
//                         </tbody>
//                       </table>
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
