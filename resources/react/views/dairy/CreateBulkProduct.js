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

const CreateBulkProduct = () => {
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  const [factoryProductId, setFactoryProductId] = useState(null)

  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [factoryProductData, setFactoryProductData] = useState([])
  const [error, setError] = useState('')
  const [batch, setBatch] = useState([])

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

  const [createdSummary, setCreatedSummary] = useState(null); // Will store success/error messages with product details

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
      const res = await getAPICall('/api/showAllFactoryProducts')
      setFactoryProductData(res?.products)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const res = await getAPICall('/api/getRawMaterialsByParam/1')
      setRawMaterialData(res.quantity)
      setIngredientOptions(res.quantity.map(item => item.name))
    } catch (err) {
      console.error('Error fetching raw materials:', err)
    }
  }

  const handleFactoryProductChange = async(factoryProductId) => {
    if(factoryProductId){
      try{
        const resp = await post('/api/batchByProductId',{'id': factoryProductId});
        setBatch(resp?.batch);
      }
      catch(e){
        console.error('Error fetching batch data:', e);
      }
    }
    else{
      setBatch([]);
    }

    setFactoryProductId(factoryProductId);
  }

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

  const handleIngredientChange = (ingredient) => {
    const selectedItem = rawMaterialData.find((item) => item.name === ingredient)

    if (selectedItem) {
      setNewIngredient({
        ...newIngredient,
        id: selectedItem.id,
        name: ingredient,
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

  // Fetch products with sizes
  const fetchProducts = async () => {
    try {
      const res = await getAPICall('/api/getProductsWithVisibleSizes');
      console.log("API Response:", res.products);

      // Store the full product data including sizes
      setPrductsData(res.products);

      // Extract just the product names for the dropdown
      setProductOptions(res.products.filter(x=>x.size[0].isFactory == 1).map(p => p.name));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Handle product selection
  const handleProductSelect = (productName) => {
    const selectedProduct = prductsData.find(p => p.name === productName);

    if (selectedProduct) {
      // Get the sizes for this product
      const sizesForProduct = selectedProduct.size || [];

      // Create the new product state with sizes
      setNewProduct({
        id: selectedProduct.id,
        name: productName,
        quantity: '',
        unit: selectedProduct.unit || '',
        sizeId: sizesForProduct.length > 0 ? sizesForProduct[0].id : null,
        sizeOptions: sizesForProduct
      });

      // If there are sizes, set the available quantity based on first size
      if (sizesForProduct.length > 0) {
        setProductAvailQty(sizesForProduct[0].qty);
      } else {
        setProductAvailQty(null);
      }
    } else {
      setNewProduct({ name:'', quantity:'', unit:'', sizeId: null, sizeOptions: [] });
      setProductAvailQty(null);
    }

    setProdError('');
  };

  const clearProduct = () => {
    setNewProduct({ name:'', quantity:'', unit:'', sizeId: null, sizeOptions: [] });
    setProductAvailQty(null);
    setProdError('');
  }

  // Handle size selection change
  const handleSizeChange = e => {
    const sizeId = parseInt(e.target.value);

    // Find the size in the current product's size options
    const selectedSize = newProduct.sizeOptions.find(size => size.id === sizeId);

    if (selectedSize) {
      setNewProduct(prev => ({
        ...prev,
        sizeId: sizeId,
        unit: selectedSize.unit
      }));

      // Update available quantity based on selected size
      setProductAvailQty(selectedSize.qty);
    }

    // Clear any previous errors
    setProdError('');
  };

  const handleProductQty = e => {
    const val = e.target.value;
    setNewProduct(p => ({ ...p, quantity: val }));

    if (productAvailQty !== null && parseFloat(val) < 0) {
      setProdError(t('MSG.invalidQuantity'));
    } else {
      setProdError('');
    }
  };

  const addProduct = () => {
    if (newProduct.name && newProduct.quantity && newProduct.sizeId && !prodError) {
      // Find the selected size for display purposes
      const selectedSize = newProduct.sizeOptions.find(size => size.id === newProduct.sizeId);
      const sizeDisplay = selectedSize ? `${selectedSize.label_value} ${selectedSize.unit}` : '';

      // Add product with size information
      setProducts(prev => [...prev, {
        ...newProduct,
        sizeDisplay: sizeDisplay
      }]);

      // Log the product JSON format as requested
      console.log("product:", { id: newProduct.sizeId, qty: parseFloat(newProduct.quantity) });

      // Reset the form fields
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

    // Ensure ingredients and products are in the correct format
    const ingredientsData = ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      quantity: parseFloat(ing.quantity),
    }));

    // Format products with size IDs
    const productsData = products.map(prod => ({
      id: prod.sizeId,
      name: prod.name,
      qty: parseFloat(prod.quantity),
    }));

    try {
      // Call the createProduct API with properly structured data
      const response = await post('/api/newRetailProduct', {
        batch: selectedBatchId,
        rawMaterials: ingredientsData,
        productSizes: productsData,
        factoryProductId: factoryProductId,
      });

      const now = new Date();
      const formattedTime = now.toLocaleString();

      // Handle successful response with product details
      if (response.success && response.message) {
        // Set created summary with the detailed product information
        setCreatedSummary({
          success: true,
          products: response.message,
          time: formattedTime
        });
      } else {
        // Fallback if response structure is unexpected
        const summaryText = productsData
          .map((prod) => `${prod.name} with quantity of ${prod.qty}`)
          .join(', ');

        setCreatedSummary({
          success: true,
          text: t('MSG.productCreatedSuccess', { products: summaryText }),
          time: formattedTime,
        });
      }

      // Reset form
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
        text: err.message || t('MSG.productCreationError'),
        time: new Date().toLocaleString()
      });
    }
  };

  useEffect(() => {
    setCreatedSummary(null); // Clear it on load or refresh
  }, []);

  return (
    <CCard className="mb-4">
      <CCardHeader style={{ backgroundColor: '#d4edda'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0" >{t('LABELS.bulkProduct')}</h5>
        </div>
      </CCardHeader>

      <CCardBody>
        <CRow className="g-3 align-items-end mb-0">
          <CCol md={4}>
            <CFormLabel ><b>{t('LABELS.selectFactoryProduct')}</b></CFormLabel>
            <div className="position-relative" ref={factoryProductDropdownRef}>
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

                // Find the full object from batchData
                const selected = batch.find(item => item.id === selectedId);
                setSelectedBatch(selected || null); // store selected object
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
            <CFormLabel><b>{t('LABELS.totalQty')}</b></CFormLabel>
            <CFormInput
              type="number"
              placeholder={t('LABELS.quantity')}
              value={selectedBatch?.product_qty}
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

                  {isIngredientsDropdownOpen && (
                    <div
                      className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
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
                              handleIngredientChange(item);
                              setIsIngredientsDropdownOpen(false);
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
                      ? t('LABELS.availableQuantity', { qty: rawMaterialavailableQty })
                      : t('LABELS.quantity')
                  }
                  value={newIngredient.quantity}
                  onChange={handleIngredientQtyChange}
                  className={ingError ? 'is-invalid' : ''}
                />
                {ingError && <div className="text-danger mt-1">{ingError}</div>}
              </CCol>

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

              {/* Mobile View: unit and + button in one row */}
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

                {/* Quantity: half on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={ing.quantity} readOnly />
                </CCol>

                {/* Unit: quarter on mobile, 1 col on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {ing.unit}
                </CCol>

                {/* Delete Button: quarter on mobile, 2 cols on desktop */}
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
              <h5 className="mb-0">{t('LABELS.bulkProductsCreation')}</h5>
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
                              handleProductSelect(item);
                              setIsProductsDropdownOpen(false);
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
                  placeholder={t('LABELS.enterQuantity')}
                  value={newProduct.quantity}
                  onChange={handleProductQty}
                  className={prodError ? 'is-invalid' : ''}
                />
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              <CCol md={3} className="d-none d-md-block">
                <CFormSelect
                  value={newProduct.sizeId || ''}
                  onChange={handleSizeChange}
                  disabled={!newProduct.sizeOptions || newProduct.sizeOptions.length === 0}
                >
                  {newProduct.sizeOptions && newProduct.sizeOptions.map((size, i) => (
                    <option key={i} value={size.id}>
                      {size.label_value} {size.unit}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity || !newProduct.sizeId}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View: unit dropdown and + button in the same row */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
                <CFormSelect
                  value={newProduct.sizeId || ''}
                  onChange={handleSizeChange}
                  disabled={!newProduct.sizeOptions || newProduct.sizeOptions.length === 0}
                  className="w-80"
                >
                  {newProduct.sizeOptions && newProduct.sizeOptions.map((size, i) => (
                    <option key={i} value={size.id}>
                      {size.label_value} {size.unit}
                    </option>
                  ))}
                </CFormSelect>

                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity || !newProduct.sizeId}
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
                  <CFormInput value={p.name} readOnly />
                </CCol>

                {/* Quantity: half on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={p.quantity} readOnly />
                </CCol>

                {/* Unit: quarter on mobile, 3 cols on desktop */}
                <CCol xs={3} md={3} className="d-flex align-items-center">
                  {p.sizeDisplay}
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

        <CButton color="primary" onClick={handleSubmit} disabled={!selectedBatchId || ingredients.length === 0 || products.length === 0}>
        {t('LABELS.submit')}
        </CButton>
{createdSummary && (
  <CAlert color={createdSummary.success ? 'success' : 'danger'} className='mt-2'>
    <div>
      <strong>{createdSummary.success ? t('LABELS.productCreated') : t('LABELS.error')}:</strong>
      {createdSummary.products ? (
        // Display each product in the array with its details
        <div className="mt-2">
          {createdSummary.products.map((product, index) => (
            <div key={index} className="mb-2">
              <p><strong>{product.product_name}</strong> {t('MSG.createdSuccessfully')}</p>
              <ul className="mb-0">
                <li>{t('LABELS.createdQuantity')}: {product.created_quantity}</li>
                <li>{t('LABELS.previousQuantity')}: {product.previous_quantity}</li>
                <li>{t('LABELS.updatedQuantity')}: {product.updated_quantity}</li>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>{createdSummary.text}</p>
      )}
      <p className="mt-1 text-muted">{t('LABELS.createdAt')}: {createdSummary.time}</p>
    </div>
  </CAlert>
)}
</CCardBody>
</CCard>
) }

export default CreateBulkProduct;
