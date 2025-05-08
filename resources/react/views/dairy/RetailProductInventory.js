import React, { useEffect, useState } from 'react';
import { getAPICall, postFormData, put } from '../../util/api';
import { CBadge, CButton, CCardHeader } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowThickToBottom, cilArrowThickToTop } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
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
      const params = new URLSearchParams({type: 2 })
      const response = await getAPICall(`/api/finalProductInventory?${params.toString()}`);
      setTableData(response);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  const searchMaterials = async () => {
    setLoading(true);
    const params = new URLSearchParams({ search: debouncedSearchTerm, type: 2 });
    try {
     
      const response = await getAPICall(`/api/searchByProductNameFinalInventry?${params.toString()}`);
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
    <div className="p-0">

<CCardHeader style={{ backgroundColor: '#d4edda', marginBottom:'10px'}} className='p-2 rounded'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 className="mb-0" >{t('LABELS.retail_product_inventory')}</h5>

          </div>
        </CCardHeader>

      {/* <h3 className="mb-3">Final Product Inventory</h3> */}

      <div className="d-flex align-items-center mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('LABELS.search_name')}
          className="form-control w-100"
          style={{ maxWidth: '500px', width: '100%' }}
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

      <div className="table-container" style={{ height: '600px', overflow: 'auto' }}>
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
            <th>{t('LABELS.name')}</th>
              <th>{t('LABELS.price')}</th>
              <th>{t('LABELS.available_stock')}</th>
              <th>{t('LABELS.stock_indicator')}</th>
              {/* <th>Weight</th> */}
              <th>{t('LABELS.Capacity')}</th>



              <th style={{ width: '100px' }}>{t('LABELS.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>₹&nbsp;{item.dPrice}</td>
                <td>{item.qty}&nbsp;units</td>
                {/* <td>
                {item.label_value}&nbsp;{item.unit}
                </td> */}

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
                      ? `${t('LABELS.empty_soon')}`
                      : item.min_qty === 2
                      ? `${t('LABELS.moderate')}`
                      :`${t('LABELS.sufficient')}`}
                  </CBadge>
                </td>
                <td>{item.max_stock}</td>

                <td>
                  <button
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() => handleAddClick(item)}
                  >
                    {t('LABELS.invoice')}
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
        @media (max-width: 768px) {
          input.form-control {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default RawMaterial;
