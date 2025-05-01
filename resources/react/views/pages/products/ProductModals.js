import React, { useState, useEffect } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CRow,
  CCol,
  CSpinner
} from '@coreui/react';
import { getAPICall, put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

const ProductModal = ({ productId, sourceType, visible, setVisible, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (productId && visible) {
      fetchProductData();
    }
  }, [productId, visible]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      let endpoint = sourceType === 'retail' 
        ? `/api/retailProduct/${productId}` 
        : `/api/factoryProducts/${productId}`;
      
      const response = await getAPICall(endpoint);
      
      // Handle different response formats based on source type
      if (sourceType === 'retail' && response.data) {
        // Retail product returns data in nested object
        setFormData(response.data);
      } else {
        // Factory product returns flat object
        setFormData(response);
      }
    } catch (error) {
      showToast('danger', 'Error fetching product data: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for unit selection
    if (name === 'unit' && sourceType === 'retail') {
      let labelValue = formData.label_value || 0;
      const newFormData = {
        ...formData,
        [name]: value
      };
      
      // Calculate unit_multiplier and convert label_value based on unit selection
      if (value === 'kg' || value === 'ltr') {
        newFormData.unit_multiplier = formData.label_value;
      } else if (value === 'gm' || value === 'ml') {
        newFormData.unit_multiplier = parseFloat(formData.label_value) / 1000 || 0;
        // No need to convert label_value here, as that will happen in handleSubmit
      }
      
      setFormData(newFormData);
    } else if (name === 'label_value' && sourceType === 'retail') {
      // Just update the label_value field without conversion
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = sourceType === 'retail' 
        ? `/api/updateProductSize/${productId}` 
        : `/api/factoryProducts/${productId}`;
      
      // Format the data correctly before sending
      let dataToSubmit = formData;
      
      // For retail products, we might need to wrap in a data object if the API expects it
      if (sourceType === 'retail') {
        // Converting boolean string values to actual booleans for checkbox fields
        dataToSubmit = {
          ...formData,
          returnable: formData.returnable ? 1 : 0,
          show: formData.show ? 1 : 0
        };
      } else {
        // For factory products, ensure boolean is properly formatted
        dataToSubmit = {
          ...formData,
          is_visible: formData.is_visible ? true : false
        };
      }
      
      await put(endpoint, dataToSubmit);
      showToast('success', 'Product updated successfully');
      setVisible(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast('danger', 'Error updating product: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Render the appropriate form based on the source type
  const renderForm = () => {
    if (sourceType === 'retail') {
      return (
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">Name</CFormLabel>
              <CFormInput
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="localName">Local Name</CFormLabel>
              <CFormInput
                id="localName"
                name="localName"
                value={formData.localName || ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="qty">Available Quantity</CFormLabel>
              <CFormInput
                id="qty"
                name="qty"
                type="number"
                value={formData.qty || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="max_stock">Maximum Stock</CFormLabel>
              <CFormInput
                id="max_stock"
                name="max_stock"
                type="number"
                value={formData.max_stock || ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
          <CCol md={4}>
              <CFormLabel htmlFor="label_value">Weight</CFormLabel>
              <CFormInput
                id="label_value"
                name="label_value"
                value={formData.label_value || ''}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="unit">Unit</CFormLabel>
              <CFormSelect
                id="unit"
                name="unit"
                value={formData.unit || 'kg'}
                onChange={handleChange}
                required
              >
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="gm">gm</option>
                <option value="ml">ml</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="dPrice">Price/Unit In Rupees</CFormLabel>
              <CFormInput
                id="dPrice"
                name="dPrice"
                type="number"
                value={formData.dPrice || ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
           
            
            {/* Unit multiplier field is hidden but still part of the form data */}
            <input 
              type="hidden" 
              name="unit_multiplier" 
              value={formData.unit_multiplier || '1'}
            />
          </CRow>
         
          
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormCheck
                id="returnable"
                name="returnable"
                label="Returnable"
                checked={formData.returnable === 1 || formData.returnable === true}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormCheck
                id="show"
                name="show"
                label="Show"
                checked={formData.show === 1 || formData.show === true}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
        </CForm>
      );
    } else {
      // Factory product form
      return (
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">Name</CFormLabel>
              <CFormInput
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="local_name">Local Name</CFormLabel>
              <CFormInput
                id="local_name"
                name="local_name"
                value={formData.local_name || ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="unit">Unit</CFormLabel>
              <CFormInput
                id="unit"
                name="unit"
                value={formData.unit || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="quantity">Quantity</CFormLabel>
              <CFormInput
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity || ''}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="capacity">Capacity</CFormLabel>
              <CFormInput
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="price">Price</CFormLabel>
              <CFormInput
                id="price"
                name="price"
                type="number"
                value={formData.price || ''}
                onChange={handleChange}
                required
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormCheck
                id="is_visible"
                name="is_visible"
                label="Visible"
                checked={formData.is_visible || false}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
        </CForm>
      );
    }
  };

  return (
    <CModal 
      visible={visible} 
      onClose={() => setVisible(false)}
      size="lg"
      alignment="center"
    >
      <CModalHeader onClose={() => setVisible(false)}>
        <CModalTitle>
          {sourceType === 'retail' ? 'Edit Retail Product' : 'Edit Factory Product'}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        {loading ? (
          <div className="text-center">
            <CSpinner />
          </div>
        ) : (
          renderForm()
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Save Changes'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ProductModal;