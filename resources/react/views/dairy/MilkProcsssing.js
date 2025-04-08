import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';

const MilkProcessing = () => {
  const navigate = useNavigate();
     const { t, i18n } = useTranslation("global")
          const lng = i18n.language;

  const [tanks, setTanks] = useState([
    { id: t('LABELS.tank'), capacity: 500, currentCapacity: 500 },
    { id: t('LABELS.tank'), capacity: 700, currentCapacity: 700 },
    { id: t('LABELS.tank'), capacity: 600, currentCapacity: 600 }
  ]);
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [milkOut, setMilkOut] = useState('');
  const [totalMilk, setTotalMilk] = useState('');
  const [processedMilk, setProcessedMilk] = useState('');
  const [ingredients, setIngredients] = useState([
  ]);
  const [processedProducts, setProcessedProducts] = useState([
    {
      tank: t('LABELS.tank'),
      totalMilk: 250,
      milkOut: 200,
      ingredients: [
        { name: t('LABELS.sugar'), quantity: 10 },
        { name: t('LABELS.salt'), quantity: 5 },
        { name: t('LABELS.foodColor'), quantity: 3 }
      ],
      processedMilk: 218 ,
      timestamp: '2024-03-15 10:30:00'
    },
    {
      tank: t('LABELS.tank'),
      totalMilk: 350,
      milkOut: 300,
      ingredients: [
        { name: t('LABELS.sugar'), quantity: 15 },
        { name: t('LABELS.sweetener'), quantity: 2 },
        { name: t('LABELS.naturalColor'), quantity: 3 }
      ],
      processedMilk: 320,
      timestamp: '2024-03-16 14:45:00'
    },
    {
      tank: t('LABELS.tank'),
      totalMilk: 450,
      milkOut: 400,
      ingredients: [
        { name: t('LABELS.naturalColor'), quantity: 20 },
        { name: t('LABELS.sweetener'), quantity: 8 },
        { name: t('LABELS.foodColor'), quantity: 1 },
        { name: t('LABELS.sugar'), quantity: 4 }
      ],
      processedMilk: 433,
      timestamp: '2024-03-17 09:15:00'
    }
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProductForCreation, setSelectedProductForCreation] = useState(null);
  const [customIngredient, setCustomIngredient] = useState('');

  // Calculate total milk and update tank capacity
  useEffect(() => {
    if (selectedTank && milkOut) {
      const tankIndex = tanks.findIndex(tank => tank.id === selectedTank);
      if (tankIndex !== -1) {
        const totalIngredientQuantity = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
        const calculatedTotalMilk = Number(milkOut) + totalIngredientQuantity;

        setTotalMilk(calculatedTotalMilk.toFixed(2));
        setProcessedMilk(calculatedTotalMilk.toFixed(2));
      }
    }
  }, [selectedTank, milkOut, ingredients]);

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity) {
      alert('Please select an ingredient and enter a quantity');
      return;
    }

    // Handle custom ingredient
    const ingredientName = selectedIngredient === 'other'
      ? (customIngredient.trim() || 'Custom Ingredient')
      : selectedIngredient;

    const existingIngredientIndex = ingredients.findIndex(
      ing => ing.name.toLowerCase() === ingredientName.toLowerCase()
    );

    if (existingIngredientIndex !== -1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients[existingIngredientIndex].quantity =
        Number(updatedIngredients[existingIngredientIndex].quantity) + Number(quantity);
      setIngredients(updatedIngredients);
    } else {
      setIngredients([
        ...ingredients,
        {
          name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
          quantity: Number(quantity)
        }
      ]);
    }

    // Reset inputs
    setSelectedIngredient('');
    setQuantity('');
    setCustomIngredient('');
  };

  const handleSaveProcess = () => {
    if (!selectedTank || !milkOut) {
      alert('Please select a tank and enter milk out quantity');
      return;
    }

    // Update tank capacity
    const updatedTanks = tanks.map(tank => {
      if (tank.id === selectedTank) {
        const milkOutQuantity = Number(milkOut);
        return {
          ...tank,
          currentCapacity: tank.currentCapacity - milkOutQuantity
        };
      }
      return tank;
    });
    setTanks(updatedTanks);

    const newProduct = {
      tank: selectedTank,
      totalMilk: Number(totalMilk),
      milkOut: Number(milkOut),
      ingredients: [...ingredients],
      processedMilk: Number(processedMilk),
      timestamp: new Date().toLocaleString()
    };

    setProcessedProducts([...processedProducts, newProduct]);
    setModalVisible(true);

    // Reset form
    setSelectedTank('');
    setMilkOut('');
    setTotalMilk('');
    setProcessedMilk('');
    setIngredients([
      { name: t('LABELS.sugar'), quantity: 10 },
      { name: t('LABELS.salt'), quantity: 1 },
      { name: t('LABELS.naturalColor'), quantity: 5 },
      { name: t('LABELS.milkSolids'), quantity: 2 },
      { name: t('LABELS.calciumFortifier'), quantity: 3 }
    ]);

    navigate('/CreateProduct');
  };

  const handleCreateProduct = (product) => {
    setSelectedProductForCreation(product);
    setProductModalVisible(true);
  };

  return (
    <CCard className="p-4 max-w-2xl mx-auto  rounded-lg mt-10"> 
      <CCardHeader style={{ backgroundColor: "#E6E6FA" }}>
        <h2>{t(`LABELS.milk_processing`)}</h2>
      </CCardHeader>  

      {/* Tank Capacity Display */}
      <CCard className="mb-4 mt-4">
        <CCardHeader style={{
          backgroundColor: '#d4edda',
          color: 'black',
          fontWeight: 'bold'
        }}>
          {t(`LABELS.tank_capacity`)}
        </CCardHeader>
        <CCardBody>
          <CRow>
            {tanks.map((tank, index) => (
              <CCol key={index} md={4}>
                <div className="text-center">
                  <strong>{t(`LABELS.tank`)}{tank.id}</strong>
                  <div>
                  {t('LABELS.currentCapacity')}: {tank.currentCapacity} / {tank.capacity} {t('LABELS.Ltr')}
                  </div>
                </div>
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>

      {/* Processing Details Form */}
      <CCard className="mb-4">
        <CCardHeader style={{
          backgroundColor: '#d6eaff',
          color: 'black',
          fontWeight: 'bold'
        }}>
          {t('LABELS.processing_details')}
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CForm className="d-flex align-items-center">
                <span className="me-2" style={{ minWidth: '100px' }}>{t('LABELS.select_tank')}</span>
                <CFormSelect
                  value={selectedTank}
                  onChange={(e) => setSelectedTank(e.target.value)}
                  className="flex-grow-1"
                >
                  <option value="">{t('LABELS.select_tank')}</option>
                  {tanks.map((tank, index) => (
                    <option key={index} value={tank.id}>
                      {tank.id} ({tank.currentCapacity} {t('LABELS.Ltr')})
                    </option>
                  ))}
                </CFormSelect>
              </CForm>
            </CCol>
            <CCol md={6}>
              <CForm className="d-flex align-items-center">
                <span className="me-2" style={{ minWidth: '100px' }}>{t('LABELS.milk_out')}</span>
                <CFormInput
                  type="number"
                  placeholder={t('LABELS.addQuantity')}
                  value={milkOut}
                  onChange={(e) => setMilkOut(e.target.value)}
                  className="flex-grow-1"
                  max={tanks.find(tank => tank.id === selectedTank)?.currentCapacity || 0}
                />
              </CForm>
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CForm className="d-flex align-items-center">
                <span className="me-2" style={{ minWidth: '100px' }}>{t('LABELS.ingredients')}</span>
                <CFormSelect
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="me-2 flex-grow-1"
                >
                  <option value="">{t('LABELS.selectIngredient')}</option>
                  <option value="sugar">{t('LABELS.sugar')}</option>
                  <option value="color">{t('LABELS.salt')}</option>
                  <option value="cream">{t('LABELS.milkSolids')}</option>
                  {/* <option value="preservative">Preservative</option>
                  <option value="flavoring">Flavoring</option> */}
                  <option value="other">{t('LABELS.other')}</option>
                </CFormSelect>
                {selectedIngredient === 'other' && (
                  <CFormInput
                    type="text"
                    placeholder="Custom Ingredient"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    className="me-2"
                    style={{ width: '150px' }}
                  />
                )}
                <CFormInput
                  type="number"
                  placeholder={t('LABELS.quantity')}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="me-2"
                  style={{ width: '100px' }}
                />
                <CButton color="success" onClick={handleAddIngredient}>
                  +
                </CButton>
              </CForm>
            </CCol>
            <CCol md={6}>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="d-flex justify-content-between mb-2">
                  <span>{ingredient.name}</span>
                  <span>{ingredient.quantity} {t('LABELS.kg')}</span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      const updatedIngredients = ingredients.filter((_, i) => i !== index);
                      setIngredients(updatedIngredients);
                    }}
                  >
                    -
                  </button>
                </div>
              ))}
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CForm className="d-flex align-items-center">
                <span className="me-2" style={{ minWidth: '100px' }}>{t('LABELS.processed_milk_quantity')}</span>
                <CFormInput
                  type="number"
                  placeholder={t('LABELS.processed_milk_quantity')}
                  value={processedMilk}
                  readOnly
                  className="flex-grow-1"
                />
              </CForm>
            </CCol>
          </CRow>

          <CRow>
            <CCol className="d-flex justify-content-between">
              <CButton color="secondary" className="me-2"> 
              {t('LABELS.save_for_later')}
              </CButton>
              <CButton color="primary" onClick={handleSaveProcess}> 
              {t('LABELS.save_produce')}
              </CButton>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Processed Products List */}
      {processedProducts.length > 0 && (
        <CCard className="mb-4">
          <CCardHeader style={{
            backgroundColor: '#f9f5d7',
            color: 'black',
            fontWeight: 'bold'
          }}> 
            {t('LABELS.processed_products')}
          </CCardHeader>
          <CCardBody>
            <CTable striped hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{t('LABELS.tank')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('LABELS.total_milk')}</CTableHeaderCell> 
                  <CTableHeaderCell>{t('LABELS.milk_removed')}</CTableHeaderCell> 
                  <CTableHeaderCell>{t('LABELS.ingredient')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('LABELS.processedMilk')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('LABELS.processing_date')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('LABELS.action')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {processedProducts.map((product, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{product.tank}</CTableDataCell>
                    <CTableDataCell>{product.totalMilk} {t('LABELS.Ltr')}</CTableDataCell>
                    <CTableDataCell>{product.milkOut} {t('LABELS.Ltr')}</CTableDataCell>
                    <CTableDataCell>
                      {product.ingredients.map(ing => `${ing.name}: ${ing.quantity} ${t('LABELS.kg')}`).join(', ')}
                    </CTableDataCell>
                    <CTableDataCell>{product.processedMilk.toFixed(2)} {t('LABELS.Ltr')}</CTableDataCell>
                    <CTableDataCell>{product.timestamp}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="success"
                        size="sm"
                        onClick={() => handleCreateProduct(product)}
                      >
                       {t('LABELS.Productcreate')}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {/* Confirmation Modal */}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Processing Completed</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Product processing has been saved successfully!
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setModalVisible(false)}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Create Product Modal */}
      <CModal
        visible={productModalVisible}
        onClose={() => setProductModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Create Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedProductForCreation && (
            <div>
              <p><strong>Tank:</strong> {selectedProductForCreation.tank}</p>
              <p><strong>Total Milk:</strong> {selectedProductForCreation.totalMilk} {t('LABELS.Ltr')}</p>
              <p><strong>Ingredients:</strong></p>
              <ul>
                {selectedProductForCreation.ingredients.map((ing, index) => (
                  <li key={index}>{ing.name}: {ing.quantity} {t('LABELS.kg')}</li>
                ))}
              </ul>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            onClick={() => {
              // Add logic for actual product creation
              alert('Product Created Successfully!');
              setProductModalVisible(false);
            }}
          >
            Confirm Create
          </CButton>
          <CButton
            color="secondary"
            onClick={() => setProductModalVisible(false)}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default MilkProcessing;

//------------------------------------------
//--V2--
//------------------------------------------
// import React, { useState, useEffect } from 'react';
// import {
//   CContainer,
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CRow,
//   CCol,
//   CForm,
//   CFormSelect,
//   CFormInput,
//   CButton,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CTable,
//   CTableHead,
//   CTableRow,
//   CTableHeaderCell,
//   CTableBody,
//   CTableDataCell
// } from '@coreui/react';
// import '@coreui/coreui/dist/css/coreui.min.css';

// const MilkProcessing = () => {
//   const [tanks, setTanks] = useState([
//     { id: 'Tank 1', capacity: 500, currentCapacity: 500 },
//     { id: 'Tank 2', capacity: 700, currentCapacity: 700 },
//     { id: 'Tank 3', capacity: 600, currentCapacity: 600 }
//   ]);
//   const [selectedTank, setSelectedTank] = useState('');
//   const [selectedIngredient, setSelectedIngredient] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [milkOut, setMilkOut] = useState('');
//   const [totalMilk, setTotalMilk] = useState('');
//   const [processedMilk, setProcessedMilk] = useState('');
//   const [ingredients, setIngredients] = useState([
//     { name: 'Sugar', quantity: 10 },
//     { name: 'Color', quantity: 1 },
//     { name: 'Cream', quantity: 5 },
//     { name: 'Preservative', quantity: 2 },
//     { name: 'Flavoring', quantity: 3 }
//   ]);
//   const [processedProducts, setProcessedProducts] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [productModalVisible, setProductModalVisible] = useState(false);
//   const [selectedProductForCreation, setSelectedProductForCreation] = useState(null);
//   const [customIngredient, setCustomIngredient] = useState('');

//   // New states for product creation
//   const [productName, setProductName] = useState('');
//   const [productType, setProductType] = useState('');
//   const [productVariety, setProductVariety] = useState('');
//   const [productPackaging, setProductPackaging] = useState('');
//   const [productShelfLife, setProductShelfLife] = useState('');

//   // Predefined product options
//   const productTypes = ['Milk', 'Yogurt', 'Cheese', 'Cream', 'Buttermilk'];
//   const productVarieties = {
//     'Milk': ['Whole Milk', 'Skimmed Milk', 'Low Fat Milk', 'Flavored Milk'],
//     'Yogurt': ['Plain Yogurt', 'Greek Yogurt', 'Fruit Yogurt', 'Probiotic Yogurt'],
//     'Cheese': ['Cheddar', 'Mozzarella', 'Paneer', 'Cottage Cheese'],
//     'Cream': ['Heavy Cream', 'Whipping Cream', 'Sour Cream'],
//     'Buttermilk': ['Traditional', 'Low Fat', 'Flavored']
//   };
//   const packagingOptions = ['Bottle', 'Packet', 'Tetra Pack', 'Container', 'Pouch'];

//   // Calculate total milk and update tank capacity
//   useEffect(() => {
//     if (selectedTank && milkOut) {
//       const totalIngredientQuantity = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
//       const calculatedTotalMilk = Number(milkOut) + totalIngredientQuantity;

//       setTotalMilk(calculatedTotalMilk.toFixed(2));
//       setProcessedMilk(calculatedTotalMilk.toFixed(2));
//     }
//   }, [selectedTank, milkOut, ingredients]);

//   const handleAddIngredient = () => {
//     if (!selectedIngredient || !quantity) {
//       alert('Please select an ingredient and enter a quantity');
//       return;
//     }

//     const ingredientName = selectedIngredient === 'other'
//       ? (customIngredient.trim() || 'Custom Ingredient')
//       : selectedIngredient;

//     const existingIngredientIndex = ingredients.findIndex(
//       ing => ing.name.toLowerCase() === ingredientName.toLowerCase()
//     );

//     if (existingIngredientIndex !== -1) {
//       const updatedIngredients = [...ingredients];
//       updatedIngredients[existingIngredientIndex].quantity += Number(quantity);
//       setIngredients(updatedIngredients);
//     } else {
//       setIngredients([
//         ...ingredients,
//         {
//           name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
//           quantity: Number(quantity)
//         }
//       ]);
//     }

//     // Reset inputs
//     setSelectedIngredient('');
//     setQuantity('');
//     setCustomIngredient('');
//   };

//   const handleSaveProcess = () => {
//     if (!selectedTank || !milkOut) {
//       alert('Please select a tank and enter milk out quantity');
//       return;
//     }

//     // Update tank capacity
//     const updatedTanks = tanks.map(tank => {
//       if (tank.id === selectedTank) {
//         const milkOutQuantity = Number(milkOut);
//         return {
//           ...tank,
//           currentCapacity: tank.currentCapacity - milkOutQuantity
//         };
//       }
//       return tank;
//     });
//     setTanks(updatedTanks);

//     const newProduct = {
//       tank: selectedTank,
//       totalMilk: Number(totalMilk),
//       milkOut: Number(milkOut),
//       ingredients: [...ingredients],
//       processedMilk: Number(processedMilk),
//       timestamp: new Date().toLocaleString()
//     };

//     setProcessedProducts([...processedProducts, newProduct]);
//     setModalVisible(true);

//     // Reset form
//     setSelectedTank('');
//     setMilkOut('');
//     setTotalMilk('');
//     setProcessedMilk('');
//     setIngredients([
//       { name: 'Sugar', quantity: 10 },
//       { name: 'Color', quantity: 1 },
//       { name: 'Cream', quantity: 5 },
//       { name: 'Preservative', quantity: 2 },
//       { name: 'Flavoring', quantity: 3 }
//     ]);
//   };

//   const handleCreateProduct = (product) => {
//     setSelectedProductForCreation(product);

//     // Reset product creation fields
//     setProductName('');
//     setProductType('');
//     setProductVariety('');
//     setProductPackaging('');
//     setProductShelfLife('');

//     setProductModalVisible(true);
//   };

//   const handleConfirmProductCreation = () => {
//     if (!productName || !productType || !productVariety || !productPackaging || !productShelfLife) {
//       alert('Please fill in all product details');
//       return;
//     }

//     const finalProduct = {
//       ...selectedProductForCreation,
//       productDetails: {
//         name: productName,
//         type: productType,
//         variety: productVariety,
//         packaging: productPackaging,
//         shelfLife: productShelfLife
//       }
//     };

//     console.log('Final Product Created:', finalProduct);
//     alert('Product Created Successfully!');
//     setProductModalVisible(false);
//   };

//   return (
//     <CContainer>
//       <h1 className="text-center my-4">Milk Processing System</h1>

//       {/* Tank Capacity Section */}
//       <CCard className="mb-4">
//         <CCardHeader>Tank Capacities</CCardHeader>
//         <CCardBody>
//           <CRow>
//             {tanks.map((tank, index) => (
//               <CCol key={index} md={4}>
//                 <div>
//                   <strong>{tank.id}</strong>
//                   <div>
//                     Current Capacity: {tank.currentCapacity} / {tank.capacity} Liters
//                   </div>
//                 </div>
//               </CCol>
//             ))}
//           </CRow>
//         </CCardBody>
//       </CCard>

//       {/* Processing Form */}
//       <CCard className="mb-4">
//         <CCardHeader>Processing Details</CCardHeader>
//         <CCardBody>
//           <CRow className="mb-3">
//             <CCol md={6}>
//               <CForm>
//                 <CFormSelect
//                   value={selectedTank}
//                   onChange={(e) => setSelectedTank(e.target.value)}
//                   label="Select Tank"
//                 >
//                   <option value="">Select Tank</option>
//                   {tanks.map((tank, index) => (
//                     <option key={index} value={tank.id}>
//                       {tank.id} ({tank.currentCapacity} Liters available)
//                     </option>
//                   ))}
//                 </CFormSelect>
//               </CForm>
//             </CCol>
//             <CCol md={6}>
//               <CForm>
//                 <CFormInput
//                   type="number"
//                   label="Enter Milk Out"
//                   value={milkOut}
//                   onChange={(e) => setMilkOut(e.target.value)}
//                   max={tanks.find(tank => tank.id === selectedTank)?.currentCapacity || 0}
//                 />
//               </CForm>
//             </CCol>
//           </CRow>

//           {/* Ingredient Addition Section */}
//           <CRow className="mb-3">
//             <CCol md={6}>
//               <CForm className="d-flex align-items-center">
//                 <CFormSelect
//                   value={selectedIngredient}
//                   onChange={(e) => setSelectedIngredient(e.target.value)}
//                   className="me-2"
//                 >
//                   <option value="">Select Ingredient</option>
//                   <option value="sugar">Sugar</option>
//                   <option value="color">Color</option>
//                   <option value="cream">Cream</option>
//                   <option value="preservative">Preservative</option>
//                   <option value="flavoring">Flavoring</option>
//                   <option value="other">Other</option>
//                 </CFormSelect>
//                 {selectedIngredient === 'other' && (
//                   <CFormInput
//                     type="text"
//                     placeholder="Custom Ingredient"
//                     value={customIngredient}
//                     onChange={(e) => setCustomIngredient(e.target.value)}
//                     className="me-2"
//                   />
//                 )}
//                 <CFormInput
//                   type="number"
//                   placeholder="Qty"
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value)}
//                   className="me-2"
//                   style={{ width: '100px' }}
//                 />
//                 <CButton color="success" onClick={handleAddIngredient}>
//                   Add
//                 </CButton>
//               </CForm>
//             </CCol>
//             <CCol md={6}>
//               {ingredients.map((ingredient, index) => (
//                 <div key={index} className="d-flex justify-content-between mb-2">
//                   <span>{ingredient.name}</span>
//                   <span>{ingredient.quantity} kg</span>
//                   <CButton
//                     color="danger"
//                     size="sm"
//                     onClick={() => {
//                       const updatedIngredients = ingredients.filter((_, i) => i !== index);
//                       setIngredients(updatedIngredients);
//                     }}
//                   >
//                     Remove
//                   </CButton>
//                 </div>
//               ))}
//             </CCol>
//           </CRow>

//           {/* Save Processing Button */}
//           <CRow>
//             <CCol className="d-flex justify-content-end">
//               <CButton color="primary" onClick={handleSaveProcess}>
//                 Save Process
//               </CButton>
//             </CCol>
//           </CRow>
//         </CCardBody>
//       </CCard>

//       {/* Processed Products Table */}
//       {processedProducts.length > 0 && (
//         <CCard>
//           <CCardHeader>Processed Products</CCardHeader>
//           <CCardBody>
//             <CTable striped hover>
//               <CTableHead>
//                 <CTableRow>
//                   <CTableHeaderCell>Tank</CTableHeaderCell>
//                   <CTableHeaderCell>Total Milk</CTableHeaderCell>
//                   <CTableHeaderCell>Ingredients</CTableHeaderCell>
//                   <CTableHeaderCell>Processed Date</CTableHeaderCell>
//                   <CTableHeaderCell>Actions</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {processedProducts.map((product, index) => (
//                   <CTableRow key={index}>
//                     <CTableDataCell>{product.tank}</CTableDataCell>
//                     <CTableDataCell>{product.totalMilk} Liters</CTableDataCell>
//                     <CTableDataCell>
//                       {product.ingredients.map(ing => `${ing.name}: ${ing.quantity} kg`).join(', ')}
//                     </CTableDataCell>
//                     <CTableDataCell>{product.timestamp}</CTableDataCell>
//                     <CTableDataCell>
//                       <CButton
//                         color="success"
//                         size="sm"
//                         onClick={() => handleCreateProduct(product)}
//                       >
//                         Create Product
//                       </CButton>
//                     </CTableDataCell>
//                   </CTableRow>
//                 ))}
//               </CTableBody>
//             </CTable>
//           </CCardBody>
//         </CCard>
//       )}

//       {/* Product Creation Modal */}
//       <CModal
//         visible={productModalVisible}
//         onClose={() => setProductModalVisible(false)}
//         size="lg"
//       >
//         <CModalHeader>
//           <CModalTitle>Create Detailed Product</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           {selectedProductForCreation && (
//             <CRow>
//               <CCol md={6}>
//                 <h5>Processing Details</h5>
//                 <div className="mb-2">
//                   <strong>Tank:</strong> {selectedProductForCreation.tank}
//                 </div>
//                 <div className="mb-2">
//                   <strong>Total Milk:</strong> {selectedProductForCreation.totalMilk.toFixed(2)} Liters
//                 </div>
//                 <div className="mb-2">
//                   <strong>Milk Out:</strong> {selectedProductForCreation.milkOut.toFixed(2)} Liters
//                 </div>

//                 <h5 className="mt-3">Ingredients Used</h5>
//                 <CTable striped small>
//                   <CTableHead>
//                     <CTableRow>
//                       <CTableHeaderCell>Ingredient</CTableHeaderCell>
//                       <CTableHeaderCell>Quantity (kg)</CTableHeaderCell>
//                     </CTableRow>
//                   </CTableHead>
//                   <CTableBody>
//                     {selectedProductForCreation.ingredients.map((ing, index) => (
//                       <CTableRow key={index}>
//                         <CTableDataCell>{ing.name}</CTableDataCell>
//                         <CTableDataCell>{ing.quantity}</CTableDataCell>
//                       </CTableRow>
//                     ))}
//                   </CTableBody>
//                 </CTable>
//               </CCol>

//               <CCol md={6}>
//                 <h5>Product Creation</h5>
//                 <CForm>
//                   <CRow className="mb-3">
//                     <CCol>
//                       <CFormInput
//                         type="text"
//                         label="Product Name"
//                         value={productName}
//                         onChange={(e) => setProductName(e.target.value)}
//                         placeholder="Enter Product Name"
//                       />
//                     </CCol>
//                   </CRow>

//                   <CRow className="mb-3">
//                     <CCol>
//                       <CFormSelect
//                         label="Product Type"
//                         value={productType}
//                         onChange={(e) => {
//                           setProductType(e.target.value);
//                           setProductVariety('');
//                         }}
//                       >
//                         <option value="">Select Product Type</option>
//                         {productTypes.map(type => (
//                           <option key={type} value={type}>{type}</option>
//                         ))}
//                       </CFormSelect>
//                     </CCol>
//                   </CRow>

//                   <CRow className="mb-3">
//                     <CCol>
//                       <CFormSelect
//                         label="Product Variety"
//                         value={productVariety}
//                         onChange={(e) => setProductVariety(e.target.value)}
//                         disabled={!productType}
//                       >
//                         <option value="">Select Product Variety</option>
//                         {productType && productVarieties[productType].map(variety => (
//                           <option key={variety} value={variety}>{variety}</option>
//                         ))}
//                       </CFormSelect>
//                     </CCol>
//                   </CRow>

//                   <CRow className="mb-3">
//                     <CCol>
//                       <CFormSelect
//                         label="Packaging"
//                         value={productPackaging}
//                         onChange={(e) => setProductPackaging(e.target.value)}
//                       >
//                         <option value="">Select Packaging</option>
//                         {packagingOptions.map(pkg => (
//                           <option key={pkg} value={pkg}>{pkg}</option>
//                         ))}
//                       </CFormSelect>
//                     </CCol>
//                   </CRow>

//                   <CRow className="mb-3">
//                     <CCol>
//                       <CFormInput
//                         type="number"
//                         label="Shelf Life (Days)"
//                         value={productShelfLife}
//                         onChange={(e) => setProductShelfLife(e.target.value)}
//                         placeholder="Enter Shelf Life"
//                       />
//                     </CCol>
//                   </CRow>
//                 </CForm>
//               </CCol>
//             </CRow>
//           )}
//         </CModalBody>
//         <CModalFooter>
//           <CButton
//             color="primary"
//             onClick={handleConfirmProductCreation}
//           >
//             Create Product
//           </CButton>
//           <CButton
//             color="secondary"
//             onClick={() => setProductModalVisible(false)}
//           >
//             Cancel
//           </CButton>
//         </CModalFooter>
//       </CModal>

//       {/* Processing Confirmation Modal */}
//       <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
//         <CModalHeader>
//           <CModalTitle>Processing Completed</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           Product processing has been saved successfully!
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setModalVisible(false)}>
//             Close
//           </CButton>
//         </CModalFooter>
//       </CModal>
//     </CContainer>
//   );
// };

// export default MilkProcessing;
