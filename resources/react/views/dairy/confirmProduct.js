import React, { useEffect, useState } from 'react';
import { getAPICall, post, postFormData, put } from '../../util/api';
import { 
  CAlert, 
  CBadge, 
  CButton, 
  CCardHeader, 
  CModal, 
  CModalHeader, 
  CModalTitle, 
  CModalBody, 
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CFormSelect,
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowThickToBottom, cilArrowThickToTop, cilSettings, cilWarning, cilPlus, cilX } from '@coreui/icons';
import { getUserData } from '../../util/session';
import { useTranslation } from 'react-i18next';


function ConfirmProduct() {
    const { t, i18n } = useTranslation("global");
  const [tableData, setTableData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [failedItems, setFailedItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertSingleProduct, setShowAlertSingleProduct] = useState(false);
  const [message,setMessage]=useState(null);
  const [failAlert, setFailAlert] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  console.log('table data',tableData);
  
  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    local_name: '',
    capacity: '',
    unit_qty: '0',
    unit: 'kg',
    isPackaging: false,
    isVisible: true,
    misc: ''
  });
  const [syncLocalName, setSyncLocalName] = useState(false);

  const user = getUserData();
    

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync local_name with name when checkbox is checked
  useEffect(() => {
    if (syncLocalName) {
      setFormData(prev => ({
        ...prev,
        local_name: prev.name
      }));
    }
  }, [syncLocalName, formData.name]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
   
    try {
      const res = await postFormData('/api/uploadCSVRawMaterial', formData);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };
  
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setShowAlertSingleProduct(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
     if (showAlertSingleProduct) {
      const timer = setTimeout(() => {
      
        setShowAlertSingleProduct(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [showAlert,showAlertSingleProduct]);

  useEffect(() => {
    if (failAlert) {
      const timer = setTimeout(() => {
        setFailAlert(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [failAlert]);

  async function getData() {
    const response = await getAPICall('/api/unConfirmProduct');
    setTableData(response.unconfirmed_products);
  }
  
  // Fixed handleQuantityChange to store quantities by item ID
  const handleQuantityChange = (id, value) => {
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [id]: value  // Store quantity by item ID
      }));
    }
  };

  console.log(quantities);
  

  // Fixed handleAddClick function
  const handleAddClick = async (item) => {
    const quantity = quantities[item.id];
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    }

    // Create the correct data structure
    const data = {
      "product_tracker_id": item.id,  // Use the actual item ID
      "actual_quantity": parseInt(quantity)  // Use the entered quantity
    };

    try {
      const resp = await post(`/api/confirmProduct`, data);  // Pass the data object
     
      if(resp?.failed){
        setFailedItems(resp?.failed);
        setFailAlert(true);
        setMessage(null);

      }
      else if(resp?.updated || resp?.status === 201){
        setShowAlertSingleProduct(true);
        setMessage(resp);
        // Clear only the specific item's quantity
        setQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[item.id];
          return newQuantities;
        });
        setFailedItems([]);
        getData(); // Refresh the data
      }
    } catch (e) {
      console.error('Error confirming product:', e);
      alert('Failed to confirm product');
      setMessage(null)
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/csv-download');
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'raw_materials_demo.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };
    
  const handleBulkAdd = async() => {
    const bulkData = Object.entries(quantities)
      .filter(([_, qty]) => qty && qty > 0)
      .map(([id, quantity]) => ({ id: parseInt(id), quantity: parseInt(quantity) }));
    
    try{
        const resp = await post('/api/uploadBulk', bulkData);
        if(resp?.failed){
            setFailedItems(resp?.failed)
        }
        else if(resp?.message==="Bulk update successful"){
            setQuantities({});
            setFailedItems([]);
            setShowAlert(true);
            getData(); // Refresh data after bulk update
        }
    }
    catch(e){
      console.error('Error in bulk update:', e);
    }
  };

  // Generate a shortened filename for mobile view
  const shortenFileName = (name) => {
    if (!name) return '';
    if (name.length <= 6) return name;
    const extension = name.split('.').pop();
    return `${name.substring(0, 4)}..${extension}`;
  };

  // Check if multiple rows have quantities entered
  const hasMultipleQuantities = Object.values(quantities).filter(qty => qty && qty > 0).length > 1;

  // Form handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleAddProduct = () => {
    // Reset form data and open modal
    setFormData({
      name: '',
      local_name: '',
      capacity: '',
      unit_qty: '0',
      unit: 'kg',
      isPackaging: false,
      isVisible: true,
      misc: ''
    });
    setSyncLocalName(false);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert numeric strings to numbers
      const payload = {
        ...formData,
        capacity: parseFloat(formData.capacity),
        unit_qty: parseFloat(formData.unit_qty),
      };

      const response = await post('/api/rawMaterialAdd', payload);
    
      if (response) {
        setShowModal(false);
        setShowAlert(true);
        getData(); // Refresh the table
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };
    
  return (
    <div className="p-0">
      <CCardHeader style={{ backgroundColor: '#d6eaff', marginBottom:'10px'}} className='p-2 rounded'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 className="mb-0" >Confirm Product </h5> 
        </div>
      </CCardHeader>

      {showAlert && (
        <CAlert color="success" onDismiss={() => setShowAlert(false)}>
          <div>✅{t('LABELS.productUpdateSuccess')}</div>  
        </CAlert>
      )}
      {showAlertSingleProduct && (
  <div
    className="alert alert-success alert-dismissible fade show"
    role="alert"
    onClick={() => setShowAlertSingleProduct(false)}
    style={{ cursor: 'pointer' }}
  >
    ✅ – 🧪 <strong>{message.product_name}</strong> ({message.product_local_name}) Created  Successfully – 📦 <strong>Batch No :</strong>{message.batch_name} – 🕒 <strong>Date</strong> {message.timestamp}
    <br />
    📊 <strong>Output:</strong> Actually <strong>{message.created_qty}&nbsp; {message.unit}</strong> created vs Predicted <strong>{Number(message.predicted_qty).toFixed(2)} &nbsp; {message.unit}</strong>
    {message?.skim_milk && (
      <>
        <br />🥛 <strong>Skim Milk:</strong> {message.skim_milk}  liter Created
      </>
    )}
  </div>
)}

      {failAlert && (
        <CAlert color="warning" onDismiss={() => setFailAlert(false)} className="d-flex align-items-center mb-2">
          <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
          <div>{t('LABELS.overCapacityWarning')}</div>
        </CAlert>
      )}

      {/* {failedItems.map((item, index) => (
        <CAlert key={index} color="warning" className="d-flex align-items-center mb-2">
          <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
          <div>
            Looks like you're trying to add {item.quantity} to <strong>{item.name}</strong>, but only <strong>{item.capacity - item.current_quantity}</strong> more can fit (limit <strong>{item.capacity}</strong>).
          </div>
        </CAlert>
      ))} */}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light " style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8f9fa' }}>
            <tr>
              <th>Batch name</th>
              <th>Predicted Qty</th>
              <th>Actual Qty</th>
              <th style={{ width: '100px' }}>{t('LABELS.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                <td>{item.batch_no}</td>
                <td>{Number(item.predicted_qty).toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={quantities[item.id] || ''}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    placeholder={t('LABELS.qty')}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() => handleAddClick(item)}
                    disabled={!quantities[item.id] || quantities[item.id] <= 0}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <CModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        alignment="center"
        size="lg"
      >
        <CModalHeader closeButton>
          <CModalTitle>{t('LABELS.add_raw_material')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleFormSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <CFormLabel htmlFor="name">{t('LABELS.material_name')}&nbsp;*</CFormLabel>
                <CFormInput
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <CFormCheck 
                  id="syncNameCheck"
                  label={t('LABELS.keep_name_and_local_name_same')}
                  checked={syncLocalName}
                  onChange={(e) => setSyncLocalName(e.target.checked)}
                  className="mt-1"
                />
              </div>
              <div className="col-md-6">
                <CFormLabel htmlFor="local_name">{t('LABELS.material_local_name')}&nbsp;*</CFormLabel>
                <CFormInput
                  id="local_name"
                  name="local_name"
                  value={formData.local_name}
                  onChange={handleInputChange}
                  disabled={syncLocalName}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <CFormLabel htmlFor="capacity">{t('LABELS.Capacity')}&nbsp;*</CFormLabel>
                <CFormInput
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-md-4">
                <CFormLabel htmlFor="unit_qty">{t('LABELS.quantity')}&nbsp;*</CFormLabel>
                <CFormInput
                  type="number"
                  id="unit_qty"
                  name="unit_qty"
                  value={formData.unit_qty}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-md-4">
                <CFormLabel htmlFor="unit">{t('LABELS.units')}&nbsp;*</CFormLabel>
                <CFormSelect
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  <option value="kg">{t('LABELS.Kilogram')}</option>
                  <option value="gm">{t('LABELS.grams')}</option>
                  <option value="ltr">{t('LABELS.liter')}</option>
                  <option value="ml">{t('LABELS.milli_liter')}</option>
                </CFormSelect>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <CFormCheck 
                    id="isPackaging"
                    name="isPackaging"
                    label={t('LABELS.is_packaging')}
                    checked={formData.isPackaging}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="d-flex align-items-center">
                  <CFormCheck 
                    id="isVisible"
                    name="isVisible"
                    label={t('LABELS.is_visible')}
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <CFormLabel htmlFor="misc">{t('LABELS.additional_notes')}</CFormLabel>
                <CFormInput
                  id="misc"
                  name="misc"
                  value={formData.misc}
                  onChange={handleInputChange}
                  placeholder={t('LABELS.any_additional_info')}
                />
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
          {t('LABELS.cancel')}
          </CButton>
          <CButton color="primary" onClick={handleFormSubmit} disabled={submitting}>
            {submitting ? <><CSpinner size="sm" /> {t('LABELS.saving')}</> : `${t('LABELS.save')}`}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Add custom CSS */}
      <style jsx>{`
        @keyframes strobeRed {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .table-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .table-container {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default ConfirmProduct;