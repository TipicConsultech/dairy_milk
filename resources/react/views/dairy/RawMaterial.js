import React, { useEffect, useState } from 'react';
import { getAPICall, put } from '../../util/api';
import { CBadge, CButton } from '@coreui/react';

function RawMaterial() {
  const [tableData, setTableData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [file, setFile] = useState(null);

  console.log(tableData);
  
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

  const handleAddClick = async(item) => {
    const quantity = quantities[item.id];
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    }else{
        try{
        
        const response= await put(`/api/raw-materials/${item.id}`,{"unit_qty":quantity})
        }
        catch(e){
            console.alert(e)
        }
        getData();
      };
    }

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
      
      const handleSelectFile = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
      };
    
      const handleShare = async () => {
        if (!file) return alert('Please select a file first.');
    
        const phoneNumber = '917499254007'; // Your target WhatsApp number
    
        const message = encodeURIComponent(
            `Hi! Here's the CSV file: ${file.name}. Please check your downloads and upload the file manually.`
        );
    
        // Try Web Share API on mobile
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Share CSV',
                    text: 'Sharing CSV file...',
                    files: [file],
                });
                console.log('File shared successfully');
            } catch (error) {
                console.error('Sharing failed', error);
                alert('Failed to share the file. Try again.');
            }
        } else {
            // Fallback to WhatsApp link
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
            window.open(whatsappUrl, '_blank');
            alert('WhatsApp chat opened. Now attach the file manually.');
        }
    };
    
  return (
    <div className="p-4">
        <div>
            <h3 className='mb-3'>Raw Materials List</h3>

        </div>
        <CButton color="primary" className="mb-4 mr-3" onClick={handleDownload}>
      Download Demo CSV
    </CButton>

    <CButton color="primary" className=" mb-4" onClick={handleDownload}>
      Upload CSV
    </CButton>

    
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Packaging</th>
              <th>Capacity</th>
              <th>Stock Indicator</th>
              <th>Available Stock</th>
              {/* <th>Unit</th> */}
              {/* <th>Visible</th> */}
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
                {/* <td>{item.unit}</td> */}
               
                {/* <td>
                  <span className={`badge ${item.isVisible ? 'bg-success' : 'bg-danger'}`}>
                    {item.isVisible ? 'Yes' : 'No'}
                  </span>
                </td> */}
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
                      backgroundColor: '#ffc107', // Yellow (Bootstrap warning)
                      color: '#212529', // Dark text
                    }
                  : {
                      backgroundColor: '#28a745', // Green (Bootstrap success)
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
    </div>
  );
}

export default RawMaterial;
