import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
import { cilPlus, cilTrash } from '@coreui/icons'
import { useTranslation } from 'react-i18next'

const createRetailProduct = () => {
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

  const [createdSummary, setCreatedSummary] = useState(null);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null); // holds the selected object

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
      const res = await getAPICall('/api/raw-materials/showAll')
      setRawMaterialData(res.quantity)
      setIngredientOptions(res.quantity.map(item => item.name))
    } catch (err) {
      console.error('Error fetching raw materials:', err)
    }
  }

  const handleFactoryProductChange = async(e) => {
    const selected = e.target.value
    if(selected!==""){
      try{
        const resp=await post('/api/batchByProductId',{'id':selected});
        setBatch(resp?.batch);
      }
      catch(e){

      }
    }
    else{
      setBatch([]);
    }
   
    setFactoryProductId(selected)
    
    const selectedTank = tankData?.find((t) => t.name === selected)
   
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
      setProductOptions(res.products.map(p => p.name));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };
  
  // Handle product selection
  const handleProductSelect = e => {
    const selectedName = e.target.value;
    const selectedProduct = prductsData.find(p => p.name === selectedName);
    
    if (selectedProduct) {
      // Get the sizes for this product
      const sizesForProduct = selectedProduct.size || [];
      
      // Create the new product state with sizes
      setNewProduct({
        id: selectedProduct.id,
        name: selectedName,
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
      setProdError('Entered quantity not supported');
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
      alert('Please select a batch first.');
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
    
    // Create a summary string for alert
    const createdSummary = productsData
      .map(prod => `${prod.name} ${prod.qty} Kg`)
      .join(', ');

    try {
    
      // Call the createProduct API with properly structured data
      await post('/api/newRetailProduct', {
        batch: selectedBatchId,
        rawMaterials: ingredientsData,
        productSizes: productsData,
      });

      alert(`${createdSummary} created successfully:`);

      const now = new Date();
      const formattedTime = now.toLocaleString();
      
      const summaryText = productsData
        .map(prod => `${prod.name} ${prod.qty} Kg`)
        .join(', ');
      
      setCreatedSummary({
        text: `${summaryText} created successfully`,
        time: formattedTime,
      });

      // Reset form
      setSelectedBatchId('');
      setSelectedBatch(null);
      setIngredients([]);
      setProducts([]);
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
            <CFormLabel ><b>Select Factory Product</b></CFormLabel>
            <CFormSelect value={factoryProductId} onChange={handleFactoryProductChange}>
              <option value="">Select Product</option>
              {factoryProductData.map((p, idx) => (
                <option key={idx} value={p.id}>
                  {p.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel><b>Select Batch No</b></CFormLabel>
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
              <option value="">Select Batch</option>
              {batch.map((p, idx) => (
                <option key={idx} value={p.id}>
                  {p.batch}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          
          <CCol md={2}>
            <CFormLabel><b>Total Qty (Kg/ltr)</b></CFormLabel>
            <CFormInput
              type="number"
              placeholder="quantity"
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
              <h5 className="mb-0">Packaging Material</h5> 
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <CFormSelect
                  value={newIngredient.name}
                  onChange={handleIngredientChange}
                >
                  <option value="">Select Ingredient</option>
                  {ingredientOptions.map((item, index) => (
                    <option value={item} key={index}>{item}</option>
                  ))}
                </CFormSelect>
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
              <h5 className="mb-0">Retail Products Creation</h5> 
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <CFormSelect value={newProduct.name} onChange={handleProductSelect}>
                  <option value="">Select Product</option>
                  {productOptions.map((p,i) => <option key={i}>{p}</option>)}
                </CFormSelect>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  placeholder= "Enter Quantity"
                  value={newProduct.quantity}
                  onChange={handleProductQty}
                  className={prodError ? 'is-invalid' : ''}
                />
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              <CCol md={3}>
                {/* Modified to show size dropdown */}
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

              <CCol md={2}>
                <CButton color="success" variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity || !newProduct.sizeId}>
                  <CIcon icon={cilPlus}/>
                </CButton>
              </CCol>
            </CRow>

            {products.map((p,idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>
                <CCol md={4}><CFormInput value={p.name} readOnly/></CCol>
                <CCol md={3}><CFormInput value={p.quantity} readOnly/></CCol>
                <CCol md={3}>{p.sizeDisplay}</CCol>
                <CCol md={2}>
                  <CButton color="danger" variant="outline" onClick={() => removeProduct(idx)}>
                    <CIcon icon={cilTrash}/>
                  </CButton>
                </CCol>
              </CRow>
            ))}
          </CCardBody>
        </CCard>

        <CButton color="primary" onClick={handleSubmit} disabled={!selectedBatchId || ingredients.length === 0 || products.length === 0}>
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

export default createRetailProduct