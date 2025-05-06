import React, { useEffect, useState } from 'react'
import './Invoice.css'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'
import { cilDelete, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { getAPICall, post } from '../../../util/api'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'
import NewCustomerModal from '../../common/NewCustomerModal'
import { useSpinner } from '../../common/spinner/SpinnerProvider'
import { useTranslation } from 'react-i18next' // Import the translation hook

let debounceTimer;
const Invoice = () => {
  const { t, i18n } = useTranslation("global"); // Initialize translation function with namespace
  const [validated, setValidated] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [products, setProducts] = useState()
  const [allProducts, setAllProducts] = useState()
  const [customerHistory, setCustomerHistory] = useState()
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  const { showSpinner, hideSpinner } = useSpinner();
  const timeNow = ()=> `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
  const [state, setState] = useState({
    customer_id: 0,
    lat:'',
    long:'',
    payLater: false,
    isSettled: false,
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryTime: timeNow(),
    deliveryDate: new Date().toISOString().split('T')[0],
    invoiceType: 1,
    items: [
      {
        product_id: undefined,
        product_sizes_id: 0,
        product_name: '',
        product_unit: '',
        product_local_name: '',
        size_name: '',
        size_local_name: '',
        oPrice: 0,
        bPrice: 0,
        dPrice: 0,
        dQty: 0,
        eQty: 0,
        qty: 0,
        total_price: 0,
        returnable: 0,
      },
    ],
    orderStatus: 1,
    totalAmount: 0,
    discount: 0,
    balanceAmount: 0,
    paidAmount: 0,
    finalAmount: 0,
    paymentType: 1,
  })
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  async function getProductFromParam(){
    try{
      const data=await getAPICall(`/api/productSizes/${id}`);
      setState(prev => ({
        ...prev,
        items: [
          {
            product_id: data.product_id.toString(),
            product_sizes_id: data.id,
            product_name: data.name, // you can populate this if available in response
            name: data.name,
            product_name: data.name,
            product_local_name: data.localName,
            localName:data.localName,
            size_name: data.name,
            size_local_name: data.localName,
            oPrice: data.oPrice,
            bPrice: data.bPrice,
            dPrice: data.dPrice,
            id:'0',
            dQty: 0,
            eQty: 0,
            qty: data.qty,
            total_price: 0,
            returnable: data.returnable,
            unit:data.unit
          },
        ]
      }));
    }
    catch(e){
      console.error(e)
    }
  }

  // useEffect(()=>{
  //   if(id){
  //     getProductFromParam();
  //   }
  // },[id]);

  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const debounce = (func, delay) => {
      return function(...args) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
              func.apply(this, args);
          }, delay);
      };
  };

  const searchCustomer = async (value) => {
    try {
      const customers = await getAPICall('/api/searchCustomer?searchQuery=' + value);
      if (customers?.length) {
        setSuggestions(customers);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      showToast('danger', t('MSG.errorOccurred') + ' ' + error);
    }
  };

  // Wrap the searchCustomer function with debounce
  const debouncedSearchCustomer = debounce(searchCustomer, 750);

  const handleNameChange = (event) => {
    const value = event.target.value;
    setCustomerName({name : value});
    // Filter suggestions based on input
    if (value) {
      debouncedSearchCustomer(value)
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCustomerName(suggestion);
    setState((pre)=>({...pre, customer_id: suggestion.id}))
    const updatedProducts = discountedPrices([...allProducts], suggestion.discount)
    setAllProducts(updatedProducts);
    calculateTotal(updatedProducts);
    setSuggestions([]);
    getCustomerHistory(suggestion.id);
  };

  const onCustomerAdded = (customer) => {
    handleSuggestionClick(customer);
    setShowCustomerModal(false);
  }

  const getDiscountedPrice = (p, discount) =>{
    const value = p.sizes[0]?.oPrice ?? 0;
    const price = value - (value * (discount || (customerName.discount ?? 0)) /100);
    return Math.round(price);
  }

  const discountedPrices = (products, discount) =>{
    products.forEach(p=>{
      if(p.sizes.length>0){
        p.sizes[0].dPrice = getDiscountedPrice(p, discount)
      }

    })
    return products;
  }

  const getCustomerHistory = async (customer_id)=>{
    try {
      //customerHistory
      const response = await getAPICall('/api/customerHistory?id=' + customer_id);
      if (response) {
        setCustomerHistory(response);
      }
    } catch (error) {
      showToast('danger', t('MSG.errorOccurred') + ' ' + error);
    }
  }

  const fetchProduct = async () => {
    showSpinner();
    try {
      const response = await getAPICall('/api/product')
      setAllProducts(discountedPrices([...response.filter((p) => p.show == 1 )]));

      // Make sure we use the translation function for the select product option
      const options = [{
        label: t('LABELS.selectProduct'),
        value: ""
      }]

      options.push(
        ...response
          .filter((p) => p.show == 1 )
          .map((p) => {
            return {
              label: p.sizes[0].name,
              value: p.sizes[0].id,
              disabled: p.sizes[0].show === 0,
            }
          }),
      )
      setProducts(options)

      // Default selected product
      if (id) {
        let productData = response.filter((p) => p.show == 1 && p.sizes[0].id == id);
        if (productData.length > 0) {
          let data = productData[0].sizes[0];
          setState(prev => ({
            ...prev,
            items: [
              {
                product_id: data.product_id.toString(),
                product_sizes_id: data.id,
                product_name: data.name,
                name: data.name,
                product_local_name: data.localName,
                localName: data.localName,
                size_name: data.name,
                size_local_name: data.localName,
                oPrice: data.oPrice,
                bPrice: data.bPrice,
                dPrice: data.dPrice,
                id: '0',
                dQty: 0,
                eQty: 0,
                qty: data.qty,
                total_price: 0,
                returnable: data.returnable,
                unit: data.unit
              },
            ]
          }));
        }
      }
    } catch (error) {
      showToast('danger', t('MSG.errorFetchingProducts') + ': ' + error);
    } finally {
      hideSpinner();
    }
  }

  const handleAddProductRow = () => {
    setState((prev) => {
      const old = { ...prev }
      old.items.push({
        product_id: undefined,
        product_sizes_id: 0,
        product_name: '',
        product_unit: '',
        product_local_name: '',
        size_name: '',
        size_local_name: '',
        oPrice: 0,
        dPrice: 0,
        bPrice: 0,
        qty: 0,
        dQty: 0,
        eQty: 0,
        total_price: 0,
        returnable: 0,
      })
      return { ...old }
    })
  }

  const calculateTotal = (items) => {
    let total = 0
    items.forEach((item) => {
      total += item.total_price
    })
    return total
  }

  const handleRemoveProductRow = (index) => {
    setState((prev) => {
      const old = { ...prev }
      old.items.splice(index, 1)
      return { ...old }
    })
  }

  useEffect(() => {
    fetchProduct()
  }, [])

  const calculateFinalAmount = (old) => {
    old.finalAmount = old.totalAmount - ((old.totalAmount * old.discount) / 100 || 0)
    old.balanceAmount = 0
    old.paidAmount = old.finalAmount
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'discount') {
      setState((prev) => {
        const old = { ...prev }
        old.discount = value
        calculateFinalAmount(old)
        return { ...old }
      })
    } else if (name === 'paidAmount') {
      setState((prev) => {
        const old = { ...prev }
        old.paidAmount = value
        old.balanceAmount = old.finalAmount - old.paidAmount
        return { ...old }
      })
    } else {
      setState({ ...state, [name]: value })
    }
  }

  const handleProductChange = (e, index) => {
    const { value } = e.target
    const p = allProducts.find((p) => p.id == value)
    if (p && p.sizes[0]) {
      setState((prev) => {
        const old = { ...prev }
        old.items[index].product_id = value
        old.items[index].id = value
        old.items[index].product_sizes_id = p.sizes[0].id
        old.items[index].name = p.sizes[0].name
        old.items[index].localName = p.sizes[0].localName
        old.items[index].unit = p.unit
        old.items[index].product_name = p.name
        old.items[index].size_name = p.sizes[0].name
        old.items[index].size_local_name = p.sizes[0].localName
        old.items[index].product_local_name = p.localName
        old.items[index].oPrice = p.sizes[0].oPrice
        old.items[index].dQty = 0
        old.items[index].eQty = 0
        old.items[index].dPrice = p.sizes[0].dPrice
        old.items[index].bPrice = p.sizes[0].bPrice
        old.items[index].returnable = p.sizes[0].returnable
        old.items[index].total_price = p.sizes[0].dPrice * old.items[index].dQty
        old.totalAmount = calculateTotal(old.items)
        calculateFinalAmount(old)
        return { ...old }
      })
    }
  }

  const handleQtyChange = (e, index) => {
    const { value } = e.target
    setState((prev) => {
      const old = { ...prev }
      old.items[index].dQty = value
      old.items[index].total_price = old.items[index].dPrice * old.items[index].dQty
      old.totalAmount = calculateTotal(old.items)
      calculateFinalAmount(old)
      return { ...old }
    })
  }

  const handleSubmit = async (event) => {
    try {
      event.preventDefault()
      event.stopPropagation()
      //Valdation
      let isInvalid = false
      let clonedState = {
        ...state,
        finalAmount: state.totalAmount,
        deliveryTime: timeNow(),
      };

      const eligibleToSubmit = clonedState.balanceAmount>=0 && clonedState.customer_id > 0 && (clonedState.paidAmount > 0 || clonedState.items.length)

      if (!isInvalid && eligibleToSubmit) {
        showSpinner();
        const res = await post('/api/order', { ...clonedState })
        if (res) {
          if(res.id){
            showToast('success', t('MSG.orderDelivered'));
            navigate('/invoice-details/'+res.id);
            setShowAlert(false);
            setMessage('');
            handleClear()
          } else if(res.error_message){
            setShowAlert(true);
            setMessage(res.error_message);
          }
        }
      } else {
        showToast('warning', t('MSG.provideValidData'));
        setState(clonedState)
      }
      setValidated(true)
    } catch (error) {
      showToast('danger', t('MSG.errorPlacingOrder'));
    } finally {
      hideSpinner();
    }
  }

  const handleClear = async () => {
    setState({
      customer_id: 0,
      lat:'',
      long:'',
      payLater: false,
      isSettled: false,
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryTime: timeNow(),
      deliveryDate: new Date().toISOString().split('T')[0],
      invoiceType: 1,
      items: [
        {
          product_id: undefined,
          product_sizes_id: 0,
          product_name: '',
          product_unit: '',
          product_local_name: '',
          size_name: '',
          size_local_name: '',
          oPrice: 0,
          dPrice: 0,
          bPrice: 0,
          qty: 0,
          total_price: 0,
        },
      ],
      totalAmount: 0,
      discount: 0,
      balanceAmount: 0,
      paidAmount: 0,
      finalAmount: 0,
      paymentType: 1,
    })
    setCustomerName({});
  }

  return (
    <CRow>
       {showAlert && (
              <CAlert color="danger" onDismiss={() => setShowAlert(false)}>
                <div>{message}</div>
              </CAlert>
            )}
       <NewCustomerModal hint={customerName.name} onSuccess={onCustomerAdded} visible={showCustomerModal} setVisible={setShowCustomerModal}/>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('LABELS.newInvoice')}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="row mb-2">
              {/* Modified customer search section for responsive design */}
              <div className="col-md-8 col-12 mb-2">
                <CFormLabel htmlFor="invoiceDate">{t('LABELS.searchCustomer')}</CFormLabel>
                <div className="d-flex position-relative">
                  <CFormInput
                    type="text"
                    id="pname"
                    placeholder={t('LABELS.customerName')}
                    name="customerName"
                    value={customerName.name || ''}
                    onChange={handleNameChange}
                    autoComplete='off'
                    required
                    className="w-100"
                  />
                  {!customerName.id && customerName.name?.length > 0 && (
                    <CBadge
                      role="button"
                      color="danger"
                      onClick={() => setShowCustomerModal(true)}
                      className="position-absolute"
                      style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      + {t('LABELS.new')}
                    </CBadge>
                  )}
                </div>
                {customerName.name?.length > 0 && (
                  <ul className="suggestions-list" style={{ zIndex: 1000, position: 'absolute', width: 'calc(100% - 30px)' }}>
                    {suggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                        {suggestion.name + ' ('+suggestion.mobile+')'}
                      </li>
                    ))}
                    {!customerName.id && <li>
                      <CBadge
                        role="button"
                        color="danger"
                        onClick={() => setShowCustomerModal(true)}
                      >
                        {t('LABELS.newCustomer')}
                      </CBadge>
                    </li>}
                  </ul>
                )}
              </div>
              <div className="col-md-4 col-12 mb-2">
                <div className="mb-3">
                  <CFormLabel htmlFor="invoiceDate">{t('LABELS.invoiceDate')}</CFormLabel>
                  <CFormInput
                    type="date"
                    id="invoiceDate"
                    placeholder="Pune"
                    name="invoiceDate"
                    value={state.invoiceDate}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t('MSG.pleaseSelectDate')}
                  />
                </div>
              </div>
            </div>
              {/* Products table - responsive headers */}
              <div className="row d-none d-md-flex">
                <div className="col-4">
                  <div className="mb-1">
                    <b>{t('LABELS.product')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('LABELS.quantity')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('LABELS.price')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('LABELS.totalRs')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('LABELS.action')}</b>
                  </div>
                </div>
              </div>

              {/* Product items - made responsive */}
              {state.items?.map((oitem, index) => (
                <div key={index} className="row mb-3 border-bottom pb-2">
                  <div className="col-md-4 col-12 mb-2">
                    <div className="d-md-none mb-1"><b>{t('LABELS.product')}</b></div>
                    <CFormSelect
                      aria-label={t('LABELS.selectProduct')}
                      value={oitem.product_sizes_id}
                      options={products}
                      onChange={(event) => handleProductChange(event, index)}
                      invalid={oitem.notSelected == true}
                      required
                      feedbackInvalid={t('MSG.selectProduct')}
                    />
                  </div>

                  <div className="col-md-2 col-6 mb-2">
                    <div className="d-md-none mb-1"><b>{t('LABELS.quantity')}</b></div>
                    <CFormInput
                      type="number"
                      value={oitem.dQty > 0 ? oitem.dQty : ''}
                      placeholder={`${t('LABELS.stock')}: ${oitem.qty}`}
                      invalid={oitem.invalidQty === true}
                      required
                      feedbackInvalid={`${t('LABELS.max')} ${oitem.qty}`}
                      onChange={(event) => handleQtyChange(event, index)}
                    />
                  </div>
                  <div className="col-md-2 col-6 mb-2">
                    <div className="d-md-none mb-1"><b>{t('LABELS.price')}</b></div>
                    <p className="mt-md-2 mb-0">{oitem.dPrice + (oitem.unit ? ' / ' + oitem.unit : '')}</p>
                  </div>
                  <div className="col-md-2 col-6 mb-2">
                    <div className="d-md-none mb-1"><b>{t('LABELS.totalRs')}</b></div>
                    <p className="mt-md-2 mb-0">{oitem.total_price}</p>
                  </div>
                  <div className="col-md-2 col-6 mb-2 text-md-start text-end">
                    <div className="d-md-none mb-1"><b>{t('LABELS.action')}</b></div>
                    <div>
                      {state.items.length > 1 && (
                        <CButton color="" onClick={() => handleRemoveProductRow(index)}>
                          <CIcon icon={cilDelete} size="xl" style={{ '--ci-primary-color': 'red' }} />
                        </CButton>
                      )}
                      {index === state.items.length - 1 && (
                        <CButton onClick={handleAddProductRow} color="">
                          <CIcon icon={cilPlus} size="xl" style={{ '--ci-primary-color': 'green' }} />
                        </CButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Payment info - made responsive */}
              <div className="row mt-4">
                <div className="col-md-4 col-12 mb-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="balanceAmount">{t('LABELS.balanceAmountRs')}</CFormLabel>
                    <CFormInput
                      type="number"
                      id="balanceAmount"
                      placeholder=""
                      readOnly
                      name="balanceAmount"
                      value={state.balanceAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="paidAmount">{t('LABELS.paidAmountRs')}</CFormLabel>
                    <CFormInput
                      type="number"
                      id="paidAmount"
                      placeholder=""
                      name="paidAmount"
                      value={state.paidAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="finalAmount">{t('LABELS.totalAmountRs')}</CFormLabel>
                    <CFormInput
                      type="number"
                      id="finalAmount"
                      placeholder=""
                      name="finalAmount"
                      readOnly
                      value={state.finalAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div>
                {errorMessage && (
                  <CRow>
                    <CAlert color="danger">{errorMessage}</CAlert>
                  </CRow>
                )}
              </div>
              <div className="mb-3 mt-3 d-flex justify-content-start">
                <CButton
                  color="success"
                  type="submit"
                  className="mb-2 mb-md-0 me-md-2 "
                  style={{ width: '125px' }}
                >
                  {t('LABELS.submit')}
                </CButton>&nbsp;
                <CButton
                  color="secondary"
                  onClick={handleClear}
                  style={{ width: '125px' }}
                >
                  {t('LABELS.clear')}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Invoice

//---------------------------------------

// import React, { useEffect, useState } from 'react'
// import './Invoice.css'
// import {
//   CAlert,
//   CBadge,
//   CButton,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CFormSelect,
//   CRow,
// } from '@coreui/react'
// import { cilDelete, cilPlus } from '@coreui/icons'
// import CIcon from '@coreui/icons-react'
// import { getAPICall, post } from '../../../util/api'
// import { useLocation, useNavigate, useParams } from 'react-router-dom'
// import { useToast } from '../../common/toast/ToastContext'
// import NewCustomerModal from '../../common/NewCustomerModal'
// import { useSpinner } from '../../common/spinner/SpinnerProvider'
// let debounceTimer;
// const Invoice = () => {
//   const [validated, setValidated] = useState(false)
//   const [errorMessage, setErrorMessage] = useState()
//   const [products, setProducts] = useState()
//   const [allProducts, setAllProducts] = useState()
//   const [customerHistory, setCustomerHistory] = useState()
//   const [showCustomerModal, setShowCustomerModal] = useState(false)
//   const navigate = useNavigate();
//   const location = useLocation();

//   const queryParams = new URLSearchParams(location.search);
//   const id = queryParams.get('id');

//   const { showSpinner, hideSpinner } = useSpinner();
//   const timeNow = ()=> `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
//   const [state, setState] = useState({
//     customer_id: 0,
//     lat:'',
//     long:'',
//     payLater: false,
//     isSettled: false,
//     invoiceDate: new Date().toISOString().split('T')[0],
//     deliveryTime: timeNow(),
//     deliveryDate: new Date().toISOString().split('T')[0],
//     invoiceType: 1,
//     items: [
//       {
//         product_id: undefined,
//         product_sizes_id: 0,
//         product_name: '',
//         product_unit: '',
//         product_local_name: '',
//         size_name: '',
//         size_local_name: '',
//         oPrice: 0,
//         bPrice: 0,
//         dPrice: 0,
//         dQty: 0,
//         eQty: 0,
//         qty: 0,
//         total_price: 0,
//         returnable: 0,
//       },
//     ],
//     orderStatus: 1,
//     totalAmount: 0,
//     discount: 0,
//     balanceAmount: 0,
//     paidAmount: 0,
//     finalAmount: 0,
//     paymentType: 1,
//   })
//   const [showAlert, setShowAlert] = useState(false);
//   const [message, setMessage] = useState('');
//   async function getProductFromParam(){
//     try{
//       const data=await getAPICall(`/api/productSizes/${id}`);
//       setState(prev => ({
//         ...prev,
//         items: [
//           {
//             product_id: data.product_id.toString(),
//             product_sizes_id: data.id,
//             product_name: data.name, // you can populate this if available in response
//             name: data.name,
//             product_name: data.name,
//             product_local_name: data.localName,
//             localName:data.localName,
//             size_name: data.name,
//             size_local_name: data.localName,
//             oPrice: data.oPrice,
//             bPrice: data.bPrice,
//             dPrice: data.dPrice,
//             id:'0',
//             dQty: 0,
//             eQty: 0,
//             qty: data.qty,
//             total_price: 0,
//             returnable: data.returnable,
//             unit:data.unit
//           },
//         ]
//       }));
//     }
//     catch(e){
//       console.alert(e)
//     }
//   }

//   // useEffect(()=>{
//   //   if(id){
//   //     getProductFromParam();
//   //   }
//   // },[id]);

//   const { showToast } = useToast();
//   const [customerName, setCustomerName] = useState({});
//   const [suggestions, setSuggestions] = useState([]);
//   const debounce = (func, delay) => {
//       return function(...args) {
//           clearTimeout(debounceTimer);
//           debounceTimer = setTimeout(() => {
//               func.apply(this, args);
//           }, delay);
//       };
//   };

//   const searchCustomer = async (value) => {
//     try {
//       const customers = await getAPICall('/api/searchCustomer?searchQuery=' + value);
//       if (customers?.length) {
//         setSuggestions(customers);
//       } else {
//         setSuggestions([]);
//       }
//     } catch (error) {
//       showToast('danger', 'Error occured ' + error);
//     }
//   };

//   // Wrap the searchCustomer function with debounce
//   const debouncedSearchCustomer = debounce(searchCustomer, 750);

//   const handleNameChange = (event) => {
//     const value = event.target.value;
//     setCustomerName({name : value});
//     // Filter suggestions based on input
//     if (value) {
//       debouncedSearchCustomer(value)
//     } else {
//       setSuggestions([]);
//     }
//   };

//   const handleSuggestionClick = (suggestion) => {
//     setCustomerName(suggestion);
//     setState((pre)=>({...pre, customer_id: suggestion.id}))
//     const updatedProducts = discountedPrices([...allProducts], suggestion.discount)
//     setAllProducts(updatedProducts);
//     calculateTotal(updatedProducts);
//     setSuggestions([]);
//     getCustomerHistory(suggestion.id);
//   };

//   const onCustomerAdded = (customer) => {
//     handleSuggestionClick(customer);
//     setShowCustomerModal(false);
//   }

//   const getDiscountedPrice = (p, discount) =>{
//     const value = p.sizes[0]?.oPrice ?? 0;
//     const price = value - (value * (discount || (customerName.discount ?? 0)) /100);
//     return Math.round(price);
//   }

//   const discountedPrices = (products, discount) =>{
//     products.forEach(p=>{
//       if(p.sizes.length>0){
//         p.sizes[0].dPrice = getDiscountedPrice(p, discount)
//       }

//     })
//     return products;
//   }

//   const getCustomerHistory = async (customer_id)=>{
//     try {
//       //customerHistory
//       const response = await getAPICall('/api/customerHistory?id=' + customer_id);
//       if (response) {
//         setCustomerHistory(response);
//       }
//     } catch (error) {
//       showToast('danger', 'Error occured ' + error);
//     }
//   }

//   const fetchProduct = async () => {
//     showSpinner();
//     const response = await getAPICall('/api/product')
//     hideSpinner();
//     setAllProducts(discountedPrices([...response.filter((p) => p.show == 1 )]));
//     const options = ['Select Product']
//     options.push(
//       ...response
//         .filter((p) => p.show == 1 )
//         .map((p) => {
//           return {
//             label: p.sizes[0].name,
//             value: p.sizes[0].id,
//             disabled: p.sizes[0].show === 0,
//           }
//         }),
//     )
//     setProducts(options)
//     //Default selected product

//     let data = response.filter((p) => p.show == 1 && p.sizes[0].id == id)[0].sizes[0];
//     // alert(JSON.stringify(data));
//     setState(prev => ({
//       ...prev,
//       items: [
//         {
//           product_id: data.product_id.toString(),
//           product_sizes_id: data.id,
//           product_name: data.name, // you can populate this if available in response
//           name: data.name,
//           product_name: data.name,
//           product_local_name: data.localName,
//           localName:data.localName,
//           size_name: data.name,
//           size_local_name: data.localName,
//           oPrice: data.oPrice,
//           bPrice: data.bPrice,
//           dPrice: data.dPrice,
//           id:'0',
//           dQty: 0,
//           eQty: 0,
//           qty: data.qty,
//           total_price: 0,
//           returnable: data.returnable,
//           unit:data.unit
//         },
//       ]
//     }));
//   }

//   const handleAddProductRow = () => {
//     setState((prev) => {
//       const old = { ...prev }
//       old.items.push({
//         product_id: undefined,
//         product_sizes_id: 0,
//         product_name: '',
//         product_unit: '',
//         product_local_name: '',
//         size_name: '',
//         size_local_name: '',
//         oPrice: 0,
//         dPrice: 0,
//         bPrice: 0,
//         qty: 0,
//         dQty: 0,
//         eQty: 0,
//         total_price: 0,
//         returnable: 0,
//       })
//       return { ...old }
//     })
//   }

//   const calculateTotal = (items) => {
//     let total = 0
//     items.forEach((item) => {
//       total += item.total_price
//     })
//     return total
//   }

//   const handleRemoveProductRow = (index) => {
//     setState((prev) => {
//       const old = { ...prev }
//       old.items.splice(index, 1)
//       return { ...old }
//     })
//   }

//   useEffect(() => {
//     fetchProduct()
//   }, [])

//   const calculateFinalAmount = (old) => {
//     old.finalAmount = old.totalAmount - ((old.totalAmount * old.discount) / 100 || 0)
//     old.balanceAmount = 0
//     old.paidAmount = old.finalAmount
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     if (name === 'discount') {
//       setState((prev) => {
//         const old = { ...prev }
//         old.discount = value
//         calculateFinalAmount(old)
//         return { ...old }
//       })
//     } else if (name === 'paidAmount') {
//       setState((prev) => {
//         const old = { ...prev }
//         old.paidAmount = value
//         old.balanceAmount = old.finalAmount - old.paidAmount
//         return { ...old }
//       })
//     } else {
//       setState({ ...state, [name]: value })
//     }
//   }

//   const handleProductChange = (e, index) => {
//     const { value } = e.target
//     const p = allProducts.find((p) => p.id == value)
//     if (p && p.sizes[0]) {
//       setState((prev) => {
//         const old = { ...prev }
//         old.items[index].product_id = value
//         old.items[index].id = value
//         old.items[index].product_sizes_id = p.sizes[0].id
//         old.items[index].name = p.sizes[0].name
//         old.items[index].localName = p.sizes[0].localName
//         old.items[index].unit = p.unit
//         old.items[index].product_name = p.name
//         old.items[index].size_name = p.sizes[0].name
//         old.items[index].size_local_name = p.sizes[0].localName
//         old.items[index].product_local_name = p.localName
//         old.items[index].oPrice = p.sizes[0].oPrice
//         old.items[index].dQty = 0
//         old.items[index].eQty = 0
//         old.items[index].dPrice = p.sizes[0].dPrice
//         old.items[index].bPrice = p.sizes[0].bPrice
//         old.items[index].returnable = p.sizes[0].returnable
//         old.items[index].total_price = p.sizes[0].dPrice * old.items[index].dQty
//         old.totalAmount = calculateTotal(old.items)
//         calculateFinalAmount(old)
//         return { ...old }
//       })
//     }
//   }

//   const handleQtyChange = (e, index) => {
//     const { value } = e.target
//     setState((prev) => {
//       const old = { ...prev }
//       old.items[index].dQty = value
//       old.items[index].total_price = old.items[index].dPrice * old.items[index].dQty
//       old.totalAmount = calculateTotal(old.items)
//       calculateFinalAmount(old)
//       return { ...old }
//     })
//   }

//   const handleSubmit = async (event) => {
//     try {
//       event.preventDefault()
//       event.stopPropagation()
//       //Valdation
//       let isInvalid = false
//       let clonedState = {
//         ...state,
//         finalAmount: state.totalAmount,
//         deliveryTime: timeNow(),
//       };

//       const eligibleToSubmit =clonedState.balanceAmount>=0 && clonedState.customer_id > 0 && (clonedState.paidAmount > 0 || clonedState.items.length)

//       if (!isInvalid && eligibleToSubmit) {
//         showSpinner();
//         const res = await post('/api/order', { ...clonedState })
//         if (res) {

//           if(res.id){
//             showToast('success','Order is delivered.');
//             navigate('/invoice-details/'+res.id);
//             setShowAlert(false);
//             setMessage('');
//             handleClear()
//           }if(res.error_message){

//             setShowAlert(true);
//             setMessage(res.error_message);
//           }
//         }
//       } else {
//         showToast('warning','Provide valid data.');
//         setState(clonedState)
//       }
//       setValidated(true)
//     } catch (error) {
//       showToast('danger','Error while placing the order.');
//     }
//     hideSpinner();
//   }

//   const handleClear = async () => {
//     setState({
//       customer_id: 0,
//       lat:'',
//       long:'',
//       payLater: false,
//       isSettled: false,
//       invoiceDate: new Date().toISOString().split('T')[0],
//       deliveryTime: timeNow(),
//       deliveryDate: new Date().toISOString().split('T')[0],
//       invoiceType: 1,
//       items: [
//         {
//           product_id: undefined,
//           product_sizes_id: 0,
//           product_name: '',
//           product_unit: '',
//           product_local_name: '',
//           size_name: '',
//           size_local_name: '',
//           oPrice: 0,
//           dPrice: 0,
//           bPrice: 0,
//           qty: 0,
//           total_price: 0,
//         },
//       ],
//       totalAmount: 0,
//       discount: 0,
//       balanceAmount: 0,
//       paidAmount: 0,
//       finalAmount: 0,
//       paymentType: 1,
//     })
//   }

//   return (
//     <CRow>
//        {showAlert && (
//               <CAlert color="danger" onDismiss={() => setShowAlert(false)}>
//                 <div>{message}</div>
//               </CAlert>
//             )}
//        <NewCustomerModal hint={customerName.name} onSuccess={onCustomerAdded} visible={showCustomerModal} setVisible={setShowCustomerModal}/>
//       <CCol xs={12}>
//         <CCard className="mb-4">
//           <CCardHeader>
//             <strong>New invoice</strong>
//           </CCardHeader>
//           <CCardBody>
//             <CForm noValidate validated={validated} onSubmit={handleSubmit}>
//             <div className="row mb-2">
//               {/* Modified customer search section for responsive design */}
//               <div className="col-md-8 col-12 mb-2">
//                 <CFormLabel htmlFor="invoiceDate">Search customer</CFormLabel>
//                 <div className="d-flex position-relative">
//                   <CFormInput
//                     type="text"
//                     id="pname"
//                     placeholder="Customer Name"
//                     name="customerName"
//                     value={customerName.name}
//                     onChange={handleNameChange}
//                     autoComplete='off'
//                     required
//                     className="w-100"
//                   />
//                   {!customerName.id && customerName.name?.length > 0 && (
//                     <CBadge
//                       role="button"
//                       color="danger"
//                       onClick={() => setShowCustomerModal(true)}
//                       className="position-absolute"
//                       style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
//                     >
//                       + New
//                     </CBadge>
//                   )}
//                 </div>
//                 {customerName.name?.length > 0 && (
//                   <ul className="suggestions-list" style={{ zIndex: 1000, position: 'absolute', width: 'calc(100% - 30px)' }}>
//                     {suggestions.map((suggestion, index) => (
//                       <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
//                         {suggestion.name + ' ('+suggestion.mobile+')'}
//                       </li>
//                     ))}
//                     {!customerName.id && <li>
//                       <CBadge
//                         role="button"
//                         color="danger"
//                         onClick={() => setShowCustomerModal(true)}
//                       >
//                         New Customer
//                       </CBadge>
//                     </li>}
//                   </ul>
//                 )}
//               </div>
//               <div className="col-md-4 col-12 mb-2">
//                 <div className="mb-3">
//                   <CFormLabel htmlFor="invoiceDate">Invoice Date</CFormLabel>
//                   <CFormInput
//                     type="date"
//                     id="invoiceDate"
//                     placeholder="Pune"
//                     name="invoiceDate"
//                     value={state.invoiceDate}
//                     onChange={handleChange}
//                     required
//                     feedbackInvalid="Please select date."
//                   />
//                 </div>
//               </div>
//             </div>
//               {/* Products table - responsive headers */}
//               <div className="row d-none d-md-flex">
//                 <div className="col-4">
//                   <div className="mb-1">
//                     <b>Product</b>
//                   </div>
//                 </div>
//                 <div className="col-2">
//                   <div className="mb-1">
//                     <b>Quantity</b>
//                   </div>
//                 </div>
//                 <div className="col-2">
//                   <div className="mb-1">
//                     <b>Price</b>
//                   </div>
//                 </div>
//                 <div className="col-2">
//                   <div className="mb-1">
//                     <b>Total (RS)</b>
//                   </div>
//                 </div>
//                 <div className="col-2">
//                   <div className="mb-1">
//                     <b>Action</b>
//                   </div>
//                 </div>
//               </div>

//               {/* Product items - made responsive */}
//               {state.items?.map((oitem, index) => (
//                 <div key={index} className="row mb-3 border-bottom pb-2">
//                   <div className="col-md-4 col-12 mb-2">
//                     <div className="d-md-none mb-1"><b>Product</b></div>
//                     <CFormSelect
//                       aria-label="Select Product"
//                       value={oitem.product_sizes_id}
//                       options={products}
//                       onChange={() => handleProductChange(event, index)}
//                       invalid={oitem.notSelected == true}
//                       required
//                       feedbackInvalid="Select product."
//                     />
//                   </div>

//                   <div className="col-md-2 col-6 mb-2">
//                     <div className="d-md-none mb-1"><b>Quantity</b></div>
//                     <CFormInput
//                       type="number"
//                       value={oitem.dQty > 0 ? oitem.dQty : ''}
//                       placeholder={`Stock: ${oitem.qty}`}
//                       invalid={oitem.invalidQty === true}
//                       required
//                       feedbackInvalid={`Max ${oitem.qty}`}
//                       onChange={(event) => handleQtyChange(event, index)}
//                     />
//                   </div>
//                   <div className="col-md-2 col-6 mb-2">
//                     <div className="d-md-none mb-1"><b>Price</b></div>
//                     <p className="mt-md-2 mb-0">{oitem.dPrice + (oitem.unit ? ' / ' + oitem.unit : '')}</p>
//                   </div>
//                   <div className="col-md-2 col-6 mb-2">
//                     <div className="d-md-none mb-1"><b>Total (RS)</b></div>
//                     <p className="mt-md-2 mb-0">{oitem.total_price}</p>
//                   </div>
//                   <div className="col-md-2 col-6 mb-2 text-md-start text-end">
//                     <div className="d-md-none mb-1"><b>Action</b></div>
//                     <div>
//                       {state.items.length > 1 && (
//                         <CButton color="" onClick={() => handleRemoveProductRow(index)}>
//                           <CIcon icon={cilDelete} size="xl" style={{ '--ci-primary-color': 'red' }} />
//                         </CButton>
//                       )}
//                       {index === state.items.length - 1 && (
//                         <CButton onClick={handleAddProductRow} color="">
//                           <CIcon icon={cilPlus} size="xl" style={{ '--ci-primary-color': 'green' }} />
//                         </CButton>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {/* Payment info - made responsive */}
//               <div className="row mt-4">
//                 <div className="col-md-4 col-12 mb-3">
//                   <div className="mb-3">
//                     <CFormLabel htmlFor="balanceAmount">Balance Amount (Rs)</CFormLabel>
//                     <CFormInput
//                       type="number"
//                       id="balanceAmount"
//                       placeholder=""
//                       readOnly
//                       name="balanceAmount"
//                       value={state.balanceAmount}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-4 col-12 mb-3">
//                   <div className="mb-3">
//                     <CFormLabel htmlFor="paidAmount">Paid Amount (Rs)</CFormLabel>
//                     <CFormInput
//                       type="number"
//                       id="paidAmount"
//                       placeholder=""
//                       name="paidAmount"
//                       value={state.paidAmount}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-4 col-12 mb-3">
//                   <div className="mb-3">
//                     <CFormLabel htmlFor="finalAmount">Total Amount (Rs)</CFormLabel>
//                     <CFormInput
//                       type="number"
//                       id="finalAmount"
//                       placeholder=""
//                       name="finalAmount"
//                       readOnly
//                       value={state.finalAmount}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 {errorMessage && (
//                   <CRow>
//                     <CAlert color="danger">{errorMessage}</CAlert>
//                   </CRow>
//                 )}
//               </div>
//               <div className="mb-3 mt-3">
//                 <CButton color="success" type="submit" className="w-100 mb-2 mb-md-0 w-md-auto">
//                   Submit
//                 </CButton>
//                 &nbsp;
//                 <CButton color="secondary" onClick={handleClear} className="w-100 w-md-auto">
//                   Clear
//                 </CButton>
//               </div>
//             </CForm>
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   )
// }

// export default Invoice
