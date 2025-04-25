import React, { useEffect, useState } from 'react';
import { getAPICall, post, postFormData, put } from '../../util/api';
import { CBadge, CButton, CCardHeader } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowThickToBottom, cilArrowThickToTop, cilSettings } from '@coreui/icons';

function RawMaterial() {
  const [tableData, setTableData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  console.log(tableData);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file',selectedFile);
    console.log(formData);
  
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

  async function getData() {
    const response = await getAPICall('/api/raw-materials');
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
        await put(`/api/raw-materials/${item.id}`, { "unit_qty": quantity });
        
        // Clear the input for this item
        setQuantities((prev) => ({ ...prev, [item.id]: '' }));
        // getData();
        searchMaterials();
      } catch (e) {
        alert("You have entered more than the maximum capacity allowed for this item.");
        setQuantities((prev) => ({ ...prev, [item.id]: '' }));
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
    
  // Debounce effect - updates debouncedSearchTerm after 1 second
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
      const response = await getAPICall(`/api/serchRawMaterials?search=${debouncedSearchTerm}`);
      setTableData(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch data when debouncedSearchTerm changes
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
      // If search is empty, fetch all data
      searchMaterials();
    } else {
      // Fetch data filtered by search term
      searchMaterials();
    }
  }, [debouncedSearchTerm]);
    
  return (
    <div className="p-4">

 <CCardHeader style={{ backgroundColor: '#d6eaff', marginBottom:'10px'}} className='p-2 rounded'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0" >Raw Materials Inventory </h5> 
           
          </div>
        </CCardHeader>

      {/* <div>
        <h3 className='mb-3'>Raw Materials Inventory</h3>
      </div> */}

      <div className='flex-1' style={{marginBottom:10}}> 
        <div className="d-flex align-items-center gap-5">
          <div className='flex-col col-mb4'>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name"
              className="form-control"
            />
          </div>
          <div className='d-flex gap-3'>
            <CButton color="primary" onClick={handleDownload}>
              <CIcon icon={cilArrowThickToBottom} size="sm" style={{marginRight:3}}/>
              Download Template
            </CButton>
            
            <CButton
              color={selectedFile ? "primary":"primary"} 
              variant={selectedFile ? "solid" : "outline"}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {!selectedFile && (<CIcon icon={cilArrowThickToTop} size="sm" style={{marginRight:3}}/>)}
              {selectedFile ? `${selectedFile.name}`:"CSV File"}  
            </CButton>
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            accept=".csv"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <CButton
              color="success"
              disabled={uploading}
              onClick={handleSubmit}
            >
              {uploading ? 'Uploading...' : 'Submit'}
            </CButton>
          )}
        </div>
      </div>

      <div className="table-container" style={{ height: '400px', overflow: 'auto' }}>
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#f8f9fa' }}>
            <tr>
              <th>Name</th>
              <th>Packaging</th>
              <th>Capacity</th>
              <th>Stock Indicator</th>
              <th>Available Stock</th>
              <th style={{ width: '120px' }}>Quantity</th>
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <span className={`badge ${item.isPackaging ? 'bg-info' : 'bg-secondary'}`}>
                    {item.isPackaging ? 'Yes' : 'No'}
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
                      ? 'Empty Soon'
                      : item.min_qty === 2
                      ? 'Moderate'
                      : 'Sufficient'}
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
                    placeholder="Qty"
                  />
                </td>
                <td>
                  <button
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() => handleAddClick(item)}
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add custom CSS for strobe animation */}
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