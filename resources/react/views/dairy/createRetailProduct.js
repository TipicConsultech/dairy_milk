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

const createRetailProduct = () => {
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
  
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
  
    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };
  

  const [factoryProductId, setFactoryProductId] = useState(null)

  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [factoryProductData, setFactoryProductData] = useState([])
  const [error, setError] = useState('')
  const [batch, setBatch] = useState([])
  const [mappedRetailProducts, setMappedRetailProducts] = useState([]);

  const [ingredientOptions, setIngredientOptions] = useState([]);
  console.log(ingredientOptions);
  
  const [newIngredient, setNewIngredient] = useState({id:'', name: '', quantity: '', available_qty: '', unit: '' })
  const [newProducts, setNewProducts] = useState({ name: '', unit: '' })

  const [ingredients, setIngredients] = useState([])

  const [rawMaterialData, setRawMaterialData] = useState([])     // Full objects from API

  const [rawMaterialavailableQty, setRawMaterialavailableQty] = useState(null)
  const [productsUnits, setProductsUnits] = useState(null)

  const [ingError, setIngError] = useState('')

  const [prductsData, setPrductsData] = useState([])
  const [productUnit, setProductUnit] = useState([])

  const [createdSummary, setCreatedSummary] = useState(null); // Will store success/error messages with product details

  console.log(createdSummary);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null); // holds the selected object

  // Dropdown references and states
  const factoryProductDropdownRef = useRef(null);
  const ingredientsDropdownRef = useRef(null);
  const productsDropdownRef = useRef(null);

  const [isFactoryProductDropdownOpen, setIsFactoryProductDropdownOpen] = useState(false);
  const [isIngredientsDropdownOpen, setIsIngredientsDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);

  const [factoryProductSearch, setFactoryProductSearch] = useState('');

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (factoryProductDropdownRef.current && !factoryProductDropdownRef.current.contains(event.target)) {
        setIsFactoryProductDropdownOpen(false);
      }
      if (ingredientsDropdownRef.current && !ingredientsDropdownRef.current.contains(event.target)) {
        setIsIngredientsDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchFactoryProduct()
    fetchRawMaterials()
    fetchProducts()
  }, [])

  const fetchFactoryProduct = async () => {
    try {
      const res = await getAPICall('/api/getProductsByProductType')    // showAllFactoryProducts
      setFactoryProductData(res?.products)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    }
  }

  // const fetchRawMaterials = async () => {
  //   try {
  //     const res = await getAPICall('/api/getRawMaterialsByParam/1')
  //     setRawMaterialData(res.quantity)
  //     setIngredientOptions(res.quantity.map(item => item.name))
  //   } catch (err) {
  //     console.error('Error fetching raw materials:', err)
  //   }
  // }
  const fetchRawMaterials = async () => {
  try {
    const res = await getAPICall('/api/getRawMaterialsByParam/1');
    setRawMaterialData(res.quantity);

    const formattedOptions = res.quantity.map(item => {
      const name =
        lng === 'mr'
          ? decodeUnicode(item?.local_name || '') || item?.name || 'Unnamed'
          : item?.name || 'Unnamed';
      return {
        ...item,
        displayName: name
      };
    });

    setIngredientOptions(formattedOptions);
  } catch (err) {
    console.error('Error fetching raw materials:', err);
  }
};

  const handleFactoryProductChange = async(factoryProductId) => {
    setFactoryProductId(factoryProductId);
  
    if(factoryProductId){
      try{
        const resp = await post('/api/batchByProductId', {'id': factoryProductId});
        setBatch(resp?.batch || []);
      } catch(e){
        console.error('Error fetching batch data:', e);
      }
  
      // 🔽 New: Fetch mapped retail products
      try {
        const mappingResp = await getAPICall(`/api/retail-products/${factoryProductId}`);
        setMappedRetailProducts(mappingResp); // Assumes it returns an array of retail product objects
      } catch (err) {
        console.error('Error fetching mapped retail products:', err);
        setMappedRetailProducts([]);
      }
    } else {
      setBatch([]);
      setMappedRetailProducts([]);
    }
  };
  

  const clearFactoryProduct = () => {
    setFactoryProductSearch('');
    setFactoryProductId(null);
    setBatch([]);
    setSelectedBatchId('');
    setSelectedBatch(null);
  }

  const handleMilkAmountChange = (e) => {
    const value = e.target.value
    setMilkAmount(value)

    if (availableQty !== null && parseFloat(value) > availableQty) {
      setError(t('MSG.quantityExceedsAvailable'))
    } else {
      setError('')
    }
  }

  // const handleIngredientChange = (ingredient) => {
  //   const selectedItem = rawMaterialData.find((item) => item.name === ingredient)

  //   if (selectedItem) {
  //     setNewIngredient({
  //       ...newIngredient,
  //       id: selectedItem.id,
  //       name: ingredient,
  //       available_qty: selectedItem.available_qty,
  //       unit: selectedItem.unit
  //     })
  //     setRawMaterialavailableQty(selectedItem.available_qty)
  //   } else {
  //     setNewIngredient({ name: '', quantity: '', available_qty: '', unit: '' })
  //     setRawMaterialavailableQty(null)
  //   }

  //   setIngError('')
  // }
  const handleIngredientChange = (ingredient) => {
  if (ingredient) {
    setNewIngredient({
      ...newIngredient,
      id: ingredient.id,
      name: lng === 'mr'
        ? decodeUnicode(ingredient?.local_name || '') || ingredient.name
        : ingredient.name,
      available_qty: ingredient.available_qty,
      unit: ingredient.unit
    });
    setRawMaterialavailableQty(ingredient.available_qty);
  } else {
    setNewIngredient({ name: '', quantity: '', available_qty: '', unit: '' });
    setRawMaterialavailableQty(null);
  }

  setIngError('');
};


  const clearIngredient = () => {
    setNewIngredient({ id: '', name: '', quantity: '', available_qty: '', unit: '' });
    setRawMaterialavailableQty(null);
    setIngError('');
  }

  const handleIngredientQtyChange = (e) => {
    const value = e.target.value
    setNewIngredient({ ...newIngredient, quantity: value })

    if (rawMaterialavailableQty !== null && parseFloat(value) > rawMaterialavailableQty) {
      setIngError(t('MSG.quantityExceedsStock'))
    } else {
      setIngError('')
    }
  }

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && !ingError) {
      setIngredients([...ingredients, { ...newIngredient }])
      setNewIngredient({ name: '', quantity: '', available_qty: '', unit: '' })
      setRawMaterialavailableQty(null)
    }
  }

  const removeIngredient = (index) => {
    const updated = [...ingredients]
    updated.splice(index, 1)
    setIngredients(updated)
  }

  const [productOptions, setProductOptions] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:'', quantity:'', unit:'', sizeId: null, sizeOptions: [] });
  const [products, setProducts] = useState([]);
  const [prodError, setProdError] = useState('');
  const [productAvailQty, setProductAvailQty] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await getAPICall('/api/getProductsByProductTypeForRetail');
      // console.log("API Response:", res.products);

      const filtered = res.products.filter(p => p.isFactory === 0);

      setPrductsData(filtered);

      // Use full object instead of just name for easy access on selection
      setProductOptions(filtered.map(p => ({
        id: p.id,
        name: p.name,
        localName: p.localName,
        label_value: p.label_value,
        unit: p.unit,
        qty: p.qty,
        sizeId: p.id, // or actual size ID if different
      })));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleProductSelect = (product) => {
    console.log("Selected:", product); // Add this for debugging
  
    const sizeOption = {
      id: product.sizeId || product.id,
      label_value: product.label_value || '',
      unit: product.unit || '',
      qty: product.qty || null, // Ensure qty is present if needed
    };
  
    // setNewProduct({
    //   name: product.name || '',
    //   quantity: '',
    //   unit: sizeOption.unit,
    //   sizeId: sizeOption.id,
    //   sizeOptions: [sizeOption],
    // });
    setNewProduct({
    ...newProduct,
    id: product.id,
    name: lng === 'mr'
      ? decodeUnicode(product?.localName || '') || product.name
      : product.name,
    unit: product.unit,
    label_value: product.label_value,
    qty: product.qty
  });
  
    setProductAvailQty(sizeOption.qty || null); // Store qty for validation if needed
    setProdError('');
  };
  
  

  const clearProduct = () => {
    setNewProduct({ name:'', quantity:'', unit:'', sizeId: null, sizeOptions: [] });
    setProductAvailQty(null);
    setProdError('');
  }

  const handleSizeChange = e => {
    const sizeId = parseInt(e.target.value);

    const selectedSize = newProduct.sizeOptions.find(size => size.id === sizeId);

    if (selectedSize) {
      setNewProduct(prev => ({
        ...prev,
        sizeId: sizeId,
        unit: selectedSize.unit
      }));

      setProductAvailQty(selectedSize.qty);
    }

    setProdError('');
  };

  console.log(selectedBatch);
  

  const handleProductQty = e => {
    const val = e.target.value;
    setNewProduct(p => ({ ...p, quantity: val }));

    if (productAvailQty !== null && parseFloat(val) < 0) {
      setProdError(t('MSG.quantityNotSupported'));
    } else {
      setProdError('');
    }
  };

  const addProduct = () => {
    console.log('Adding product:', newProduct);
  
    if (newProduct.name && newProduct.quantity && newProduct.id ) {
      const selectedSize = newProduct.id
      const sizeDisplay = selectedSize ? `${selectedSize.label_value} ${selectedSize.unit}` : '';
  
      setProducts(prev => [...prev, {
        ...newProduct,
        sizeDisplay: sizeDisplay
      }]);
  
      setNewProduct({ name:'', quantity:'', unit:'', sizeId: null, sizeOptions: [] });
      setProductAvailQty(null);
    }
  };
  

  const removeProduct = idx => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedBatchId) {
      alert(t('MSG.selectBatchFirst'));
      return;
    }

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
      qty: parseFloat(prod.quantity),
    }));

    try {
      const response = await post('/api/newRetailProduct', {
        batch: selectedBatchId,
        rawMaterials: ingredientsData,
        productSizes: productsData,
        factoryProductId: factoryProductId,
      });

      const now = new Date();
      const formattedTime = now.toLocaleString();

      if (response.success && response.message) {
        setCreatedSummary({
          success: true,
          products: response.message,
          time: formattedTime
        });
      } else {
        const summaryText = productsData
          .map((prod) => `${prod.name} ${t('MSG.withQuantityOf')} ${prod.qty}`)
          .join(', ');

        setCreatedSummary({
          success: true,
          text: `${summaryText} ${t('MSG.createdSuccessfully')}`,
          time: formattedTime,
        });
      }

      setSelectedBatchId('');
      setSelectedBatch(null);
      setIngredients([]);
      setProducts([]);
      fetchRawMaterials();
      fetchProducts();
    } catch (err) {
      console.error('Error in submission:', err);
      setCreatedSummary({
        success: false,
        text: err.message || t('MSG.errorCreatingProduct'),
        time: new Date().toLocaleString()
      });
    }
  };

  useEffect(() => {
    setCreatedSummary(null);
  }, []);

  const decodeUnicode = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
};



  return (
    <CCard className="mb-4">
      <CCardHeader style={{ backgroundColor: '#d4edda'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0" >{t('LABELS.createRetailProduct')}</h5>
        </div>
      </CCardHeader>

      <CCardBody>
        <CRow className="g-3 align-items-end mb-0">
          <CCol md={4}>
            <CFormLabel ><b>{t('LABELS.selectFactoryProduct')}</b></CFormLabel>
            <div className="position-relative" ref={factoryProductDropdownRef}>
              {/* <div className="position-relative">
                <CFormInput
                  type="text"
                  value={factoryProductSearch}
                  onChange={(e) => {
                    setFactoryProductSearch(e.target.value);
                    if (e.target.value) {
                      setIsFactoryProductDropdownOpen(true);
                    }
                  }}
                  onFocus={() => setIsFactoryProductDropdownOpen(true)}
                  placeholder={t('LABELS.searchSelectFactoryProduct')}
                  style={{ paddingRight: '30px' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer'
                  }}
                  onClick={() => factoryProductSearch ? clearFactoryProduct() : setIsFactoryProductDropdownOpen(!isFactoryProductDropdownOpen)}
                >
                  {factoryProductSearch ? <CIcon icon={cilX} /> : <CIcon icon={cilChevronBottom} />}
                </div>
              </div>

              {isFactoryProductDropdownOpen && (
                <div
                  className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
                  style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}
                >
                  {factoryProductData
                    .filter(item => item.name.toLowerCase().includes(factoryProductSearch.toLowerCase()))
                    .map((product, index) => (
                      <div
                        key={index}
                        className="p-2 cursor-pointer hover-bg-light"
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                          setFactoryProductSearch(product.name);
                          handleFactoryProductChange(product.id);
                          setIsFactoryProductDropdownOpen(false);
                        }}
                      >
                        {product.name}
                      </div>
                    ))}
                </div>
              )} */}


<div className="position-relative">
  <CFormInput
    type="text"
    value={factoryProductSearch}
    onChange={(e) => {
      setFactoryProductSearch(e.target.value);
      if (e.target.value) {
        setIsFactoryProductDropdownOpen(true);
      }
    }}
    onFocus={() => setIsFactoryProductDropdownOpen(true)}
    placeholder={t('LABELS.searchSelectFactoryProduct')}
    style={{ paddingRight: '30px' }}
  />
  <div
    style={{
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      cursor: 'pointer'
    }}
    onClick={() =>
      factoryProductSearch
        ? clearFactoryProduct()
        : setIsFactoryProductDropdownOpen(!isFactoryProductDropdownOpen)
    }
  >
    {factoryProductSearch ? <CIcon icon={cilX} /> : <CIcon icon={cilChevronBottom} />}
  </div>
</div>

{isFactoryProductDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {factoryProductData
      .filter((product) => {
        const name =
          lng === 'mr'
            ? decodeUnicode(product.localName || '')
            : product.name || product.name;
        return name.toLowerCase().includes(factoryProductSearch.toLowerCase());
      })
      .map((product, index) => {
        const displayName =
          lng === 'mr'
            ? decodeUnicode(product.localName || '')
            : product.name || product.name;

        return (
          <div
            key={index}
            className="p-2 cursor-pointer hover-bg-light"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setFactoryProductSearch(displayName);
              handleFactoryProductChange(product.id);
              setIsFactoryProductDropdownOpen(false);
            }}
          >
            {displayName}
          </div>
        );
      })}
  </div>
)}



            </div>
          </CCol>

          <CCol md={4}>
            <CFormLabel><b>{t('LABELS.selectBatchNo')}</b></CFormLabel>
            <CFormSelect
              value={selectedBatchId}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                setSelectedBatchId(selectedId);

                const selected = batch.find(item => item.id === selectedId);
                setSelectedBatch(selected || null);
              }}
            >
              <option value="">{t('LABELS.selectBatch')}</option>
              {batch.map((p, idx) => (
                <option key={idx} value={p.id}>
                  {p.batch}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <CFormLabel><b>{t('LABELS.totalQty')} </b></CFormLabel>
            <CFormInput
              type="text"
              placeholder={t('LABELS.quantity')}
               value={selectedBatch!==null ? selectedBatch?.product_qty +" "+selectedBatch?.unit :`${t('LABELS.quantity')}`}
               disabled
            />
          </CCol>

          <CCol md={2}></CCol>
        </CRow>

        {/* Ingredients */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#E6E6FA'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0">{t('LABELS.packagingMaterial')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={ingredientsDropdownRef}>
                  <CFormInput
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient({...newIngredient, name: value});
                      if (value) {
                        setIsIngredientsDropdownOpen(true);
                      }
                    }}
                    onFocus={() => setIsIngredientsDropdownOpen(true)}
                    placeholder={t('LABELS.searchSelectPackagingMaterial')}
                    style={{ paddingRight: '30px' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => newIngredient.name ? clearIngredient() : setIsIngredientsDropdownOpen(!isIngredientsDropdownOpen)}
                  >
                    {newIngredient.name ? <CIcon icon={cilX} /> : <CIcon icon={cilChevronBottom} />}
                  </div>

                  {/* {isIngredientsDropdownOpen && (
                    <div
                      className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
                      style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}
                    >
                      {ingredientOptions
                        .filter(item => item.toLowerCase().includes(newIngredient.name))
                        .map((item, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              handleIngredientChange(item);
                              setIsIngredientsDropdownOpen(false);
                            }}
                          >
                            {item}
                          </div>
                        ))}
                    </div>
                  )} */}
 {isIngredientsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {ingredientOptions
        .filter(item => {
    const name = lng === 'mr'
      ? decodeUnicode(item?.local_name || '') 
      : item?.name || '';
    return name.toLowerCase().includes((newIngredient.name || '').toLowerCase());
  })
  .map((item, index) => {
    const displayName = lng === 'mr'
      ? decodeUnicode(item?.local_name || '')
      : item?.name || '';

        return (
          <div
            key={index}
            className="p-2 text-dark"
            style={{ cursor: 'pointer', backgroundColor: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            onClick={() => {
              handleIngredientChange(item);
              setIsIngredientsDropdownOpen(false);
            }}
          >
            {displayName || "no data will show"}
          </div>
        );
      })}
  </div>
)}





                

                </div>
   


              </CCol>
             <CCol md={3}>
  <CFormInput
    type="number"
    placeholder={
      rawMaterialavailableQty !== null
        ? `${t('LABELS.availableQuantity')}: ${rawMaterialavailableQty}`
        : t('LABELS.quantity')
    }
    value={newIngredient.quantity}
    onChange={(e) => {
      const value = e.target.value;
      if (value === '' || parseFloat(value) > 0) {
        setNewIngredient(prev => ({
          ...prev,
          quantity: value
        }));
      }
    }}
    className={ingError ? 'is-invalid' : ''}
  />
  {ingError && <div className="text-danger mt-1">{ingError}</div>}
</CCol>

              {/* Desktop View: separate columns */}
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

              {/* Mobile View: unit and + button in the same row */}
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
                {/* Ingredient Name: Full width on mobile, 4 columns on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={ing.name} readOnly />
                </CCol>

                {/* Quantity: Half width on mobile, 3 columns on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={ing.quantity} readOnly />
                </CCol>

                {/* Unit: Quarter width on mobile, 1 column on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {ing.unit}
                </CCol>

                {/* Delete Button: Quarter width on mobile, 2 columns on desktop */}
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
              <h5 className="mb-0">{t('LABELS.retailProductsCreation')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={productsDropdownRef}>
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
                    placeholder={t('LABELS.searchSelectProduct')}
                    style={{ paddingRight: '30px' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '10px',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                    onClick={() => newProduct.name ? clearProduct() : setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                  >
                    {newProduct.name ? <CIcon icon={cilX} /> : <CIcon icon={cilChevronBottom} />}
                  </div>

                {/* {isProductsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {mappedRetailProducts.filter(item => item.name.toLowerCase().includes(newProduct.name.toLowerCase())).length === 0 ? (
      <div className="p-2 text-muted text-center">{t('MSG.productNotFound')}</div>
    ) : (
      mappedRetailProducts
        .filter(item => item.name.toLowerCase().includes(newProduct.name.toLowerCase()))


        
        .map((item, index) => (
          <div
            key={index}
            className="p-2 cursor-pointer hover-bg-light"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleProductSelect(item);
              setIsProductsDropdownOpen(false);
            }}
          >
            {item.name} 
           
          </div>
        ))
    )}
  </div>
)} */}



{isProductsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {mappedRetailProducts.filter(item => item.name.toLowerCase().includes(newProduct.name.toLowerCase())).length === 0 ? (
      <div className="p-2 text-muted text-center">{t('MSG.productNotFound')}</div>
    ) : (
      mappedRetailProducts
        .filter(item => item.name.toLowerCase().includes(newProduct.name.toLowerCase()))
        .map((item, index) => {
          const marathiName = decodeUnicode(item?.localName || '');
          const displayName = `${item.name}${marathiName ? ` (${marathiName})` : ''}`;

          return (
            <div
              key={index}
              className="p-2 cursor-pointer hover-bg-light"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleProductSelect(item); // <-- This will pass full object
                setIsProductsDropdownOpen(false);
              }}
            >
              {displayName}
          
            </div>
          );
        })
    )}
  </div>
)}



 {/* ({item.label_value} {item.unit}) */}
                </div>
              </CCol>

           <CCol md={3}>
  <CFormInput
    type="number"
    placeholder={t('LABELS.enterQuantity')}
    value={newProduct.quantity}
    onChange={(e) => {
      const value = e.target.value;
      if (value === '' || parseFloat(value) > 0) {
        setNewProduct(prev => ({
          ...prev,
          quantity: value
        }));
      }
    }}
    className={prodError ? 'is-invalid' : ''}
  />
  {prodError && <div className="text-danger mt-1">{prodError}</div>}
</CCol>

               <CCol md={3}>
               <CFormInput
  placeholder={t('LABELS.unit')}
  // value={
  //   newProduct && newProduct.label_value && newProduct.unit
  //     ? `${newProduct.unit}`
  //     : ''
  // }
   value={
    newProduct && newProduct.label_value && newProduct.unit=="gm"||"kg"
      ? "pcs"
      : "liter"
  }
  onChange={handleProductQty}
  className={prodError ? 'is-invalid' : ''}
  disabled
/>
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              {/* Desktop View: Separate columns */}
              {/* <CCol md={3} className="d-none d-md-block">
                <CFormSelect
                  value={newProduct.sizeId || ''}
                  onChange={handleSizeChange}
                  disabled={!newProduct.sizeOptions || newProduct.sizeOptions.length === 0}
                >
                  {newProduct.sizeOptions && newProduct.sizeOptions.map((size, i) => (
                    <option key={i} value={size.id}>
                     {size.unit}
                    </option>
                  ))}
                </CFormSelect>
              </CCol> */}

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!newProduct.name || !newProduct.quantity || !newProduct.id}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View: Unit dropdown and + button in one row */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
               
                {/* <CFormInput
  placeholder={t('LABELS.unit')}
  value={
    newProduct && newProduct.label_value && newProduct.unit
      ? ` ${newProduct.unit}`
      : ''
  }
  onChange={handleProductQty}
  className={prodError ? 'is-invalid' : ''}
  disabled
/> */}
                {prodError && <div className="text-danger mt-1">{prodError}</div>}

                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!newProduct.name || !newProduct.quantity || !newProduct.id}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {products.map((p, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>
                {/* Product Name: full width on mobile, 4 cols on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={p.name} readOnly />
                </CCol>

                {/* Quantity: half on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={p.quantity} readOnly />
                </CCol>

                {/* Unit Display: quarter on mobile, 3 cols on desktop */}
                <CCol xs={3} md={3} className="d-flex align-items-center">
                pcs
                </CCol>

                {/* Delete Button: quarter on mobile, 2 cols on desktop */}
                <CCol xs={3} md={2} className="d-flex justify-content-start">
                  <CButton color="danger" variant="outline" onClick={() => removeProduct(idx)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>
              </CRow>
            ))}
          </CCardBody>
        </CCard>

        <CButton color="primary" onClick={handleSubmit} disabled={!selectedBatchId || products.length === 0}>
          {t('LABELS.submit')}
        </CButton>

{createdSummary && (
  <CAlert color={createdSummary.success ? 'success' : 'danger'} className='mt-2'>
    <div>
      <strong>
        {createdSummary.success ? t('LABELS.productCreated') : t('LABELS.error')}:
      </strong>

      {createdSummary.products ? (
        <div className="mt-2">
          {createdSummary.products.map((product, index) => (
            <div key={index} className="mb-2">
              <p>
                <strong>{product.product_name}</strong> {t('MSG.createdSuccessfully')}
              </p>
              <ul className="mb-0">
                <li>{t('LABELS.createdQuantity')}: {product.created_quantity} &nbsp;pcs</li>
                <li>{t('LABELS.previousQuantity')}: {product.previous_quantity} &nbsp;pcs</li>
                <li>{t('LABELS.updatedQuantity')}: {product.updated_quantity} &nbsp;pcs</li>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>{createdSummary.text}</p>
      )}

      <p className="mt-1 text-muted">
        {t('LABELS.createdAt')}: {createdSummary?.time}
      </p>
    </div>
  </CAlert>
)}

      </CCardBody>
    </CCard>
  )
}

export default createRetailProduct
