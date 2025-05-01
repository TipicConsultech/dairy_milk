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

  const [createdSummary, setCreatedSummary] = useState(null);

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
      const res = await getAPICall('/api/raw-materials/showAll')
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
    } else {
      setAvailableQty(null)
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
      setError('Entered quantity exceeds available milk.')
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
      setIngError('Entered quantity exceeds available stock.')
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
  
  const [productOptions, setProductOptions] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:'', quantity:'', unit:'' });
  const [products, setProducts] = useState([]);
  const [prodError, setProdError] = useState('');
  const [productAvailQty, setProductAvailQty] = useState(null);
  
  // ---------- fetch once ----------
  const fetchProducts = async () => {
    try {
      const res = await getAPICall('/api/showAllFactoryProducts');
  
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
      setNewProduct({ id:item.id , name: sel, quantity:'', unit: item.unit || '' });
      setProductAvailQty(item.quantity);          // use renamed field
    } else {
      setNewProduct({ name:'', quantity:'', unit:'' });
      setProductAvailQty(null);
    }
    setProdError('');
  };

  const clearProduct = () => {
    setNewProduct({ id: '', name: '', quantity: '', unit: '' });
    setProductAvailQty(null);
    setProdError('');
  };
  
  const handleProductQty = e => {
    const val = e.target.value;
    setNewProduct(p => ({ ...p, quantity: val }));
  
    if (productAvailQty !== null && parseFloat(val) > productAvailQty) {
      setProdError('Entered quantity exceeds available stock.');
    } else setProdError('');
  };
  
  const addProduct = () => {
    if (newProduct.name && newProduct.quantity && !prodError) {
      setProducts(prev => [...prev, newProduct]);
      setNewProduct({ id: '', name:'', quantity:'', unit:'' });
      setProductAvailQty(null);
    }
  };
  
  const removeProduct = idx => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!milkType || !milkAmount || parseFloat(milkAmount) > availableQty) {
        alert('Please enter valid quantity within available limit.');
        return;
    }

    const selectedTank = tankData.find(t => t.name === milkType);
    if (!selectedTank) {
        alert('Selected milk tank not found.');
        return;
    }

    // Prepare milk tank data as an object with `id` and `quantity`
    const milkTankData = {
        id: selectedTank.id,
        quantity: parseFloat(milkAmount), // Assuming you want to update the quantity with the milkAmount
    };

    // Ensure ingredients and products are in the correct format
    const ingredientsData = ingredients.map(ing => ({
        id: ing.id, // Ensure this is added
        name: ing.name,
        quantity: parseFloat(ing.quantity),
    }));
    
    const productsData = products.map(prod => ({
        id: prod.id,
        name: prod.name,
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
        alert(`${createdSummary} created successfully:`);

        const now = new Date();
        const formattedTime = now.toLocaleString(); // gives date + time in readable format
         
        const summaryText = productsData
          .map(prod => `${prod.name} ${prod.qty} Kg`)
          .join(', ');
         
        setCreatedSummary({
          text: `${summaryText} created successfully`,
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
        alert('Something went wrong while creating the product.');
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
          <CCol md={4}>
            <CFormLabel><b>Select Milk Storage</b></CFormLabel>
            <div style={inputContainerStyle}>
              <CFormSelect value={milkType} onChange={handleMilkTypeChange} style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}>
                <option value="">Select Tank</option>
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
            <CFormLabel><b>Enter Milk for Product</b></CFormLabel>
            <CFormInput
              type="number"
              value={milkAmount}
              onChange={handleMilkAmountChange}
              placeholder={
                availableQty !== null ? `Available Quantity: ${availableQty} Ltrs` : 'Enter Milk for Product'
              }
              className={error ? 'is-invalid' : ''}
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </CCol>

          <CCol md={2}>
            <div><b>Ltrs</b></div>
          </CCol>

          <CCol md={2}>
          </CCol>
        </CRow>

        {/* Ingredients */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#E6E6FA'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >Ingredients Used </h5> 
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
                    placeholder="Search or select ingredient"
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
                      ? `Available Quantity: ${rawMaterialavailableQty}`
                      : 'Quantity'
                  }
                  value={newIngredient.quantity}
                  onChange={handleIngredientQtyChange}
                  className={ingError ? 'is-invalid' : ''}
                />
                {ingError && <div className="text-danger mt-1">{ingError}</div>}
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  placeholder="Unit"
                  value={newIngredient.unit}
                  disabled
                />
              </CCol>
             
              <CCol md={2}>
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addIngredient}
                  disabled={!!ingError || !newIngredient.name || !newIngredient.quantity}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {ingredients.map((ing, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>
                <CCol md={4}>
                  <CFormInput value={ing.name} readOnly />
                </CCol>
                <CCol md={3}>
                  <CFormInput value={ing.quantity} readOnly />
                </CCol>
                <CCol md={1}>{ing.unit}</CCol>
                <CCol md={2}>
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
              <h5 className="mb-0" >Products</h5> 
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
                    placeholder="Search or select product"
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
                      style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}
                    >
                      {productOptions
                        .filter(item => item.toLowerCase().includes(newProduct.name.toLowerCase()))
                        .map((item, index) => (
                          <div 
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              // Handle product selection using your existing logic
                              const selectedItem = prductsData.find(p => p.name === item);
                              if (selectedItem) {
                                setNewProduct({ 
                                  id: selectedItem.id, 
                                  name: item, 
                                  quantity: '', 
                                  unit: selectedItem.unit || '' 
                                });
                                setProductAvailQty(selectedItem.quantity);
                              }
                              setIsProductsDropdownOpen(false);
                              setProdError('');
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
                  placeholder={productAvailQty!==null?`Available Quantity: ${productAvailQty}`:'Quantity'}
                  value={newProduct.quantity}
                  onChange={handleProductQty}
                  className={prodError ? 'is-invalid' : ''}
                />
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              <CCol md={3}>
                <CFormInput type="text" value={newProduct.unit} placeholder="Unit" disabled />
              </CCol>

              <CCol md={2}>
                <CButton color="success" variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity}>
                  <CIcon icon={cilPlus}/>
                </CButton>
              </CCol>
            </CRow>

            {products.map((p,idx)=>(
              <CRow className="g-3 align-items-center mb-2" key={idx}>
                <CCol md={4}><CFormInput value={p.name} readOnly/></CCol>
                <CCol md={3}><CFormInput value={p.quantity} readOnly/></CCol>
                <CCol md={1}>{p.unit}</CCol>
                <CCol md={2}>
                  <CButton color="danger" variant="outline" onClick={()=>removeProduct(idx)}>
                    <CIcon icon={cilTrash}/>
                  </CButton>
                </CCol>
              </CRow>
            ))}
          </CCardBody>
        </CCard>

        <CButton color="primary" onClick={handleSubmit} disabled={!!error || !milkAmount}>
          Submit
        </CButton>

        {createdSummary && (
          <CAlert color='success' className='mt-2'>
            <div className="">
              <strong>Product Created:</strong>
              <p>{createdSummary.text}</p>
              <p className=" mt-1">Created at: {createdSummary.time}</p>
            </div>
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  )
}

export default MilkForm