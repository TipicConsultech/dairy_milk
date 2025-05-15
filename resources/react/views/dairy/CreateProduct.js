import React, { useEffect, useState, useRef } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CCard,
  CCardBody,
  CButton,
  CCardHeader,
  CAlert,
} from '@coreui/react'
import { getAPICall, post } from '../../util/api'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilChevronBottom, cilX } from '@coreui/icons'
import { useTranslation } from 'react-i18next'

const MilkForm = () => {
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
  
    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };
  
  const [milkType, setMilkType] = useState('')
  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [tankData, setTankData] = useState([])
  const [error, setError] = useState('')

  const [ingredientOptions, setIngredientOptions] = useState([])
  const [newIngredient, setNewIngredient] = useState({id:'', name: '', quantity: '', available_qty: '', unit: '' })
  const [newProducts, setNewProducts] = useState({ name: '', unit: '' })

  const [ingredients, setIngredients] = useState([])

  const [rawMaterialData, setRawMaterialData] = useState([])     // Full objects from API

  const [rawMaterialavailableQty, setRawMaterialavailableQty] = useState(null)
  const [productsUnits, setProductsUnits] = useState(null)

  const [ingError, setIngError] = useState('')

  const [prductsData, setPrductsData] = useState([])
  const [productUnit, setProductUnit] = useState([])
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const productsDropdownRef = useRef(null);

  // Add this ref for ingredients dropdown
  const ingredientsDropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [productOptions, setProductOptions] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:'', quantity:'', unit:'',liters:null });
  const [products, setProducts] = useState([]);
  const [prodError, setProdError] = useState('');
  const [productAvailQty, setProductAvailQty] = useState(null);

  const [createdSummary, setCreatedSummary] = useState(null);
  const[selectedTank,setSelectedTank]= useState(null);
  const[productCalculationData,setProductCalculationData]= useState(null);


  console.log(selectedTank);
  

  useEffect(() => {
    function handleClickOutside(event) {
      // Handle products dropdown
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }

      // Handle ingredients dropdown
      if (ingredientsDropdownRef.current && !ingredientsDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTankData()
    fetchRawMaterials()
    fetchProducts()
  }, [])
  useEffect(() => {
    if(newProduct?.id){
      getProductCalculationData(newProduct?.id);
    }
  }, [newProduct.id])
  
  const fetchTankData = async () => {
    try {
      const res = await getAPICall('/api/milk-tanks-byname/names')
      setTankData(res.quantity)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const res = await getAPICall('/api/getRawMaterialsByParam/0')
      setRawMaterialData(res.quantity)
      setIngredientOptions(res.quantity.map(item => item.name))
    } catch (err) {
      console.error('Error fetching raw materials:', err)
    }
  }

  const handleMilkTypeChange = (e) => {
    const selected = e.target.value
    setMilkType(selected)
    setMilkAmount('')
    setError('')
    const selectedTank = tankData.find((t) => t.name === selected)
    if (selectedTank) {
      setAvailableQty(selectedTank.available_qty)
      setSelectedTank(selectedTank);
    } else {
      setAvailableQty(null);
      setSelectedTank(null);
    }
  }

  const clearMilkType = () => {
    setMilkType('')
    setMilkAmount('')
    setAvailableQty(null)
    setError('')
  }

  const handleMilkAmountChange = (e) => {
    const value = e.target.value
    setMilkAmount(value)

    if (availableQty !== null && parseFloat(value) > availableQty) {
      setError(t('MSG.quantityExceedsAvailableMilk'))
    } else {
      setError('')
    }
  }

  const handleIngredientChange = (e) => {
    const selectedName = e.target.value
    const selectedItem = rawMaterialData.find((item) => item.name === selectedName)

    if (selectedItem) {
      setNewIngredient({
        ...newIngredient,
        id:selectedItem.id,
        name: selectedName,
        available_qty: selectedItem.available_qty,
        unit: selectedItem.unit
      })
      setRawMaterialavailableQty(selectedItem.available_qty)
    } else {
      setNewIngredient({ name: '', quantity: '', available_qty: '', unit: '' })
      setRawMaterialavailableQty(null)
    }

    setIngError('')
  }

  const clearIngredient = () => {
    setNewIngredient({ id: '', name: '', quantity: '', available_qty: '', unit: '' })
    setRawMaterialavailableQty(null)
    setIngError('')
  }

  const handleIngredientQtyChange = (e) => {
    const value = e.target.value
    setNewIngredient({ ...newIngredient, quantity: value })

    if (rawMaterialavailableQty !== null && parseFloat(value) > rawMaterialavailableQty) {
      setIngError(t('MSG.quantityExceedsAvailableStock'))
    } else {
      setIngError('')
    }
  }

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && !ingError) {
      setIngredients([...ingredients, { ...newIngredient }])
      setNewIngredient({ id: '', name: '', quantity: '', available_qty: '', unit: '' })
      setRawMaterialavailableQty(null)
    }
  }

  const removeIngredient = (index) => {
    const updated = [...ingredients]
    updated.splice(index, 1)
    setIngredients(updated)
  }

  // ---------- fetch once ----------
  const fetchProducts = async () => {
    try {
      const res = await getAPICall('/api/getProductsByProductType');

      // convert { id, name, qty } -> { id, name, quantity }
      const normalized = res.products.map(p => ({
        ...p,
        id:p.id,
        quantity: p.qty,           // rename here
        unit:p.unit,
      }));

      setPrductsData(normalized);
      setProductOptions(normalized.map(p => p.name));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // ---------- handlers ----------
  const handleProductSelect = e => {
    const sel = e.target.value;
    const item = prductsData.find(p => p.name === sel);

    if (item) {
      setNewProduct({ id:item.id , name: sel, quantity:'', unit: item.unit || '',liters:null });
      setProductAvailQty(item.quantity);          // use renamed field
    } else {
      setNewProduct({ name:'', quantity:'', unit:'',liters:null });
      setProductAvailQty(null);
    }
    setProdError('');
  };

  const clearProduct = () => {
    setNewProduct({ id: '', name: '', quantity: '', unit: '',liters:null });
    setProductAvailQty(null);
    setProdError('');
  };
  const getProductCalculationData = async (id) =>  {
  const responce= await getAPICall(`/api/factoryProductsCalculation/${id}`);
  if(responce.factory_product_id){
    setProductCalculationData(responce);
  }else if(responce.message==="Factory product not found"){
    setProductCalculationData(null); 
  }
  else{
    setProductCalculationData(null); 
  }
  } 
  const handleProductQty = async (e) =>  {
    const val = e.target.value;
    setNewProduct(p => ({ ...p, quantity: val }));
    if(productCalculationData?.liters && productCalculationData?.divide_by){
    // let milk_in_liter=null;
    // milk_in_liter = (e.target.value * (selectedTank.snf + selectedTank.ts)) / productCalculationData?.divide_by;
    let rawValue = (e.target.value * (selectedTank.snf + selectedTank.ts)) / productCalculationData?.divide_by;
    let milk_in_liter = (rawValue % 1) >= 0.1 ? Math.ceil(rawValue) : Math.floor(rawValue);
      setNewProduct(p => ({ ...p, liters: milk_in_liter }));
      console.log(milk_in_liter);
     }

    if (productAvailQty !== null && parseFloat(val) == productAvailQty) {
      setProdError(t('MSG.quantityExceedsAvailableStock'));
    } else setProdError('');
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.quantity && !prodError) {
      setProducts(prev => [...prev, newProduct]);
      setNewProduct({ id: '', name:'', quantity:'', unit:'',liters:null });
      setProductAvailQty(null);
    }
  };

  const removeProduct = idx => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!milkType  || parseFloat(milkAmount) > availableQty) {
        alert(t('MSG.enterValidQuantity'));
        return;
    }

    const selectedTank = tankData.find(t => t.name === milkType);
    if (!selectedTank) {
        alert(t('MSG.selectedMilkTankNotFound'));
        return;
    }

    // Prepare milk tank data as an object with `id` and `quantity`
    const milkTankData = {
        id: selectedTank.id,
        //quantity: parseFloat(milkAmount), // Assuming you want to update the quantity with the milkAmount
    };

    // Ensure ingredients and products are in the correct format
    const ingredientsData = ingredients.length > 0
  ? ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      quantity: parseFloat(ing.quantity),
    }))
  : [];
    const productsData = products.map(prod => ({
        id: prod.id,
        name: prod.name,
        unit: prod.unit,
        qty: parseFloat(prod.quantity),
    }));

    // Create a summary string for alert
    const createdSummary = productsData
      .map(prod => `${prod.name} ${prod.qty} Kg`)
      .join(', ');

    try {
        // 1️⃣ Call the createProduct API with properly structured data
        await post('/api/createProduct', {
            milkTank: milkTankData, // Send milkTank as an object with id and quantity
            rawMaterials: ingredientsData, // Ensure rawMaterials contains id
            productSizes: productsData, // Format the products as required
        });

        // alert(`Product ${productsData?.prod?.name} created and stocks updated successfully.`);


        const now = new Date();
        const formattedTime = now.toLocaleString(); // gives date + time in readable format

        const summaryText = productsData
          .map(prod => `${prod.name} ${prod.qty} ${prod.unit}`)
          .join(', ');

        setCreatedSummary({
          text: `${summaryText} ${t('MSG.createdSuccessfully')}`,
          time: formattedTime,
        });

        // Reset form
        setMilkAmount('');
        setMilkType('');
        setAvailableQty(null);
        setError('');
        setIngredients([]);
        setProducts([]);
        fetchTankData();
        fetchRawMaterials();
        fetchProducts();
    } catch (err) {
        console.error('Error in submission:', err);
        alert(t('MSG.selectAppropriateProductAndClick'));
    }
  };

  useEffect(() => {
    setCreatedSummary(null); // Clear it on load or refresh
  }, []);

  // Custom dropdown styles
  const dropdownIconStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1
  };

  const clearButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    zIndex: 1
  };

  const inputContainerStyle = {
    position: 'relative'
  };

  return (
    <CCard className="mb-4">

      <CCardHeader style={{ backgroundColor: '#d4edda'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0" >{t('LABELS.create_product')}</h5>
        </div>
      </CCardHeader>

      <CCardBody>
        <CRow className="g-3 align-items-end mb-0">
          <CCol md={3}>
            <CFormLabel><b>&nbsp;&nbsp;{t('LABELS.selectMilkStorage')}</b></CFormLabel>
         
          </CCol>
          <CCol md={4}>
          <div style={inputContainerStyle}>
              <CFormSelect value={milkType} onChange={handleMilkTypeChange} style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}>
                <option value="">{t('LABELS.selectTank')}</option>
                {tankData.map((tank, idx) => (
                  <option key={idx} value={tank.name}>
                    {tank.name}
                  </option>
                ))}
              </CFormSelect>
              {!milkType ? (
                <div style={dropdownIconStyle}>
                  <CIcon icon={cilChevronBottom} size="sm" />
                </div>
              ) : (
                <div style={clearButtonStyle} onClick={clearMilkType}>
                  <CIcon icon={cilX} size="sm" />
                </div>
              )}
            </div>
            </CCol>
          <CCol md={4}>
            {/* <CFormLabel><b>{t('LABELS.enterMilkForProduct')}</b></CFormLabel> */}
            <CFormInput
              type="number"
              value={milkAmount}
              onChange={handleMilkAmountChange}
              placeholder={
                availableQty !== null ? t('LABELS.availableQuantityLtrs', { qty: availableQty }) : t('LABELS.enterMilkForProduct')
              }
              className={error ? 'is-invalid' : ''}
              disabled
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </CCol>

          {/* <CCol md={2}>
            <div><b>{t('LABELS.ltrs')}</b></div>
          </CCol> */}

          <CCol md={2}>
          </CCol>
        </CRow>

        {/* Ingredients */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#E6E6FA'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >{t('LABELS.ingredientsUsed')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={ingredientsDropdownRef} style={inputContainerStyle}>
                  <CFormInput
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient({...newIngredient, name: value});
                      // Keep the dropdown open when typing
                      if (value) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={t('LABELS.searchOrSelectIngredient')}
                   
                  />

                  {!newIngredient.name ? (
                    <div style={dropdownIconStyle}>
                      <CIcon icon={cilChevronBottom} size="sm" />
                    </div>
                  ) : (
                    <div style={clearButtonStyle} onClick={clearIngredient}>
                      <CIcon icon={cilX} size="sm" />
                    </div>
                  )}

                  {isDropdownOpen && (
                    <div
                      className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm z-index-dropdown"
                      style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}
                    >
                      {ingredientOptions
                        .filter(item => item.toLowerCase().includes(newIngredient.name.toLowerCase()))
                        .map((item, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              // Simulate the original handleIngredientChange logic
                              const selectedItem = rawMaterialData.find((material) => material.name === item);
                              if (selectedItem) {
                                setNewIngredient({
                                  ...newIngredient,
                                  id: selectedItem.id,
                                  name: item,
                                  available_qty: selectedItem.available_qty,
                                  unit: selectedItem.unit
                                });
                                setRawMaterialavailableQty(selectedItem.available_qty);
                              }
                              setIsDropdownOpen(false);
                              setIngError('');
                            }}
                          >
                            {item}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  placeholder={
                    rawMaterialavailableQty !== null
                      ? t('LABELS.availableQuantityValue', { qty: rawMaterialavailableQty })
                      : t('LABELS.availableQuantity')
                  }
                  value={newIngredient.quantity}
                  onChange={handleIngredientQtyChange}
                  className={ingError ? 'is-invalid' : ''}
                />
                {ingError && <div className="text-danger mt-1">{ingError}</div>}
              </CCol>

              {/* Desktop View */}
              <CCol md={3} className="d-none d-md-block">
                <CFormInput
                  type="text"
                  placeholder={t('LABELS.unit')}
                  value={newIngredient.unit}
                  disabled
                />
              </CCol>

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addIngredient}
                  disabled={!!ingError || !newIngredient.name || !newIngredient.quantity}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
                <CFormInput
                  type="text"
                  placeholder={t('LABELS.unit')}
                  value={newIngredient.unit}
                  disabled
                  className="w-80"
                />
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addIngredient}
                  disabled={!!ingError || !newIngredient.name || !newIngredient.quantity}
                  className="w-auto"
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {ingredients.map((ing, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>

                {/* Name: full width on mobile, 4 cols on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={ing.name} readOnly />
                </CCol>

                {/* Quantity: half width on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={ing.quantity} readOnly />
                </CCol>

                {/* Unit: 3 cols on mobile, 1 on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {ing.unit}
                </CCol>

                {/* Delete Button: 3 cols on mobile, 2 on desktop */}
                <CCol xs={3} md={2} className="d-flex justify-content-end">
                  <CButton color="danger" variant="outline" onClick={() => removeIngredient(idx)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>

              </CRow>
            ))}
          </CCardBody>
        </CCard>

        {/* Products */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#f8d7da'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >{t('LABELS.products')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={productsDropdownRef} style={inputContainerStyle}>
                  <CFormInput
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProduct({...newProduct, name: value});
                      if (value) {
                        setIsProductsDropdownOpen(true);
                      }
                    }}
                    onFocus={() => setIsProductsDropdownOpen(true)}
                    placeholder={t('LABELS.searchOrSelectProduct')}
                  />

                  {!newProduct.name ? (
                    <div style={dropdownIconStyle}>
                      <CIcon icon={cilChevronBottom} size="sm" />
                    </div>
                  ) : (
                    <div style={clearButtonStyle} onClick={clearProduct}>
                      <CIcon icon={cilX} size="sm" />
                    </div>
                  )}

                 {isProductsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {productOptions.filter(item => item.toLowerCase().includes(newProduct.name.toLowerCase())).length === 0 ? (
      <div className="p-2 text-muted text-center">{t('MSG.productNotFound')}</div>
    ) : (
      productOptions
        .filter(item => item.toLowerCase().includes(newProduct.name.toLowerCase()))
        .map((item, index) => (
          <div
            key={index}
            className="p-2 cursor-pointer hover-bg-light"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const selectedItem = prductsData.find(p => p.name === item);
              if (selectedItem) {
                setNewProduct({
                  id: selectedItem.id,
                  name: item,
                  quantity: '',
                  unit: selectedItem.unit || '',
                  liters:null
                });
                setProductAvailQty(selectedItem.quantity);
              }
              setIsProductsDropdownOpen(false);
              setProdError('');
            }}
          >
            {item}
          </div>
        ))
    )}
  </div>
)}

                </div>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  placeholder={productAvailQty!==null ? t('LABELS.availableQuantityValue', { qty: productAvailQty }) : t('LABELS.availableQuantity')}
                  value={newProduct.quantity}
                  onChange={handleProductQty}
                  className={prodError ? 'is-invalid' : ''}
                />
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              {/* Desktop View: unit and + button in separate columns */}
              <CCol md={3} className="d-none d-md-block">
  <CFormInput
    value={
      newProduct?.liters
        ? newProduct.liters + ' ltr'
        : ''
    }
    placeholder={t('LABELS.milk_required')}
    disabled
  />
</CCol>

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View: unit and + button in the same row */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
                <CFormInput
                  type="text"
                  value={newProduct.unit}
                  placeholder={t('LABELS.unit')}
                  disabled
                  className="w-80"
                />
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity}
                  className="w-auto"
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {products.map((p, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>

                {/* Product Name: full width on mobile, 4 cols on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={p.name+' '+`(${p.unit} )`} readOnly />
                </CCol>

                {/* Quantity: half on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={p.quantity} readOnly />
                </CCol>

                {/* Unit: quarter on mobile, 1 col on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {p.liters+ " "+"ltr"}
                </CCol>

                {/* Delete Button: quarter on mobile, 2 cols on desktop */}
                <CCol xs={3} md={2} className="d-flex justify-content-end">
                  <CButton color="danger" variant="outline" onClick={() => removeProduct(idx)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>

              </CRow>
            ))}

          </CCardBody>
        </CCard>

        <CButton color="primary" onClick={handleSubmit} disabled={!!error}>
          {t('LABELS.submit')}
        </CButton>

        {/* {createdSummary && (
          <CAlert color='success' className='mt-2'>
            <div className="">
              <strong>{t('LABELS.productCreated')}:</strong>
              <p>{createdSummary.text}</p>
              <p className=" mt-1">{t('LABELS.createdAt')}: {createdSummary.time}</p>
            </div>
          </CAlert>
        )} */}
        {createdSummary && (
  <CAlert color='success' className='mt-2'>
    <div>
      <strong>{t('LABELS.productCreated')}:</strong>
      <p>{createdSummary.text}</p>
      <p className="mt-1">{t('LABELS.createdAt')}: {formatDate(createdSummary.time || new Date())}</p>
    </div>
  </CAlert>
)}
      </CCardBody>
    </CCard>
  )
}

export default MilkForm

