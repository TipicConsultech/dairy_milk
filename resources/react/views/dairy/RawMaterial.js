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


function RawMaterial() {
    const { t, i18n } = useTranslation("global");
  const [tableData, setTableData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedItems, setFailedItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [failAlert, setFailAlert] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    if (failAlert) {
      const timer = setTimeout(() => {
        setFailAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [failAlert]);

  async function getData() {
    const response = await getAPICall('/api/raw-materials');
    console.log(response);
    
    setTableData(response);
  }
  
  const handleQuantityChange = (id, value) => {
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleAddClick = async (item) => {
    const quantity = quantities[item.id];
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    } else {
      try {
        const resp = await put(`/api/raw-materials/${item.id}`, { "unit_qty": quantity });
       
        if(resp?.failed){
            setFailedItems(resp?.failed)
        }
        else if(resp?.updated){
            setShowAlert(true);
            setQuantities({});
            setFailedItems([]);
            searchMaterials();
        }
      } catch (e) {
        // Error handling
      }
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
    
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const searchMaterials = async () => {
    setLoading(true);
    try {
      const response = await getAPICall(`/api/searchRawMaterials?search=${debouncedSearchTerm}`);
      setTableData(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await getAPICall(`/api/serchRawMaterials?search=${debouncedSearchTerm}`);
        setTableData(response);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedSearchTerm === '') {
      searchMaterials();
    } else {
      searchMaterials();
    }
  }, [debouncedSearchTerm]);
  
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
        }
    }
    catch(e){
      // Error handling
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
          <h5 className="mb-0" >{t('LABELS.raw_materials_inventory')}</h5> 
        </div>
      </CCardHeader>

      {showAlert && (
        <CAlert color="success" onDismiss={() => setShowAlert(false)}>
          <div>✅{t('LABELS.productUpdateSuccess')}</div>  
        </CAlert>
      )}
      {failAlert && (
        <CAlert color="warning" onDismiss={() => setFailAlert(false)} className="d-flex align-items-center mb-2">
          <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
          <div>{t('LABELS.overCapacityWarning')}</div>                     {/* You have entered more than the maximum capacity allowed for this item. */}
        </CAlert>
      )}

      {failedItems.map((item, index) => (
        <CAlert key={index} color="warning" className="d-flex align-items-center mb-2">
          <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />
          <div>
            Looks like you're trying to add {item.quantity} to <strong>{item.name}</strong>, but only <strong>{item.capacity - item.current_quantity}</strong> more can fit (limit <strong>{item.capacity}</strong>).
          </div>
        </CAlert>
      ))}
   
      {/* Responsive Design for Controls */}
      <div className='mb-3'>
        {isMobile ? (
          /* Mobile View - Stacked Layout */
          <>
            {/* Row 1: Search Field */}
            <div className="mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('LABELS.search_name')}
                className="form-control"
              />
            </div>
            
            {/* Row 2: CSV Buttons */}
            <div className="d-flex gap-2 mb-2">
                
       {user?.type===1 &&(
        <CButton color="primary" onClick={handleDownload} style={{ flex: '1' }}>
        <CIcon icon={cilArrowThickToBottom} size="sm" style={{ marginRight: 3 }}/>
        {t('LABELS.template')}
         </CButton>
      
       )}
              

      {user?.type===1 && (
         <CButton
        color={selectedFile ? "primary" : "primary"} 
        variant={selectedFile ? "solid" : "outline"}
        onClick={() => document.getElementById('fileInput').click()}
        style={{ 
           flex: '1',
           overflow: 'hidden', 
           whiteSpace: 'nowrap', 
           textOverflow: 'ellipsis', 
           maxWidth: '150px', // limit button width
            // 👈 add right gap (you can adjust value)
           }}
       >
           {!selectedFile && (<CIcon icon={cilArrowThickToTop} size="sm" style={{ marginRight: 0 }}/>)}
           {selectedFile ? shortenFileName(selectedFile.name) : `${t('LABELS.upload_csv')}`}
       </CButton>
       )}

  

      
              {selectedFile && user?.type===1 && (
                <CButton
                  color="success"
                  disabled={uploading}
                  onClick={handleSubmit}
                  style={{ flex: '1',
                    marginRight: '8px'

                  }}
                >
                  {uploading ? `${t('LABELS.uplaoding')}` : `${t('LABELS.submit')}`}
                </CButton>
              )}
            </div>
            
            {/* Row 3: Action Buttons */}
            <div className="d-flex gap-2">
              <CButton
                color="success"
                onClick={handleAddProduct}
                style={{ flex: '1' }}
              >
                <CIcon icon={cilPlus} size="sm" style={{ marginRight: 3 }}/>
                {t('LABELS.add_material')}
              </CButton>
              
              {hasMultipleQuantities && (
                <CButton
                  color="danger"
                  onClick={handleBulkAdd}
                  style={{ flex: '1',
                    animation: 'strobeRed 0.5s infinite',
                    backgroundColor: '#ff0000',
                    color: 'white',
                   }}
                >
                 {t('LABELS.bulk_add')}
                </CButton>
              )}
            </div>
          </>
        ) : (
          /* Desktop View - Single Row Layout with right-aligned action buttons */
          <div className="d-flex align-items-center mb-2">
            {/* Left side - Search and CSV buttons */}
            <div className="d-flex gap-3 flex-grow-1">
              {/* Search field */}
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('LABELS.search_name')}
                  className="form-control"
                />
              </div>
              
              {/* CSV buttons */}
              <CButton color="primary" onClick={handleDownload}>
                <CIcon icon={cilArrowThickToBottom} size="sm" style={{ marginRight: 3 }}/>
                {t('LABELS.download_template')}
              </CButton>
              
              <CButton
                color={selectedFile ? "primary" : "primary"} 
                variant={selectedFile ? "solid" : "outline"}
                onClick={() => document.getElementById('fileInput').click()}
              >
                {!selectedFile && (<CIcon icon={cilArrowThickToTop} size="sm" style={{ marginRight: 3 }}/>)}
                {selectedFile ? selectedFile.name : `${t('LABELS.upload_csv')}`}
              </CButton>
              
              {selectedFile && (
                <CButton
                  color="success"
                  disabled={uploading}
                  onClick={handleSubmit}
                >
                  {uploading ? `${t('LABELS.uplaoding')}` : `${t('LABELS.submit')}`}
                </CButton>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="d-flex gap-2">
              <CButton
                color="success"
                onClick={handleAddProduct}
              >
                <CIcon icon={cilPlus} size="sm" style={{ marginRight: 3 }}/>
                {t('LABELS.add_material')}
              </CButton>
              
              {hasMultipleQuantities && (
  <CButton
    color="danger"
    onClick={handleBulkAdd}
    style={{
      animation: 'strobeRed 0.5s infinite',
      backgroundColor: '#ff0000',
      color: 'white',
    }}
  > 
  {t('LABELS.bulk_add')}
  </CButton>
)}

            </div>
          </div>
        )}

        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>

      <div className="table-container" style={{ height: '400px', overflow: 'auto', scrollbarWidth: 'none' }}>
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8f9fa' }}>
            <tr>
              <th>{t('LABELS.name')}</th>
              <th>{t('LABELS.packaging')}</th>
              <th>{t('LABELS.Capacity')}</th>
              <th>{t('LABELS.stock_indicator')}</th>
              <th>{t('LABELS.available_stock')}</th>
              <th style={{ width: '120px' }}>{t('LABELS.quantity')}</th>
              <th style={{ width: '100px' }}>{t('LABELS.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <span className={`badge ${item.isPackaging ? 'bg-info' : 'bg-secondary'}`}>
                    {item.isPackaging ? `${t('LABELS.yes')}` : `${t('LABELS.no')}`}
                  </span>
                </td>
                <td>{item.capacity}&nbsp;&nbsp;{item.unit}</td>
                <td>
                  <CBadge
                    style={
                      item.min_qty === 1
                      ? {
                          animation: 'strobeRed 0.5s infinite',
                          backgroundColor: '#ff0000',
                          color: 'white',
                        }
                      : item.min_qty === 2
                      ? {
                          backgroundColor: '#ffc107',
                          color: '#212529',
                        }
                      : {
                          backgroundColor: '#28a745',
                          color: 'white',
                        }
                    }
                  >
                    {item.min_qty === 1
                      ? `${t('LABELS.empty_soon')}`
                      : item.min_qty === 2
                      ? `${t('LABELS.moderate')}`
                      : `${t('LABELS.sufficient')}`}
                  </CBadge>
                </td>
                <td>{item.unit_qty}&nbsp;&nbsp;{item.unit}</td>
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
                  >
                    {t('LABELS.add')}
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

export default RawMaterial;