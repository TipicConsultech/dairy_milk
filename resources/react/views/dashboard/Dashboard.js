import React, { useEffect, useState } from 'react'

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
  const user=getUserType();
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
      if(mode === 'advance'){
        fetchMonthlySales();
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }, []);

  useEffect(()=>{
    try {
      const stock = async () => {
        const response = await getAPICall('/api/stock');
        setStock(response);
      }
      stock();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  },[])

  return (
    <>
      {mode === 'advance' && <WidgetsDropdown className="mb-4" reportMonth={reportMonth} />}
      {stock.length > 0 &&(
      <CCard className="mt-4 mb-4">
        <CCardBody>
          <CRow>
          <h4 className="card-title mb-0 text-center"> {t('LABELS.overview')} </h4>
            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">{t('LABELS.product')}</CTableHeaderCell>
                  <CTableHeaderCell scope="col">{t('LABELS.total')}</CTableHeaderCell>
                  <CTableHeaderCell scope="col">{t('LABELS.stock')}</CTableHeaderCell>
                  <CTableHeaderCell scope="col">{t('LABELS.given')}</CTableHeaderCell>
                  <CTableHeaderCell scope="col">{t('LABELS.booked')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {stock.filter(p=>p.product.showOnHome).map(p=><CTableRow>
                  <CTableHeaderCell>{lng === 'en' ? p.name : p.localName}</CTableHeaderCell>
                  <CTableDataCell className='bg-primary font-weight-bold text-white text-center'>{p.qty}</CTableDataCell>
                  <CTableDataCell className='bg-success font-weight-bold text-white text-center'>{p.stock}</CTableDataCell>
                  <CTableDataCell className='bg-danger font-weight-bold text-white text-center'>{p.qty - p.stock}</CTableDataCell>
                  <CTableDataCell className='bg-warning font-weight-bold text-white text-center'>{p.booked}</CTableDataCell>
                </CTableRow>)}
              </CTableBody>
            </CTable>
          </CRow>
        </CCardBody>
      </CCard> )}
      {((user===0||user===1) && mode === 'advance') &&(
        <CCard className="mt-4 mb-4">
          <CCardBody>
            <CRow>
              <CCol sm={5}>
                <h4 id="traffic" className="card-title mb-0">
                  P&L(In Thousands)
                </h4>
                <div className="small text-body-secondary">January - December</div>
              </CCol>
              <CCol sm={7} className="d-none d-md-block">
                {/* <CButton color="primary" className="float-end">
                  <CIcon icon={cilCloudDownload} />
                </CButton> */}
                {/*<CButtonGroup className="float-end me-3">
                  {['Day', 'Month', 'Year'].map((value) => (
                    <CButton
                      color="outline-secondary"
                      key={value}
                      className="mx-0"
                      active={value === 'Month'}
                    >
                      {value}
                    </CButton>
                  ))}
                </CButtonGroup> */}
              </CCol>
            </CRow>
            <MainChart monthlyPandL={reportMonth.monthlyPandL}/>
          </CCardBody>
        </CCard> )}
    </>
  )
}

export default Dashboard
