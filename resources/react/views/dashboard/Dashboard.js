import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';


import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

import { getAPICall } from '../../util/api'
import { getUserData, getUserType } from '../../util/session'
import { useToast } from '../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'

const Dashboard = (Props) => {
  const user = getUserType();
  const [reportMonth, setReportMonth] = useState({
    monthlySales: Array(12).fill(0), 
    monthlyExpense: Array(12).fill(0),
    monthlyPandL: Array(12).fill(0)
  });
  const [stock, setStock] = useState([]); 
  const { showToast } = useToast();
  const userData = getUserData();
  const mode = userData?.company_info?.appMode ?? 'advance';
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  useEffect(() => {
    try {
      const fetchMonthlySales = async () => {
        const response = await getAPICall('/api/monthlyReport');
        setReportMonth(response);
      };
      if (mode === 'advance') {
        fetchMonthlySales();
      }
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  }, []);

  useEffect(() => {
    try {
      const fetchStock = async () => {
        const response = await getAPICall('/api/stock');
        setStock(response);
      }
      fetchStock();
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  }, [])

  return (
    <>
      {mode === 'advance' && <WidgetsDropdown className="mb-4" reportMonth={reportMonth} />}
      {stock.length > 0 && (
        <CCard className="mt-4 mb-4">
          <CCardBody>
            <CRow className="justify-content-center">
              <h4 className="card-title mb-0 text-center"> {t('LABELS.overview')} </h4>
              <div className="overflow-x-auto w-full" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <CTable className="min-w-[600px]">
  <CTableHead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 2 }}>
    <CTableRow>
      <CTableHeaderCell scope="col">{t('LABELS.product')}</CTableHeaderCell>
      <CTableHeaderCell scope="col" className="text-center" style={{ width: '20%' }}>
        {t('LABELS.total')}
      </CTableHeaderCell>
      <CTableHeaderCell scope="col" className="text-center" style={{ width: '20%' }}>
        {t('LABELS.stock')}
      </CTableHeaderCell>
      <CTableHeaderCell scope="col" className="text-center" style={{ width: '20%' }}>
        {t('LABELS.given')}
      </CTableHeaderCell>
      <CTableHeaderCell scope="col" className="text-center" style={{ width: '20%' }}>
        {t('LABELS.booked')}
      </CTableHeaderCell>
    </CTableRow>
  </CTableHead>


<CTableBody>
  {stock.filter(p => p.product).map(p => (
    <CTableRow key={p.id}>
      <CTableHeaderCell>{lng === 'en' ? p.name : p.localName}</CTableHeaderCell>

      <CTableDataCell
        className="text-center font-weight-bold text-black"
        style={{ width: '20%' }}
      >
        {p.qty}
      </CTableDataCell>

      <CTableDataCell
        className="text-center font-weight-bold text-black"
        style={{ width: '20%' }}
      >
        {p.max_stock}
      </CTableDataCell>

      <CTableDataCell
        className="text-center font-weight-bold text-black"
        style={{ width: '20%' }}
      >
        {p.max_stock- p.qty}
      </CTableDataCell>

      <CTableDataCell
        className="text-center font-weight-bold text-black"
        style={{ width: '20%' }}
      >
        <Link to="/bookings" className="text-black text-decoration-underline d-block">
          {p.booked}
        </Link>
      </CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>

                </CTable>
              </div>
            </CRow>
          </CCardBody>
        </CCard>
      )}
      {((user === 0 || user === 1) && mode === 'advance') && (
        <CCard className="mt-4 mb-4">
          <CCardBody>
            <CRow>
              <CCol sm={5}>
                <h4 id="traffic" className="card-title mb-0">
                  P&L (In Thousands)
                </h4>
                <div className="small text-body-secondary">January - December</div>
              </CCol>
              <CCol sm={7} className="d-none d-md-block">
                {/* Additional buttons or controls can go here */}
              </CCol>
            </CRow>
            <MainChart monthlyPandL={reportMonth.monthlyPandL} />
          </CCardBody>
        </CCard>
      )}
    </>
  )
}

export default Dashboard
