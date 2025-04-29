import React, { useEffect, useState } from 'react';
import { getAPICall, postFormData, put } from '../../util/api';
import { CBadge, CButton, CCardHeader } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowThickToBottom, cilArrowThickToTop } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';

function RawMaterial() {
  const [tableData, setTableData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();  

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await postFormData('/api/uploadCSVRawMaterial', formData);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const getData = async () => {
    try {
      const response = await getAPICall('/api/factoryProducts');
      setTableData(response);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const searchMaterials = async () => {
    setLoading(true);
    try {
      const response = await getAPICall(`/api/searchfactoryProducts?search=${debouncedSearchTerm}`);
      setTableData(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (id, value) => {
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setQuantities((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleAddClick = async (item) => {
    
    navigate(`/invoice?id=${item.id}`);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/csv-download');
      if (!response.ok) throw new Error('Failed to download file');

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
    getData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    searchMaterials();
  }, [debouncedSearchTerm]);

  return (
    <div className="p-4">

<CCardHeader style={{ backgroundColor: '#d4edda', marginBottom:'10px'}} className='p-2 rounded'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0" >Factory Product Inventory </h5> 
           
          </div>
        </CCardHeader>

      {/* <h3 className="mb-3">Final Product Inventory</h3> */}

      <div className="d-flex align-items-center col-4 gap-4 mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name"
          className="form-control"
        />
        {/* <CButton color="primary" onClick={handleDownload}>
          <CIcon icon={cilArrowThickToBottom} size="sm" className="me-2" />
          Download Template
        </CButton>
        <CButton
          color="primary"
          variant={selectedFile ? "solid" : "outline"}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {!selectedFile && <CIcon icon={cilArrowThickToTop} size="sm" className="me-2" />}
          {selectedFile ? selectedFile.name : 'CSV File'}
        </CButton>
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          accept=".csv"
          onChange={handleFileChange}
        />
        {selectedFile && (
          <CButton color="success" disabled={uploading} onClick={handleCSVUpload}>
            {uploading ? 'Uploading...' : 'Submit'}
          </CButton>
        )} */}
      </div>

      <div className="table-container" style={{ height: '400px', overflow: 'auto' }}>
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Capacity</th>
              <th>Stock Indicator</th>
              <th>Available Stock</th>
             
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                ₹&nbsp;{item.price}
                </td>
                <td>{item.capacity}&nbsp;{item.unit}</td>
                <td>
                  <CBadge
                    style={{
                      backgroundColor:
                        item.min_qty === 1
                          ? '#ff0000'
                          : item.min_qty === 2
                          ? '#ffc107'
                          : '#28a745',
                      color: item.min_qty === 2 ? '#212529' : '#fff',
                      animation: item.min_qty === 1 ? 'strobeRed 0.5s infinite' : 'none',
                    }}
                  >
                    {item.min_qty === 1
                      ? 'Empty Soon'
                      : item.min_qty === 2
                      ? 'Moderate'
                      : 'Sufficient'}
                  </CBadge>
                </td>
                <td>{item.quantity}&nbsp;{item.unit}</td>
                
                <td>
                  <button
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() => handleAddClick(item)}
                  >
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @keyframes strobeRed {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default RawMaterial;
