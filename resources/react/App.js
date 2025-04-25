import React, { Suspense, useEffect } from 'react'
import {  HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import DeliveryRecord from '../../resources/react/views/dairy/DeliveryRecord'




//testing
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels //ssss
);
//testing end






// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Faq = React.lazy(() => import('./views/pages/help/faq'));
const TicketForm = React.lazy(() => import('./views/pages/help/TicketForm'));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    setColorMode('light')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
          {/* <Route path="/" element={<Navigate to="/delivery" />} /> */}
          {/* <Route path="/delivery" element={<DeliveryRecord/>} /> */}

          {/* Help and Support Routes */}
          <Route exact path="/TicketForms" name="TicketForm" element={<TicketForm />} />
          <Route exact path="/faq" name="faq" element={<Faq />} />

        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
