import './Invoice.css'

import React, { useEffect, useState } from 'react'
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
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { cilMinus, cilPlus, cilSearch } from '@coreui/icons';
import { getAPICall, post } from '../../../util/api'
import NewCustomerModal from '../../common/NewCustomerModal'
import { useToast } from '../../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'
import { useSpinner } from '../../common/spinner/SpinnerProvider'

let debounceTimer;
const Delivery = () => {
  const [validated, setValidated] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerHistory, setCustomerHistory] = useState()
  const timeNow = () => `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
  const [formData, setFormData] = useState({
     jar: 1,
     emptyJar: 0,
     cashCollected: 0,
     packetsPerCrate: 0,  // Default value for packets per crate
   });
  
   const [rates, setRates] = useState({
       jar: 30
   });

   console.log(formData);
   
   
  const [totalPackets, setTotalPackets] = useState(12); // Initial value based on default values
   
  const [state, setState] = useState({
    customer_id: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    lat: null,
    long: null,
    totalAmount: 30, // Initial amount based on 1 jar
    paidAmount: 0
  });
   
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSpinner, hideSpinner } = useSpinner();

  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [quantity, setQuantity] = useState(null);




  useEffect(() => {
    const postInitialData = async () => {
      try {
        const sampleData = {
          message: "Delivery page loaded",
          timestamp: new Date().toISOString()
        };
        await post('/delivery-items', sampleData);
        console.log("Initial data posted successfully");
      } catch (error) {
        console.error("Error posting initial data:", error);
      }
    };
  
    postInitialData();
  }, []);
  



  useEffect(()=>{fetchRates();  
  },[]);

  const fetchRates = async() => {
    try {
      const response = await getAPICall('/api/jarTracker');
      if (response && response.quantity) {
        setQuantity(response.quantity);
        setRates(prev => ({...prev, jar: response.quantity}));
        // Update initial total amount
        setState(prev => ({...prev, totalAmount: response.quantity * formData.jar}));
      }
    } catch (error) {
      showToast('danger', t("MSG.error_fetching_rates"));
    }
  }

  const debounce = (func, delay) => {
      return function(...args) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
              func.apply(this, args);
          }, delay);
      };
  };

  const handleIncrement = (field) => {
    const newValue = formData[field] + 1;
    setFormData({
      ...formData,
      [field]: newValue
    });
    updateTotals(field, newValue);
  };

  const handleDecrement = (field) => {
    if (formData[field] > 0) {
      const newValue = formData[field] - 1;
      setFormData({
        ...formData,
        [field]: newValue
      });
      updateTotals(field, newValue);
    }
  };
  
  const handleClear = () => {
    setFormData({
      jar: 0,
      emptyJar: 0,
      cashCollected: 0,
      packetsPerCrate: 0,
    });
    
    setCustomerName({});
    setState({
      customer_id: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
      lat: null,
      long: null,
      totalAmount: 0,
      paidAmount: 0
    });
    
    setTotalPackets(0);
    setSuggestions([]);
    setValidated(false);
  };

  const updateTotals = (field, value) => {
    const updatedFormData = {
      ...formData,
      [field]: value
    };
    
    // Calculate the total amount
    const jarTotal = rates.jar * updatedFormData.jar;
    const total = jarTotal;
    
    // Calculate total packets based on jars and packets per crate
    const newTotalPackets = field === 'jar' || field === 'packetsPerCrate' ? 
      updatedFormData.jar * updatedFormData.packetsPerCrate : 
      formData.jar * updatedFormData.packetsPerCrate;
    
    setTotalPackets(newTotalPackets);
    
    setState(prev => ({
      ...prev,
      totalAmount: total,
      paidAmount: updatedFormData.cashCollected || 0
    }));
  };

  // Handler for packets per crate input change
  const handlePacketsPerCrateChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData({...formData, packetsPerCrate: value});
    updateTotals('packetsPerCrate', value);
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
      showToast('danger', 'Error occurred ' + error);
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
    setSuggestions([]);
    getCustomerHistory(suggestion.id);
  };

  const onCustomerAdded = (customer) => {
    handleSuggestionClick(customer);
    setShowCustomerModal(false);
  }

  const getCustomerHistory = async (customer_id) => {
    try {
      const response = await getAPICall('/api/customerHistory?id=' + customer_id);
      if (response) {
        setCustomerHistory(response);
       setFormData({...formData,
        "packetsPerCrate":response.default_qty}) 
      }
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  }

  const handleRateChange = (field, value) => {
    const newRate = parseFloat(value) || 0;
    setRates({
      ...rates,
      [field]: newRate
    });
    
    // Recalculate totals
    const jarTotal = field === 'jar' ? newRate * formData.jar : rates.jar * formData.jar;
    
    setState(prev => ({
      ...prev,
      totalAmount: jarTotal
    }));
  };



  useEffect(() => {
    // Try to get user's location for delivery tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState(prev => ({
            ...prev,
            lat: position.coords.latitude,
            long: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [])

  // const handleSubmit = async (event) => {
  //   try {
  //     event.preventDefault()
  //     event.stopPropagation()
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);

  //     //Validation
  //     let isInvalid = !state.customer_id;
      
  //     let clonedState = { 
  //       ...state,
  //       deliveryDate: state.invoiceDate,
  //       finalAmount: state.totalAmount, 
  //       deliveryTime: timeNow(),
  //       items: [],
  //       returnItems: []
  //     };


  // const handleSubmit = async (event) => {
  //   try {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);

  //     let isInvalid = !state.customer_id;

  //     let clonedState = { 
  //       ...state,
        
  //       deliveryDate: state.invoiceDate,
  //       finalAmount: state.totalAmount, 
  //       deliveryTime: timeNow(),
  //       items: [],
  //       returnItems: []
  //     };

  //     if (formData.jar > 0) {
  //       clonedState.items.push({
  //         product_name: "Water Jar",
  //         product_local_name: lng === 'en' ? "Water Jar" : "पानी का जार",
  //         quantity: formData.jar,
  //         price: rates.jar,
  //         total_price: rates.jar * formData.jar
  //       });
  //     }

  //     if (formData.emptyJar > 0) {
  //       clonedState.returnItems.push({
  //         product_name: "Empty Jar",
  //         product_local_name: lng === 'en' ? "Empty Jar" : "खाली जार",
  //         quantity: formData.emptyJar
  //       });
  //     }

  //     const eligibleToSubmit = clonedState.customer_id > 0 && 
  //       (clonedState.paidAmount > 0 || clonedState.items.length > 0 || clonedState.returnItems.length > 0);

  //     if (!isInvalid && eligibleToSubmit) {
  //       showSpinner();
  //       const res = await post('/api/jar-trackers', { ...clonedState })
  //       if (res && res.id) {
  //         handleClear();
  //         showToast('success', t("MSG.order_is_delivered_msg"));
  //       } else {
  //         showToast('danger', t("MSG.error_occured_msg"));
  //       }
  //     } else {
  //       showToast('warning', t("MSG.provide_valid_data_msg"));
  //       setState(clonedState);
  //       setValidated(true);
  //     }
  //   } catch (error) {
  //     showToast('danger', t("MSG.error_placing_the_order_msg"));
  //   }
  //   hideSpinner();
  //   setIsSubmitting(false);
  // }
  // const handleSubmit = async (event) => {
  //   try {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     if (isSubmitting) return;
  //     setIsSubmitting(true);
  
  //     let isInvalid = !state.customer_id;
  
  //     let clonedState = { 
  //       ...state,
  //       deliveryDate: state.invoiceDate,
  //       finalAmount: state.totalAmount, 
  //       deliveryTime: timeNow(),
  //       crates_quantity: formData.crates_quantity,  // Ensure crates_quantity is passed from formData
  //       packets: formData.packets,  // Ensure packets is passed from formData
  //       items: [],
  //       returnItems: []
  //     };
  
  //     // Water Jar Item
  //     if (formData.jar > 0) {
  //       clonedState.items.push({
  //         product_name: "Water Jar",
  //         product_local_name: lng === 'en' ? "Water Jar" : "पानी का जार",
  //         crates_quantity: formData.crates_quantity,  // Ensure this is passed correctly
  //         packets: formData.packets,  // Ensure this is passed correctly
  //         quantity: formData.jar,
  //         price: rates.jar,
  //         total_price: rates.jar * formData.jar
  //       });
  //     }
  
  //     // Empty Jar Item
  //     if (formData.emptyJar > 0) {
  //       clonedState.returnItems.push({
  //         product_name: "Empty Jar",
  //         product_local_name: lng === 'en' ? "Empty Jar" : "खाली जार",
  //         crates_quantity: formData.crates_quantity,  // Ensure this is passed correctly
  //         packets: formData.packets,  // Ensure this is passed correctly
  //         quantity: formData.emptyJar
  //       });
  //     }
  
  //     // Log the clonedState object to check the structure before sending it to the backend
  //     console.log('log6:', clonedState);  // This is your requested log
  
  //     // Validate if eligible to submit
  //     const eligibleToSubmit = clonedState.customer_id > 0 && 
  //       (clonedState.paidAmount > 0 || clonedState.items.length > 0 || clonedState.returnItems.length > 0);
  
  //     if (!isInvalid && eligibleToSubmit) {
  //       showSpinner();
  //       const res = await post('/api/jar-trackers', { ...clonedState });
  //       if (res && res.id) {
  //         handleClear();
  //         showToast('success', t("MSG.order_is_delivered_msg"));
  //       } else {
  //         showToast('danger', t("MSG.error_occured_msg"));
  //       }
  //     } else {
  //       showToast('warning', t("MSG.provide_valid_data_msg"));
  //       setState(clonedState);
  //       setValidated(true);
  //     }
  //   } catch (error) {
  //     showToast('danger', t("MSG.error_placing_the_order_msg"));
  //   }
  //   hideSpinner();
  //   setIsSubmitting(false);
  // };
  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      event.stopPropagation();
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      let isInvalid = !state.customer_id;
      
      // Make sure we're collecting the correct values from formData
      let clonedState = { 
        ...state,
        deliveryDate: state.invoiceDate,
        finalAmount: state.totalAmount, 
        deliveryTime: timeNow(),
        jar: formData.jar,                       // Number of jars/crates
        packetsPerCrate: formData.packetsPerCrate, // Packets per crate setting
        totalPackets: totalPackets,              // Total packets calculated value
        emptyJar: formData.emptyJar,             // Empty jars/crates collected
        items: [],
        returnItems: []
      };

      let data={
        customer_id: state.customer_id,
        product_sizes_id:1,
        product_name: "Milk",
        product_local_name: "दूध",
        crates_quantity: formData.jar,
        packets:formData.packetsPerCrate,
      }

      // Water Jar Item
      if (formData.jar > 0) {
        clonedState.items.push({
          product_name: "Water Jar",
          product_local_name: lng === 'en' ? "Water Jar" : "पानी का जार",
          quantity: formData.jar,
          packetsPerCrate: formData.packetsPerCrate,
          totalPackets: totalPackets,
          price: rates.jar,
          total_price: rates.jar * formData.jar
        });
      }
      
      // Empty Jar Item
      if (formData.emptyJar > 0) {
        clonedState.returnItems.push({
          product_name: "Empty Jar",
          product_local_name: lng === 'en' ? "Empty Jar" : "खाली जार",
          quantity: formData.emptyJar
        });
      }
      
      // Log the clonedState object to check the structure before sending it to the backend
      console.log('log6:', clonedState);  // This is your requested log
      
      // Validate if eligible to submit
      const eligibleToSubmit = data.customer_id > 0 && formData.packetsPerCrate >0 && formData.jar>0;
      
      if (!isInvalid && eligibleToSubmit) {
        showSpinner();
        const res = await post('/api/jar-trackers', data);
        if (res && res.id) {
          handleClear();
          showToast('success', t("MSG.order_is_delivered_msg"));
        } else {
          showToast('danger', t("MSG.error_occured_msg"));
        }
      } else {
        showToast('warning', t("MSG.provide_valid_data_msg"));
        setState(clonedState);
        setValidated(true);
      }
    } catch (error) {
      showToast('danger', t("MSG.error_placing_the_order_msg"));
    }
    hideSpinner();
    setIsSubmitting(false);
  };
  
  
  

  return (
    <CRow>
      <NewCustomerModal 
        hint={customerName.name} 
        onSuccess={onCustomerAdded} 
        visible={showCustomerModal} 
        setVisible={setShowCustomerModal}
      />
      
      <CCol xs={0}>
        <CCard className="mb-4">
          <CCardHeader className="bg-primary text-white">
            <strong>{t("LABELS.delivery_record") || "Delivery"}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              {/* Customer Search */}
              <CRow className="mb-3">
                <CCol xs={9} style={{ position: 'relative' }}>
                  <CInputGroup>
                    <CFormInput
                      type="text"
                      placeholder={t('LABELS.customer_name') || "Customer Name"}
                      name="customerName"
                      value={customerName.name || ''}
                      onChange={handleNameChange}
                      feedbackInvalid={t('MSG.please_provide_name') || "Please provide a name"}
                      autoComplete='off'
                      required
                    />
                    <CInputGroupText>
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                  </CInputGroup>
                  
                  {customerName.name?.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion.name + ' ('+suggestion.mobile+')'}
                        </li>
                      ))}
                    </ul>
                  )}
                </CCol>
                <CCol xs={3}>
                  <CBadge
                    role="button"
                    color="danger"
                    style={{
                      padding: '10px 12px',
                      float: 'right'
                    }}
                    onClick={() => setShowCustomerModal(true)}
                  >
                    {t("LABELS.new") || "New"}
                  </CBadge>
                </CCol>
              </CRow>
              
              {customerName.id && (
                <CRow className="mb-3">
                  <CCol sm={12}>
                    <CAlert color="success">
                      <p>
                        <strong>{t("LABELS.name") || "Name"}:</strong> {customerName.name} ({customerName.mobile}) <br/>
                        {customerName.address && <><strong>{t("LABELS.address_label") || "Address"}: </strong> {customerName.address}</>}
                        {customerHistory && <>
                        {
                          customerHistory.pendingPayment > 0 && <><br/>{t("LABELS.credit") || "Credit"} <strong className="text-danger">{customerHistory.pendingPayment}</strong> {t("LABELS.rs") || "Rs"}.</>
                        }
                        {
                          customerHistory.pendingPayment < 0 && <><br/>{t("LABELS.advance") || "Advance"} <strong className="text-success">{customerHistory.pendingPayment * -1}</strong> {t("LABELS.rs") || "Rs"}.</>
                        }
                        {
                          customerHistory.returnEmptyProducts?.filter(p=>p.quantity>0).map(p=>(
                            <React.Fragment key={p.id}>
                              <br/>{t("LABELS.collect") || "Collect"} <strong className="text-danger"> {p.quantity} </strong> {t("LABELS.empty") || "Empty"}  <strong className="text-danger"> {lng === 'en' ? p.product_name : p.product_local_name} </strong>
                            </React.Fragment>
                          ))
                        }
                        </>}
                      </p>
                    </CAlert>
                  </CCol>
                </CRow>
              )}
              
              <div style={styles.formSection}>
                
                {/* Column Headers */}
                <CRow className="mb-2">
                  <CCol xs={4}>
                    <div >{t("") || "Crates"}</div>
                  </CCol>
                  <CCol xs={4}>
                    <div >{t("") || "Packets/Crates"}</div>
                  </CCol>
                  <CCol xs={4}>
                    <div>{t("") || "Total Packets"}</div>
                  </CCol>
                </CRow>
                
                {/* Main Content Row */}
                <CRow className="mb-3 align-items-center">
                  <CCol xs={4}>
                    <CInputGroup size="sm">
                      <CButton
                        color="danger"
                        onClick={() => handleDecrement('jar')}
                        style={styles.quantityButton}
                        disabled={formData.jar <= 0}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.jar}
                        min={0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData({...formData, jar: value});
                          updateTotals('jar', value);
                        }}
                        style={{ maxWidth: '120px' }}
                      />
                      <CButton
                        color="success"
                        onClick={() => handleIncrement('jar')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </CCol>
                  <CCol xs={4}>
                    <CFormInput
                      type="number"
                      value={formData.packetsPerCrate}
                      onChange={handlePacketsPerCrateChange}
                      size="sm"
                      className="text-end"
                    />
                  </CCol>
                  <CCol xs={4}>
                    <CFormInput
                      type="number"
                      value={totalPackets}
                      disabled
                      size="sm"
                      className="text-end"
                      style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                    />
                  </CCol>
                </CRow>
                
                {/* Empty Jar Row */}
                <CRow className="mb-4 mt-4">
                  <CCol xs={12}>
                    <div >{t("Empty Crates ") || "Empty Crates Collection"}</div>
                  </CCol>
                  <CCol xs={5} className="mt-2">
                    <CInputGroup size="sm">
                      <CButton
                        color="danger"
                        onClick={() => handleDecrement('emptyJar')}
                        style={styles.quantityButton}
                        disabled={formData.emptyJar <= 0}
                      >
                        <CIcon icon={cilMinus} />
                      </CButton>
                      <CFormInput
                        type="number"
                        className="text-center mx-1"
                        value={formData.emptyJar}
                        min={0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setFormData({...formData, emptyJar: value});
                        }}
                        style={{ maxWidth: '120px' }}
                        placeholder="Enter quantity"
                      />
                      <CButton
                        color="success"
                        onClick={() => handleIncrement('emptyJar')}
                        style={styles.quantityButton}
                      >
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </CInputGroup>
                  </CCol>
                </CRow>
              </div>
              
              {/* Action Buttons */}
              <div className="d-grid gap-2 d-md-flex">
              <CButton type="submit" color="success" className="px-4 py-2">
               {t("LABELS.submit") || "Submit"}
                </CButton>

                <CButton type="button" color="danger" className="px-4 py-2" onClick={handleClear}>
                  {t("LABELS.clear") || "Clear"}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

const styles = {
  quantityButton: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: '4px'
  },
  sectionHeading: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#3c4b64',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #ebedef'
  },
  formSection: {
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  columnHeader: {
    fontWeight: 'bold',
    color: '#5c6873',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  emptyJarLabel: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#5c6873',
    borderBottom: '1px dashed #e4e7ea',
    paddingBottom: '8px',
    marginBottom: '8px'
  },
  totalContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '6px',
    borderLeft: '4px solid #321fdb'
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#3c4b64'
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: '#321fdb'
  }
};

export default Delivery