import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { post } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext';

const NewProduct = () => {
  const { showToast } = useToast();
  const [state, setState] = useState({
    name: '',
    localName: '',
    slug: '',
    categoryId: 0,
    incStep: 1,
    desc: '',
    multiSize: false,
    show: true,
    returnable: false,
    showOnHome: true,
    unit: '',
    qty: 0,
    default_qty:0,
    oPrice: 0,
    bPrice: 0,
    unit_multiplier	:0,
    media: [],
    sizes: [],
    isFactory: false
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    let data = { ...state, sizes:[] }
    data.slug = data.name.replace(/[^\w]/g, '_')
    if (!state.multiSize) {
      data.sizes.push({
        name: data.name,
        localName: data.localName,
        qty: data.qty,
        oPrice: data.oPrice,
        bPrice: data.bPrice,
        dPrice: data.oPrice,
        unit_multiplier:data.unit_multiplier,
        default_qty :data.default_qty,
        stock: data.qty,
        show: true,
        isFactory: data.isFactory,
        returnable: false,
      })
      delete data.oPrice
      delete data.bPrice
      delete data.qty
    }
    try {
      const resp = await post('/api/product', data)
      if (resp) {
        showToast('success','Product added successfully');
        handleClear()
      } else {
        showToast('danger', 'Error occured, please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }
  const handleDefaulyQtyChange = (e) => {
    const { value } = e.target;
  
    // Allow empty string to let the field appear blank when clicked
    if (value === '' || /^[0-9]+$/.test(value)) {
      setState((prev) => ({
        ...prev,
        default_qty: value === '' ? '' : parseInt(value),
      }));
    }
  };
  

  const handleClear = () => {
    setState({
      name: '',
      localName: '',
      slug: '',
      categoryId: 0,
      incStep: 1,
      desc: '',
      multiSize: false,
      show: true,
      returnable: false,
      showOnHome: true,
      qty: 0,
      oPrice: 0,
      default_qty:0,
      bPrice: 0,
      unit_multiplier:0,
      media: [],
      sizes: [],
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create New Product</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
              <div className="row mb-2">
                <div className="col-6">
                    <CFormLabel htmlFor="pname">Product Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="pname"
                      placeholder="Product Name"
                      name="name"
                      value={state.name}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please provide name."
                      feedbackValid="Looks good!"
                    />
                    <div className="invalid-feedback">Product name is required</div>
                </div>
                <div className="col-6">
                  <CFormLabel htmlFor="plname">Local Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="plname"
                    placeholder="Local Name"
                    name="localName"
                    value={state.localName}
                    onChange={handleChange}
                    required
                    feedbackInvalid="Please provide Local name."
                    feedbackValid="Looks good!"
                  />
                  <div className="invalid-feedback">Local name is required</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4">
                  <CFormLabel htmlFor="qty">Product Quantity</CFormLabel>
                  <CFormInput
                    type="number"
                    id="qty"
                    placeholder="0"
                    min="1"
                    name="qty"
                    value={state.qty}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Quantity must be greater than 0</div>
                </div>
                {/* <div className="col-4">
                  <CFormLabel htmlFor="bPrice">Base Price</CFormLabel>
                  <CFormInput
                    type="number"
                    id="bPrice"
                    placeholder="0"
                    min="1"
                    name="bPrice"
                    value={state.bPrice}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Base price must be greater than 0</div>
                </div> */}
                <div className="col-4">
                  <CFormLabel htmlFor="oPrice">Selling Price </CFormLabel>
                  <CFormInput
                    type="number"
                    id="oPrice"
                    placeholder="0"
                    min="1"
                    name="oPrice"
                    value={state.oPrice}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Selling price must be greater than 0</div>
                </div>
                <div className="col-4">
                  <CFormLabel htmlFor="oPrice">Default Qty</CFormLabel>
                  <CFormInput
                    type="number"
                    id="oPrice"
                    placeholder="0"
                    min="1"
                    name="oPrice"
                    value={state.default_qty}
                    onChange={handleDefaulyQtyChange}
                   
                  />
                  
                </div>
              </div>
              <div className="row mb-2">
                {/* <div className="col-6">
                  <CFormCheck
                    id="show"
                    label="Show for invoicing"
                    name="show"
                    checked={state.show}
                    onChange={handleCBChange}
                  />
                </div> */}
                {/* <div className="col-6">
                  <CFormCheck
                    id="returnable"
                    label="Returnable"
                    name="returnable"
                    checked={state.returnable}
                    onChange={handleCBChange}
                  />
                </div> */}
                {/* <div className="col-6">
                  <CFormCheck
                    id="isFactory"
                    label="Is this product for bulk order?"
                    name="isFactory"
                    checked={state.isFactory}
                    onChange={handleCBChange}
                  />
                </div> */}
              </div>
              <div className="row mb-2">
                {/* <div className="col-sm-3">
                  <CFormCheck
                    id="showOnHome"
                    label="Can deliver"
                    name="showOnHome"
                    checked={state.showOnHome}
                    onChange={handleCBChange}
                  />
                </div> */}
                <div className="col-4">
                <CFormLabel htmlFor="oPrice">Unit</CFormLabel>
                    <CFormInput
                      type="text"
                      id="unit"
                      placeholder="Unit e.g KM, Day, Month etc"
                      name="unit"
                      value={state.unit}
                      onChange={handleChange}
                    />
                </div>
                <div className="col-4">
                <CFormLabel htmlFor="oPrice">Unit Multiplier</CFormLabel>
  <CFormInput
    type="number"
    id="unit_multiplier"
    placeholder="Unit Multiplier"
    name="unit_multiplier"
    value={state.unit_multiplier}
    step="any"
    onChange={handleChange}
  />
</div>
              </div>
              <div className="mb-3">
                <CButton color="success" type="submit">
                  Submit
                </CButton>
                &nbsp;
                <CButton color="secondary" onClick={handleClear}>
                  Clear
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default NewProduct
