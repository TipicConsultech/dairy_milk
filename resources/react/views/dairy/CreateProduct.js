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
} from '@coreui/react'
import { getAPICall, post } from '../../util/api'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'

const MilkForm = () => {
  const [milkType, setMilkType] = useState('')
  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [tankData, setTankData] = useState([])
  const [error, setError] = useState('')

  // Fetch tank names and available quantities
  useEffect(() => {
  

    fetchTankData()
  }, [])
  const fetchTankData = async () => {
    try {
      const res = await getAPICall('/api/milk-tanks/names')
      setTankData(res.quantity)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    }
  }
  // Handle tank selection
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

  // Handle milk input change
  const handleMilkAmountChange = (e) => {
    const value = e.target.value
    setMilkAmount(value)

    if (availableQty !== null && parseFloat(value) > availableQty) {
      setError('Entered quantity exceeds available milk.')
    } else {
      setError('')
    }
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!milkType || !milkAmount || parseFloat(milkAmount) > availableQty) {
      alert('Please enter valid quantity within available limit.')
      return
    }

    try {
      const res = await post('/api/updateMilk', {
        name: milkType.toLowerCase(),
        quantity: parseFloat(milkAmount),
      })

      alert(res.message || 'Milk updated successfully.')
      setMilkAmount('')
      setMilkType('')
      setAvailableQty(null)
      setError('')
      fetchTankData();
    } catch (err) {
      console.error('Error updating milk:', err)
      alert('Something went wrong while updating milk.')
    }
  }


// for Ingredients
  const [ingredients, setIngredients] = useState([
    { name: 'Sugar', quantity: '10', unit: 'Kg' },
    { name: 'Salt', quantity: '5', unit: 'Kg' }
  ]);

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'Kg'
  });

  const ingredientOptions = ['Sugar', 'Salt', 'Cream', 'Color', 'Flavor'];

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.unit) {
      setIngredients([...ingredients, newIngredient]);
      setNewIngredient({ name: '', quantity: '', unit: 'Kg' });
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

// for Products
  const [products, setProducts] = useState([
    { name: 'Paneer', quantity: '10', unit: 'Kg' },
    { name: 'Curd', quantity: '5', unit: 'Kg' }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    unit: 'Kg'
  });

  const productOptions = ['Paneer', 'Curd', 'Butter', 'Ghee', 'Cheese'];

  const addProduct = () => {
    if (newProduct.name && newProduct.quantity && newProduct.unit) {
      setProducts([...products, newProduct]);
      setNewProduct({ name: '', quantity: '', unit: 'Kg' });
    }
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };


  return (
    <CCard className="mb-4">
      <CCardBody>
        <CRow className="g-3 align-items-end mb-0">
          <CCol md={4}>
            <CFormLabel>Select Milk Storage</CFormLabel>
            <CFormSelect value={milkType} onChange={handleMilkTypeChange}>
              <option value="">Select Tank</option>
              {tankData.map((tank, idx) => (
                <option key={idx} value={tank.name}>
                  {tank.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel>Enter Milk for Product</CFormLabel>
            <CFormInput
              type="number"
              value={milkAmount}
              onChange={handleMilkAmountChange}
              placeholder={
                availableQty !== null ? `Max: ${availableQty} Ltrs` : 'Enter Milk for Product'
              }
              className={error ? 'is-invalid' : ''}
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </CCol>

          <CCol md={2}>
            <CFormLabel>Ltrs</CFormLabel>
            <div>Ltrs</div>
          </CCol>

          <CCol md={2}>
            <CButton color="primary" onClick={handleSubmit} disabled={!!error || !milkAmount}>
              Submit
            </CButton>
          </CCol>
        </CRow>

{/* data ingredients */}
        <CCard className="mb-4 mt-3">
      <CCardBody>
        <h6 className="bg-light p-2 mb-3">Ingredients Used</h6>

        {/* Input Row */}
        <CRow className="g-2 align-items-center mb-3">
          <CCol md={4}>
            <CFormSelect
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
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
              placeholder="Quantity"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
            />
          </CCol>
          <CCol md={2}>
            <CFormSelect
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            >
              <option value="Kg">Kg</option>
              <option value="Gr">Gr</option>
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <CButton color="success" variant="outline" onClick={addIngredient}>
              <CIcon icon={cilPlus} />
            </CButton>
          </CCol>
        </CRow>

        {/* Existing Ingredients */}
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



{/* Product data */}
<CCard className="mb-4">
      <CCardBody>
        <h6 className="bg-light p-2 mb-3">Created Products</h6>

        {/* Input Row */}
        <CRow className="g-2 align-items-center mb-3">
          <CCol md={4}>
            <CFormSelect
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            >
              <option value="">Select Product</option>
              {productOptions.map((item, index) => (
                <option value={item} key={index}>{item}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormInput
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            />
          </CCol>
          <CCol md={2}>
            <CFormSelect
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
            >
              <option value="Kg">Kg</option>
              <option value="Gr">Gr</option>
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <CButton color="success" variant="outline" onClick={addProduct}>
              <CIcon icon={cilPlus} />
            </CButton>
          </CCol>
        </CRow>

        {/* Existing Products */}
        {products.map((prod, idx) => (
          <CRow className="g-3 align-items-center mb-2" key={idx}>
            <CCol md={4}>
              <CFormInput value={prod.name} readOnly />
            </CCol>
            <CCol md={3}>
              <CFormInput value={prod.quantity} readOnly />
            </CCol>
            <CCol md={1}>{prod.unit}</CCol>
            <CCol md={2}>
              <CButton color="danger" variant="outline" onClick={() => removeProduct(idx)}>
                <CIcon icon={cilTrash} />
              </CButton>
            </CCol>
          </CRow>
        ))}
      </CCardBody>
    </CCard>


      </CCardBody>
    </CCard>
  )
}

export default MilkForm
