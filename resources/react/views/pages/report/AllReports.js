import { CButton, CFormSelect, CTabs, CTabList, CTabPanel, CTabContent, CTab, CFormInput, CCard, CCardBody, CCardHeader, CRow, CCol } from '@coreui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { Year, Custom, Months, Quarter, Week } from './Dates';
import { getAPICall } from '../../../util/api';
import All_Tables from './AllTables';
import { Button, Dropdown } from '/resources/react/views/pages/report/ButtonDropdowns';
import { MantineProvider } from '@mantine/core';
import { useToast } from '../../common/toast/ToastContext';
import { FaChartLine, FaMoneyBillWave, FaBalanceScale, FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import icons

function All_Reports() {
  const [selectedOption, setSelectedOption] = useState('3');
  const [stateCustom, setStateCustom] = useState({ start_date: '', end_date: '' });
  const [stateMonth, setStateMonth] = useState({ start_date: '', end_date: '' });
  const [stateQuarter, setStateQuarter] = useState({ start_date: '', end_date: '' });
  const [stateYear, setStateYear] = useState({ start_date: '', end_date: '' });
  const [activeTab1, setActiveTab] = useState('Year');
  const [stateWeek, setStateWeek] = useState({ start_date: '', end_date: '' });
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const ReportOptions = [
    { label: 'Sales', value: '1' },
    { label: 'Expense', value: '2' },
    { label: 'Profit & Loss', value: '3' },
  ];

  //for Sales Report
  const [salesData, setSalesData] = useState({
    data: [],
    totalSales: 0,
    totalPaid: 0,
    totalRemaining: 0,
    count: 0
  });

  //for Expense Report
  const [expenseData, setExpenseData] = useState({
    data: [],
    totalExpense: 0,
    count: 0
  });
  const [expenseType, setExpenseType] = useState({});

  //Profit & Loss
  const [pnlData, setPnLData] = useState({
    Data: [],
    totalSales: 0,
    totalExpenses: 0,
    totalProfitOrLoss: 0,
    salesCount: 0,
    expenseCount: 0
  });

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const fetchReportData = async() => {
    try {
      setIsLoading(true);
      let date = {};

      switch (activeTab1) {
        case 'Custom':
          date = stateCustom;
          break;
        case 'Month':
          date = stateMonth;
          break;
        case 'Quarter':
          date = stateQuarter;
          break;
        case 'Year':
          date = stateYear;
          break;
        case 'Week':
          date = stateWeek;
          break;
        default:
          break;
      }

      if (!date.start_date || !date.end_date) {
        showToast('warning', "Please select dates before fetching data.");
        setIsLoading(false);
        return;
      }

      // Using the new API for reports
      if (selectedOption === '1') {
        // Sales Report
        const salesResp = await getAPICall(
          `/api/report-totals?reportType=sales&startDate=${date.start_date}&endDate=${date.end_date}`
        );

        if (salesResp && salesResp.success) {
          setSalesData({
            data: salesResp.data || [],
            totalSales: salesResp.summary.totalAmount || 0,
            totalPaid: salesResp.summary.totalPaid || 0,
            totalRemaining: salesResp.summary.totalRemaining || 0,
            count: salesResp.summary.count || 0
          });
        } else {
          showToast('danger', 'Failed to fetch sales records');
        }
      }

      if (selectedOption === '2') {
        // Expense Report
        const expenseResp = await getAPICall(
          `/api/report-totals?reportType=expense&startDate=${date.start_date}&endDate=${date.end_date}`
        );

        if (expenseResp && expenseResp.success) {
          setExpenseData({
            data: expenseResp.data || [],
            totalExpense: expenseResp.summary.totalExpense || 0,
            count: expenseResp.summary.count || 0
          });
        } else {
          showToast('danger', 'Failed to fetch expense records');
        }
      }

      if (selectedOption === '3') {
        // Profit & Loss Report
        const pnlResp = await getAPICall(
          `/api/report-totals?reportType=profitloss&startDate=${date.start_date}&endDate=${date.end_date}`
        );

        if (pnlResp && pnlResp.success) {
          setPnLData({
            // Fix: Ensure we're setting the correct data format for both sales and expenses
            Data: pnlResp.data || [], // This should include both sales and expenses data
            totalSales: pnlResp.summary.totalSales || 0,
            totalExpenses: pnlResp.summary.totalExpense || 0,
            totalProfitOrLoss: pnlResp.summary.totalProfit || 0,
            salesCount: pnlResp.summary.salesCount || 0,
            expenseCount: pnlResp.summary.expenseCount || 0
          });
        } else {
          showToast('danger', 'Failed to fetch profit & loss records');
        }
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format number as currency with Rupee symbol
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Render summary cards based on selected report type
  const renderSummaryCards = () => {
    if (isLoading) {
      return (
        <CRow className="mb-4">
          <CCol md={12}>
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </CCol>
        </CRow>
      );
    }

    switch (selectedOption) {
      case '1': // Sales Report
        return (
          <CRow className="mb-4 summary-cards">
            <CCol md={4}>
              <CCard className="mb-3 shadow-sm border-0 h-100 card-sales">
                <CCardBody className="d-flex align-items-center">
                  <div className="icon-circle bg-primary text-white mr-3">
                    <FaChartLine size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Sales</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(salesData.totalSales)}</h3>
                    <small className="text-muted">{salesData.count} transactions</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={4}>
              <CCard className="mb-3 shadow-sm border-0 h-100 card-paid">
                <CCardBody className="d-flex align-items-center">
                  <div className="icon-circle bg-success text-white mr-3">
                    <FaMoneyBillWave size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Paid</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(salesData.totalPaid)}</h3>
                    <small className="text-muted">{Math.round((salesData.totalPaid / salesData.totalSales) * 100) || 0}% of total</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={4}>
              <CCard className="mb-3 shadow-sm border-0 h-100 card-remaining">
                <CCardBody className="d-flex align-items-center">
                  <div className="icon-circle bg-warning text-white mr-3">
                    <FaBalanceScale size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Remaining</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(salesData.totalRemaining)}</h3>
                    <small className="text-muted">{Math.round((salesData.totalRemaining / salesData.totalSales) * 100) || 0}% of total</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        );

      case '2': // Expense Report
        return (
          <CRow className="mb-4 summary-cards">
            <CCol md={6} className="mx-auto">
              <CCard className="mb-3 shadow-sm border-0 h-100 card-expense">
                <CCardBody className="d-flex align-items-center justify-content-center">
                  <div className="icon-circle bg-danger text-white mr-3">
                    <FaArrowDown size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Expenses</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(expenseData.totalExpense)}</h3>
                    <small className="text-muted">{expenseData.count} expense entries</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        );

      case '3': // Profit & Loss Report
        const isProfitable = pnlData.totalProfitOrLoss >= 0;
        return (
          <CRow className="mb-4 summary-cards">
            <CCol md={4}>
              <CCard className="mb-3 shadow-sm border-0 h-100 card-sales">
                <CCardBody className="d-flex align-items-center">
                  <div className="icon-circle bg-primary text-white mr-3">
                    <FaChartLine size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Sales</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(pnlData.totalSales)}</h3>
                    <small className="text-muted">{pnlData.salesCount} transactions</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={4}>
              <CCard className="mb-3 shadow-sm border-0 h-100 card-expense">
                <CCardBody className="d-flex align-items-center">
                  <div className="icon-circle bg-danger text-white mr-3">
                    <FaArrowDown size={30} />
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">Total Expenses</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(pnlData.totalExpenses)}</h3>
                    <small className="text-muted">{pnlData.expenseCount} expense entries</small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={4}>
              <CCard className={`mb-3 shadow-sm border-0 h-100 ${isProfitable ? 'card-profit' : 'card-loss'}`}>
                <CCardBody className="d-flex align-items-center">
                  <div className={`icon-circle ${isProfitable ? 'bg-success' : 'bg-danger'} text-white mr-3`}>
                    {isProfitable ? <FaArrowUp size={30} /> : <FaArrowDown size={30} />}
                  </div>
                  <div className="ms-3">
                    <h6 className="text-muted mb-1">{isProfitable ? 'Net Profit' : 'Net Loss'}</h6>
                    <h3 className="mb-0 fw-bold">{formatCurrency(Math.abs(pnlData.totalProfitOrLoss))}</h3>
                    <small className="text-muted">
                      {isProfitable
                        ? `${Math.round((pnlData.totalProfitOrLoss / pnlData.totalSales) * 100) || 0}% profit margin`
                        : `${Math.round((Math.abs(pnlData.totalProfitOrLoss) / pnlData.totalSales) * 100) || 0}% loss margin`}
                    </small>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <div className="responsive-container">
          <CTabs activeItemKey={activeTab1} onChange={handleTabChange}>
            <CTabList variant="tabs" className="flex-wrap">
              <CTab itemKey="Year">Year</CTab>
              <CTab itemKey="Quarter">Quarter</CTab>
              <CTab itemKey="Month">Month</CTab>
              <CTab itemKey="Week">Week</CTab>
              <CTab itemKey="Custom" default>Custom</CTab>
            </CTabList>
            <CTabContent>
              {/* Custom Tab */}
              <CTabPanel className="p-3" itemKey="Custom">
                {/* For larger screens (original layout) */}
                <div className="d-none d-md-flex mb-3 justify-content-between">
                  <div className="d-flex mx-1">
                    <Custom setStateCustom={setStateCustom} />
                    <div className="flex-fill mx-2 mt-1 col-sm-3">
                      <h1></h1>
                      <br/>
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                        className="larger-dropdown"
                      />
                    </div>
                  </div>
                  <div className="flex-fill px-0 mt-1">
                    <h1></h1>
                    <br/>
                    <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                  </div>
                </div>

                {/* For smaller screens (mobile-friendly layout) */}
                <div className="d-md-none mb-3">
                  <div className="row gy-3">
                    <div className="col-12">
                      <Custom setStateCustom={setStateCustom} />
                    </div>
                    <div className="col-6">
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                      />
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                      <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {renderSummaryCards()}

                <div className="mt-3">
                  <All_Tables
                    selectedOption={selectedOption}
                    salesData={salesData}
                    expenseData={expenseData}
                    pnlData={pnlData}
                    expenseType={expenseType}
                  />
                </div>
              </CTabPanel>

              {/* Week Tab */}
              <CTabPanel className="p-3" itemKey="Week">
                {/* For larger screens (original layout) */}
                <div className="d-none d-md-flex mb-3 m">
                  <Week setStateWeek={setStateWeek}/>
                  <div className='mx-1'>
                    <Dropdown
                      setSelectedOption={setSelectedOption}
                      ReportOptions={ReportOptions}
                      selectedOption={selectedOption}
                    />
                  </div>
                  <div className='mx-1'>
                    <Button fetchReportData={fetchReportData} isLoading={isLoading}/>
                  </div>
                </div>

                {/* For smaller screens (mobile-friendly layout) */}
                <div className="d-md-none mb-3">
                  <div className="row gy-3">
                    <div className="col-12">
                      <Week setStateWeek={setStateWeek} />
                    </div>
                    <div className="col-6">
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                      />
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                      <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {renderSummaryCards()}

                <div className="mt-3">
                  <All_Tables
                    selectedOption={selectedOption}
                    salesData={salesData}
                    expenseData={expenseData}
                    pnlData={pnlData}
                    expenseType={expenseType}
                  />
                </div>
              </CTabPanel>

              {/* Month Tab */}
              <CTabPanel className="p-3" itemKey="Month">
                {/* For larger screens (original layout) */}
                <div className="d-none d-md-flex mb-3 justify-content-between">
                  <div className="flex-fill mx-1">
                    <Months setStateMonth={setStateMonth} />
                  </div>
                  <div className="flex-fill mx-1">
                    <Dropdown
                      setSelectedOption={setSelectedOption}
                      ReportOptions={ReportOptions}
                      selectedOption={selectedOption}
                    />
                  </div>
                  <div className="flex-fill mx-1">
                    <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                  </div>
                </div>

                {/* For smaller screens (mobile-friendly layout) */}
                <div className="d-md-none mb-3">
                  <div className="row gy-3">
                    <div className="col-12">
                      <Months setStateMonth={setStateMonth} />
                    </div>
                    <div className="col-6">
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                      />
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                      <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {renderSummaryCards()}

                <div className="mt-3">
                  <All_Tables
                    selectedOption={selectedOption}
                    salesData={salesData}
                    expenseData={expenseData}
                    pnlData={pnlData}
                    expenseType={expenseType}
                  />
                </div>
              </CTabPanel>

              {/* Quarter Tab */}
              <CTabPanel className="p-3" itemKey="Quarter">
                {/* For larger screens (original layout) */}
                <div className="d-none d-md-flex mb-3 col-md-10">
                  <Quarter setStateQuarter={setStateQuarter} />
                  <Dropdown
                    setSelectedOption={setSelectedOption}
                    ReportOptions={ReportOptions}
                    selectedOption={selectedOption}
                  />
                  <div className='px-2'>
                    <Button fetchReportData={fetchReportData} isLoading={isLoading}/>
                  </div>
                </div>

                {/* For smaller screens (mobile-friendly layout) */}
                <div className="d-md-none mb-3">
                  <div className="row gy-3">
                    <div className="col-12">
                      <Quarter setStateQuarter={setStateQuarter} />
                    </div>
                    <div className="col-6">
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                      />
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                      <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {renderSummaryCards()}

                <div className="mt-3">
                  <All_Tables
                    selectedOption={selectedOption}
                    salesData={salesData}
                    expenseData={expenseData}
                    pnlData={pnlData}
                    expenseType={expenseType}
                  />
                </div>
              </CTabPanel>

              {/* Year Tab */}
              <CTabPanel className="p-3" itemKey="Year">
                {/* For larger screens (original layout) */}
                <div className="d-none d-md-flex mb-3 m">
                  <Year setStateYear={setStateYear} />
                  <div className='mx-1 mt-2'>
                    <Dropdown
                      setSelectedOption={setSelectedOption}
                      ReportOptions={ReportOptions}
                      selectedOption={selectedOption}
                    />
                  </div>
                  <div className='mx-1 mt-2'>
                    <Button fetchReportData={fetchReportData} isLoading={isLoading}/>
                  </div>
                </div>

                {/* For smaller screens (mobile-friendly layout) */}
                <div className="d-md-none mb-3">
                  <div className="row gy-3">
                    <div className="col-12">
                      <Year setStateYear={setStateYear} />
                    </div>
                    <div className="col-6">
                      <Dropdown
                        setSelectedOption={setSelectedOption}
                        ReportOptions={ReportOptions}
                        selectedOption={selectedOption}
                      />
                    </div>
                    <div className="col-6 d-flex justify-content-start">
                      <Button fetchReportData={fetchReportData} isLoading={isLoading} />
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {renderSummaryCards()}

                <div className="mt-3">
                  <All_Tables
                    selectedOption={selectedOption}
                    salesData={salesData}
                    expenseData={expenseData}
                    pnlData={pnlData}
                    expenseType={expenseType}
                  />
                </div>
              </CTabPanel>
            </CTabContent>
          </CTabs>
        </div>
      </MantineProvider>

      {/* Add responsive styles */}
      <style jsx>{`
        .responsive-container {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (max-width: 768px) {
          .responsive-container {
            padding: 0 5px;
          }
        }

        /* Larger dropdown styling */
        :global(.larger-dropdown select) {
          min-width: 200px !important;
          font-size: 1.1rem !important;
          height: auto !important;
          padding: 8px 12px !important;
        }

        /* For the button itself to be larger */
        :global(.larger-dropdown .dropdown-toggle) {
          min-width: 200px !important;
          font-size: 1.1rem !important;
          padding: 8px 12px !important;
        }

        /* For dropdown menu items to be larger */
        :global(.larger-dropdown .dropdown-menu .dropdown-item) {
          font-size: 1.1rem !important;
          padding: 8px 12px !important;
        }

        /* Icon Circle for Cards */
        :global(.icon-circle) {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }

        /* Summary Cards Styling */
        :global(.summary-cards .card) {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 12px;
        }

        :global(.summary-cards .card:hover) {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }

        :global(.card-sales) {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ef 100%);
        }

        :global(.card-paid) {
          background: linear-gradient(135deg, #f2fcf5 0%, #e0f5e8 100%);
        }

        :global(.card-remaining) {
          background: linear-gradient(135deg, #fef8e3 0%, #fbf0d1 100%);
        }

        :global(.card-expense) {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        }

        :global(.card-profit) {
          background: linear-gradient(135deg, #ecfdf5 0%, #dcf7ec 100%);
        }

        :global(.card-loss) {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        }
      `}</style>
    </>
  );
}

export default All_Reports;
