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
import { useTranslation } from 'react-i18next';

const ProductModal = ({ productId, sourceType, visible, setVisible, onSuccess }) => {
       const { t, i18n } = useTranslation("global");
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
        :`/api/retailProduct/${productId}`;
      
      const response = await getAPICall(endpoint);
      
      // Handle different response formats based on source type
      if (sourceType === 'retail' && response.data) {
        // Retail product returns data in nested object
        setFormData(response.data);
      } else {
        // Factory product returns flat object
        setFormData(response.data);
      }
    } catch (error) {
      showToast('danger', 'Error fetching product data: ' + error);
    } finally {
      setLoading(false);
    }
  };
  const productTypeOptions = [
    { value: '2', label: `${t('LABELS.retail')}`  },
    { value: '1', label:`${t('LABELS.factory')}` },
    { value: '0', label: `${t('LABELS.delivery_product')}` }
  ]
 
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
        : `/api/updateProductSize/${productId}`;
      
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

  const handleDefaultQtyChange = (e) => {
    const { value } = e.target;

    // Allow empty string to let the field appear blank when clicked
    if (value === '' || /^[0-9]+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        default_qty: value === '' ? '' : parseInt(value),
      }));
    }
  };

  // Render the appropriate form based on the source type
  const renderForm = () => {
    if (sourceType === 'retail' || sourceType === 'factory') {
      return (
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel htmlFor="name">{t('LABELS.product_name')}</CFormLabel>
              <CFormInput
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="localName">{t('LABELS.product_local_name')}</CFormLabel>
              <CFormInput
                id="localName"
                name="localName"
                value={formData.localName || ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
          <CCol md={4}>
                      <CFormLabel htmlFor="product_type">{t('LABELS.product_type')}</CFormLabel>
                      <CFormSelect 
                        id="product_type" 
                        name="product_type" 
                        value={formData.product_type}
                        onChange={handleChange}
                      >
                        {productTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </CFormSelect>
            </CCol>
                 
            <CCol md={4}>
              <CFormLabel htmlFor="qty">{t('LABELS.availableQuantity')}</CFormLabel>
              <CFormInput
                id="qty"
                name="qty"
                type="number"
                value={formData.qty || ''}
                onChange={handleChange}
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="max_stock">{t('LABELS.Capacity')}</CFormLabel>
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
              <CFormLabel htmlFor="label_value">{t('LABELS.weight')}</CFormLabel>
              <CFormInput
                id="label_value"
                name="label_value"
                value={formData.label_value || ''}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="unit">{t('LABELS.units')}</CFormLabel>
              <CFormSelect
                id="unit"
                name="unit"
                value={formData.unit || 'kg'}
                onChange={handleChange}
                required
              >
                <option value="kg">{t('LABELS.Kilogram')}</option>
                <option value="ltr">{t('LABELS.liter')}</option>
                <option value="gm">{t('LABELS.grams')}</option>
                <option value="ml">{t('LABELS.milli_liter')}</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="dPrice">{t('LABELS.price')}</CFormLabel>
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
           
            <CCol md={4}>
              <CFormCheck
                id="show"
                name="show"
                label={t('LABELS.show')}
                checked={formData.show === 1 || formData.show === true}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={4}>
              <CFormCheck
                id="returnable"
                name="returnable"
                label={t('LABELS.returnable')}
                checked={formData.returnable === 1 || formData.returnable === true}
                onChange={handleChange}
              />
            </CCol>
            {formData.returnable ===1 ||formData.returnable ===true  && (
                
                <div className="col-md-4 col-12 mb-2 ">
                  <CFormLabel htmlFor="default_qty">{t('LABELS.default_qty')}</CFormLabel>
                  <CFormInput
                    type="number"
                    id="default_qty"
                    placeholder="0"
                    min="1"
                    name="default_qty"
                    value={formData.default_qty}
                    onChange={handleDefaultQtyChange}
                  />
                </div>
            
            )}
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
          {sourceType === 'retail' ? `${t('LABELS.edit_retail_product')}` : `${t('LABELS.edit_factory_product')}`}
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
        {t('LABELS.cancel')}
        </CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : `${t('LABELS.save_changes')}`}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ProductModal;