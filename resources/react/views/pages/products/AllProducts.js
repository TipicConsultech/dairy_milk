import React, { useEffect, useState } from 'react';
import { CBadge, CCardHeader, CRow } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import ProductModal from './ProductModals';


const AllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const response = await getAPICall('/api/getCombinedProducts');
      setProducts(response.data);
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (p) => {
    setDeleteProduct(p);
    setDeleteModalVisible(true);
  };

  const onDelete = async () => {
    try {
      await deleteAPICall('/api/product/' + deleteProduct.id);
      setDeleteModalVisible(false);
      fetchProducts();
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
    }
  };

  const handleEdit = (p) => {
    setSelectedProduct(p);
    setEditModalVisible(true);
  };

  const columns = [
    {
      accessorKey: 'source_type',
      header: 'Product Type',
      Cell: ({ cell }) => (
        cell.row.original.source_type === "retail" ? (
          <CBadge color="success">Retail</CBadge>
        ) : (
          <CBadge color="info">Factory</CBadge>
        )
      ),
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'local_name', header: 'Local Name' },
    {
      accessorKey: 'sellingPrice',
      header: 'Price',
      Cell: ({ cell }) => {
        const price = cell.row.original.price; 
          
        return price ? `${price} ₹` : '';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ cell }) => (
        cell.row.original.is_visible == true ? (
          <CBadge color="success">Visible</CBadge>
        ) : (
          <CBadge color="danger">Hidden</CBadge>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      Cell: ({ cell }) => (
        <div>
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
          >
            Edit
          </CBadge>
          &nbsp;
          {/* <CBadge
            role="button"
            color="danger"
            onClick={() => handleDelete(cell.row.original)}
          >
            Delete
          </CBadge> */}
        </div>
      ),
    },
  ];

  const data = products.map((p, index) => ({
    ...p,
    index: index + 1,
  }));

  return (
     <div className="p-0">
          <CCardHeader style={{ backgroundColor: '#d6eaff'}} className='p-2  rounded'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >All Products </h5> 
            </div>
          </CCardHeader>
          <div className="p-3">
   <CRow>
      <ConfirmationModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        onYes={onDelete}
        resource={'Delete product - ' + deleteProduct?.name}
      />
      
      {selectedProduct && (
        <ProductModal
          productId={selectedProduct.id}
          sourceType={selectedProduct.source_type}
          visible={editModalVisible}
          setVisible={setEditModalVisible}
          onSuccess={fetchProducts}
        />
      )}
      
      <MantineReactTable 
        columns={columns} 
        data={data} 
        enableFullScreenToggle={false}
        // initialState={{
        //   density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
        // }}
        
      />
    </CRow>
    </div>
    </div>
  );
};

export default AllProducts;