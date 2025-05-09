import React, { useEffect, useState } from 'react';
import { CBadge, CButton, CCardHeader, CRow } from '@coreui/react';
import { MantineReactTable } from 'mantine-react-table';
import { deleteAPICall, getAPICall } from '../../../util/api';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../common/toast/ToastContext';
import ProductModal from './ProductModals';
import ProductForm from './NewProduct';
import { useTranslation } from 'react-i18next';


const AllProducts = () => {
   const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [deleteProduct, setDeleteProduct] = useState();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false)

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
      header: `${t('LABELS.product_type')}`,
      Cell: ({ cell }) => (
        cell.row.original.source_type === "retail" ? (
          <CBadge color="success">{t('LABELS.retail')}</CBadge>
        ) : (
          <CBadge color="info">{t('LABELS.factory')}</CBadge>
        )
      ),
    },
    { accessorKey: 'name', header: `${t('LABELS.product_name')}`, },
    { accessorKey: 'local_name', header: `${t('LABELS.product_local_name')}`, },
    {
      accessorKey: 'sellingPrice',
      header: `${t('LABELS.price')}`,
      Cell: ({ cell }) => {
        const price = cell.row.original.price; 
          
        return price ? `${price} ₹` : '';
      },
    },
    {
      accessorKey: 'status',
      header: `${t('LABELS.status')}`,
      Cell: ({ cell }) => (
        cell.row.original.is_visible == true ? (
          <CBadge color="success">{t('LABELS.visible')}</CBadge>
        ) : (
          <CBadge color="danger">{t('LABELS.hidden')}</CBadge>
        )
      ),
    },
    {
      accessorKey: 'actions',
      header: `${t('LABELS.action')}`,
      Cell: ({ cell }) => (
        <div>
          <CBadge
            role="button"
            color="info"
            onClick={() => handleEdit(cell.row.original)}
          >
           {t('LABELS.edit')}
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
              <h5 className="mb-0" >{t('LABELS.all_product')}</h5> 
            </div>
          </CCardHeader>
       <div  style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' ,paddingTop:'10px' ,paddingRight:'5px' }}>
            <CButton color="primary" onClick={()=>setShowModal(true)}>{t('LABELS.add_product')}</CButton>
       </div>
          <ProductForm 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
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
      />
    </CRow>
    </div>
    </div>
  );
};

export default AllProducts;