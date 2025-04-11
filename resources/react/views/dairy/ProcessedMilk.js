import React, { useState } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CForm,
  CFormInput,
  CFormSelect,
  CModalFooter,
  CBadge
} from '@coreui/react';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';



const ProcessedMilk = () => {

  const navigate = useNavigate();
    const { t, i18n } = useTranslation("global")
    const lng = i18n.language;
  

const ingredientList = [
  { name: t('LABELS.sugar'), color: '#FF6B6B' },
  { name: t('LABELS.flavoring'), color: '#4ECDC4' },
  { name: t('LABELS.preservative'), color: '#45B7D1' },
  { name: t('LABELS.stabilizer'), color: '#FDCB6E' },
//   { name: ('LABELS.emulsifier'), color: '#6C5CE7' },
//   { name: ('LABELS.thickener'), color: '#FF8A5B' },
//   { name: ('LABELS.vitaminBlend'), color: '#2ECC71' },
//   { name: ('LABELS.calciumFortifier'), color: '#AF7AC5' },
//   { name: ('LABELS.proteinEnhancer'), color: '#F39C12' },
//   { name: ('LABELS.naturalColor'), color: '#E74C3C' },
//   { name: ('LABELS.sweetener'), color: '#3498DB' },
//   { name: ('LABELS.milkSolids'), color: '#F1C40F' }
];



    

  const [tanks, setTanks] = useState([
    {
      tank: 'Tank 1',
      totalMilk: 500,
      processedMilk: 300,
      date: '',
      ingredients: []
    },
    {
      tank: 'Tank 2',
      totalMilk: 400,
      processedMilk: 100,
      date: '',
      ingredients: []
    },
    // {
    //   tank: 'Tank 3',
    //   totalMilk: 600,
    //   processedMilk: 300,
    //   date: '',
    //   ingredients: []
    // },
    // {
    //   tank: 'Tank 4',
    //   totalMilk: 400,
    //   processedMilk: 100,
    //   date: '',
    //   ingredients: []
    // }
  ]);

 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTankIndex, setCurrentTankIndex] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    color: ''
  });

  const handleAddIngredientClick = (index) => {
    setCurrentTankIndex(index);
    setIsModalOpen(true);
  };

  const openCreateProduct = () => {
    navigate('/CreateProduct');
  };

  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      const selectedIngredient = ingredientList.find(
        ing => ing.name === newIngredient.name
      );

      const updatedTanks = [...tanks];
      updatedTanks[currentTankIndex].ingredients.push({
        ...newIngredient,
        color: selectedIngredient.color
      });

      // Update tank's processing date to current date
      updatedTanks[currentTankIndex].date = new Date().toLocaleDateString();

      setTanks(updatedTanks);

      // Reset modal state
      setNewIngredient({ name: '', quantity: '', color: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <CCard className="mb-4 ">
        <CCardHeader className="" style={{ backgroundColor: "#E6E6FA" }}>
          <h5>{t('LABELS.processedMilk')}</h5>
        </CCardHeader>
        <CCardBody className=" p-4">
        <CTable striped hover responsive className="align-middle border shadow-sm">
  <CTableHead color="light">
    <CTableRow style={{ backgroundColor: '#f0f4f8' }}>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.tank')}</CTableHeaderCell>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.totalMilkQty')}</CTableHeaderCell>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.processedMilkQty')}</CTableHeaderCell>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.date')}</CTableHeaderCell>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.ingredientsUsed')}</CTableHeaderCell>
      <CTableHeaderCell className="fw-bold text-primary">{t('LABELS.action')}</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>

    {/* Row 1 */}
    <CTableRow>
      <CTableDataCell>{t('LABELS.tank')} 1</CTableDataCell>
      <CTableDataCell>200/500 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>200 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>03-Jan-2025</CTableDataCell>
      <CTableDataCell>
        <CBadge color="info" className="me-2">{t('LABELS.sugar')}: 5 {t('LABELS.kg')}</CBadge>
        <CBadge color="danger">{t('LABELS.salt')}: 2 {t('LABELS.kg')}</CBadge>
      </CTableDataCell>
      <CTableDataCell>
        <CButton color="success" variant="outline" shape="rounded-pill" size="sm" onClick={() => openCreateProduct()}>
        {t('LABELS.createProduct')}   
        </CButton>
      </CTableDataCell>
    </CTableRow>

    {/* Row 2 */}
    <CTableRow>
      <CTableDataCell>{t('LABELS.tank')} 2</CTableDataCell>
      <CTableDataCell>100/300 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>150 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>01-Feb-2025</CTableDataCell>
      <CTableDataCell>
        <CBadge color="success" className="me-2">{t('LABELS.milkPowder')}: 10 {t('LABELS.kg')}</CBadge>
        <CBadge color="secondary">{t('LABELS.foodColor')}: 1 {t('LABELS.kg')}</CBadge>
      </CTableDataCell>
      <CTableDataCell>
        <CButton color="success" variant="outline" shape="rounded-pill" size="sm">
        {t('LABELS.createProduct')} 
        </CButton>
      </CTableDataCell>
    </CTableRow>

    {/* Row 3 */}
    <CTableRow>
      <CTableDataCell>{t('LABELS.tank')} 2</CTableDataCell>
      <CTableDataCell>250/700 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>150 {t('LABELS.Ltr')}</CTableDataCell>
      <CTableDataCell>20-Mar-2025</CTableDataCell>
      <CTableDataCell>
        <CBadge color="info" className="me-2">{t('LABELS.sugar')}: 5 {t('LABELS.kg')}</CBadge>
        <CBadge color="secondary">{t('LABELS.foodColor')}: 1 {t('LABELS.kg')}</CBadge>
      </CTableDataCell>
      <CTableDataCell>
        <CButton color="success" variant="outline" shape="rounded-pill" size="sm">
        {t('LABELS.createProduct')} 
        </CButton>
      </CTableDataCell>
    </CTableRow>

  </CTableBody>
</CTable>

        </CCardBody>
      </CCard>

      <CModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <CModalHeader>
          <CModalTitle>{t('LABELS.addIngredient')}</CModalTitle> 
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormSelect
              label="Ingredient"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({
                ...prev,
                name: e.target.value
              }))}
            >
              <option value="">{t('LABELS.selectIngredient')}</option>
              {ingredientList.map((ing, index) => (
                <option key={index} value={ing.name}>{ing.name}</option>
              ))}
            </CFormSelect>
            <CFormInput
              type="number"
              label="Quantity (kg)"
              value={newIngredient.quantity}
              onChange={(e) => setNewIngredient(prev => ({
                ...prev,
                quantity: e.target.value
              }))}
              className="mt-3"
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setIsModalOpen(false)}>
          {t('LABELS.cancel')}
          </CButton>
          <CButton color="primary" onClick={handleAddIngredient}>
          {t('LABELS.addIngredient')}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ProcessedMilk;

//-------------------------------------------------------------------------


// import React, { useState, useEffect } from 'react';

// const ingredientList = [
//   { name: 'Sugar', color: '#FF6B6B', nutritionalValue: 387, type: 'Sweetener' },
//   { name: 'Flavoring', color: '#4ECDC4', nutritionalValue: 0, type: 'Additive' },
//   { name: 'Preservative', color: '#45B7D1', nutritionalValue: 5, type: 'Stabilizer' },
//   { name: 'Stabilizer', color: '#FDCB6E', nutritionalValue: 10, type: 'Texture Enhancer' },
//   { name: 'Emulsifier', color: '#6C5CE7', nutritionalValue: 15, type: 'Binding Agent' },
//   { name: 'Thickener', color: '#FF8A5B', nutritionalValue: 20, type: 'Consistency Modifier' },
//   { name: 'Vitamin Blend', color: '#2ECC71', nutritionalValue: 250, type: 'Nutritional Supplement' },
//   { name: 'Calcium Fortifier', color: '#AF7AC5', nutritionalValue: 300, type: 'Mineral Supplement' },
//   { name: 'Protein Enhancer', color: '#F39C12', nutritionalValue: 400, type: 'Nutritional Supplement' },
//   { name: 'Natural Color', color: '#E74C3C', nutritionalValue: 5, type: 'Aesthetic Additive' },
//   { name: 'Sweetener', color: '#3498DB', nutritionalValue: 0, type: 'Low-Calorie Sweetener' },
//   { name: 'Milk Solids', color: '#F1C40F', nutritionalValue: 200, type: 'Base Ingredient' }
// ];

// const ProcessedMilk = () => {
//   const [tanks, setTanks] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentTankIndex, setCurrentTankIndex] = useState(null);
//   const [newIngredient, setNewIngredient] = useState({
//     name: '',
//     quantity: '',
//     color: ''
//   });
//   const [processingStats, setProcessingStats] = useState({
//     totalProcessed: 0,
//     averageNutritionalValue: 0,
//     mostUsedIngredient: null
//   });

//   // Initialize tanks with more detailed initial state
//   useEffect(() => {
//     const initialTanks = [
//       {
//         tank: 'Tank 1',
//         totalMilk: 500,
//         processedMilk: 300,
//         date: '',
//         ingredients: [],
//         status: 'Idle',
//         temperature: 4.2,
//         processingTime: 0
//       },
//       {
//         tank: 'Tank 2',
//         totalMilk: 400,
//         processedMilk: 100,
//         date: '',
//         ingredients: [],
//         status: 'Idle',
//         temperature: 4.5,
//         processingTime: 0
//       },
//       {
//         tank: 'Tank 3',
//         totalMilk: 600,
//         processedMilk: 300,
//         date: '',
//         ingredients: [],
//         status: 'Idle',
//         temperature: 4.3,
//         processingTime: 0
//       },
//       {
//         tank: 'Tank 4',
//         totalMilk: 400,
//         processedMilk: 100,
//         date: '',
//         ingredients: [],
//         status: 'Idle',
//         temperature: 4.1,
//         processingTime: 0
//       }
//     ];
//     setTanks(initialTanks);
//   }, []);

//   // Advanced ingredient addition with intelligent processing
//   const handleAddIngredient = () => {
//     if (newIngredient.name && newIngredient.quantity) {
//       const selectedIngredient = ingredientList.find(
//         ing => ing.name === newIngredient.name
//       );

//       const updatedTanks = [...tanks];
//       const currentTank = updatedTanks[currentTankIndex];

//       // Intelligent processing logic
//       currentTank.ingredients.push({
//         ...newIngredient,
//         color: selectedIngredient.color,
//         type: selectedIngredient.type,
//         nutritionalValue: selectedIngredient.nutritionalValue
//       });

//       // Update tank status and processing time
//       currentTank.status = 'Processing';
//       currentTank.processingTime += parseInt(newIngredient.quantity) * 0.5;
//       currentTank.date = new Date().toLocaleString();

//       // Dynamic temperature adjustment based on ingredients
//       currentTank.temperature += selectedIngredient.type === 'Nutritional Supplement' ? 0.2 : 0.1;

//       setTanks(updatedTanks);

//       // Update processing statistics
//       updateProcessingStats(updatedTanks);

//       // Reset modal state
//       setNewIngredient({ name: '', quantity: '', color: '' });
//       setIsModalOpen(false);
//     }
//   };

//   // Calculate advanced processing statistics
//   const updateProcessingStats = (updatedTanks) => {
//     const allIngredients = updatedTanks.flatMap(tank => tank.ingredients);

//     // Total processed milk
//     const totalProcessed = updatedTanks.reduce((sum, tank) => sum + tank.processedMilk, 0);

//     // Average nutritional value
//     const totalNutritionalValue = allIngredients.reduce((sum, ing) =>
//       sum + (ing.nutritionalValue * ing.quantity), 0);
//     const averageNutritionalValue = totalNutritionalValue / allIngredients.length || 0;

//     // Most used ingredient
//     const ingredientCounts = allIngredients.reduce((counts, ing) => {
//       counts[ing.name] = (counts[ing.name] || 0) + 1;
//       return counts;
//     }, {});
//     const mostUsedIngredient = Object.entries(ingredientCounts).reduce(
//       (max, [name, count]) => count > max.count ? { name, count } : max,
//       { name: '', count: 0 }
//     );

//     setProcessingStats({
//       totalProcessed,
//       averageNutritionalValue: averageNutritionalValue.toFixed(2),
//       mostUsedIngredient: mostUsedIngredient.name
//     });
//   };

//   // Tank status color indicator
//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'Processing': return '#FFA500';  // Orange
//       case 'Idle': return '#4CAF50';        // Green
//       default: return '#9E9E9E';            // Gray
//     }
//   };

//   return (
//     <div style={{
//       fontFamily: 'Arial, sans-serif',
//       maxWidth: '1200px',
//       margin: 'auto',
//       padding: '20px',
//       backgroundColor: '#f4f4f4'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         borderRadius: '8px',
//         boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//         padding: '20px'
//       }}>
//         <h1 style={{
//           textAlign: 'center',
//           color: '#2c3e50',
//           marginBottom: '20px'
//         }}>
//           Intelligent Milk Processing Tracker
//         </h1>

//         {/* Processing Statistics */}
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           marginBottom: '20px',
//           backgroundColor: '#ecf0f1',
//           padding: '15px',
//           borderRadius: '8px'
//         }}>
//           <div>
//             <strong>Total Processed Milk:</strong> {processingStats.totalProcessed} Ltr.
//           </div>
//           <div>
//             <strong>Avg. Nutritional Value:</strong> {processingStats.averageNutritionalValue}
//           </div>
//           <div>
//             <strong>Most Used Ingredient:</strong> {processingStats.mostUsedIngredient || 'N/A'}
//           </div>
//         </div>

//         {/* Tank Processing Table */}
//         <table style={{
//           width: '100%',
//           borderCollapse: 'collapse',
//           marginBottom: '20px'
//         }}>
//           <thead style={{ backgroundColor: '#3498db', color: 'white' }}>
//             <tr>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tank</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Milk</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Processed Milk</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Temperature</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Processing Time</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ingredients</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tanks.map((tank, index) => (
//               <tr key={index} style={{
//                 backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
//               }}>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tank.tank}</td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tank.totalMilk} Ltr.</td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{tank.processedMilk} Ltr.</td>
//                 <td style={{
//                   padding: '10px',
//                   border: '1px solid #ddd',
//                   color: getStatusColor(tank.status)
//                 }}>
//                   {tank.status}
//                 </td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>
//                   {tank.temperature.toFixed(1)}°C
//                 </td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>
//                   {tank.processingTime.toFixed(1)} mins
//                 </td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>
//                   {tank.ingredients.map((ing, i) => (
//                     <span key={i} style={{
//                       backgroundColor: ing.color,
//                       color: 'white',
//                       padding: '2px 5px',
//                       borderRadius: '3px',
//                       margin: '0 2px',
//                       display: 'inline-block',
//                       fontSize: '0.8em'
//                     }}>
//                       {`${ing.name}: ${ing.quantity} (${ing.type})`}
//                     </span>
//                   ))}
//                 </td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>
//                   <button
//                     onClick={() => {
//                       setCurrentTankIndex(index);
//                       setIsModalOpen(true);
//                     }}
//                     style={{
//                       backgroundColor: '#2ecc71',
//                       color: 'white',
//                       border: 'none',
//                       padding: '5px 10px',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}
//                   >
//                     Add Ingredient
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Ingredient Addition Modal */}
//         {isModalOpen && (
//           <div style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center'
//           }}>
//             <div style={{
//               backgroundColor: 'white',
//               padding: '20px',
//               borderRadius: '8px',
//               width: '400px'
//             }}>
//               <h2 style={{ marginBottom: '15px' }}>Add Ingredient</h2>
//               <select
//                 value={newIngredient.name}
//                 onChange={(e) => {
//                   const selectedIng = ingredientList.find(ing => ing.name === e.target.value);
//                   setNewIngredient(prev => ({
//                     ...prev,
//                     name: e.target.value,
//                     color: selectedIng?.color || ''
//                   }));
//                 }}
//                 style={{
//                   width: '100%',
//                   padding: '10px',
//                   marginBottom: '10px'
//                 }}
//               >
//                 <option value="">Select Ingredient</option>
//                 {ingredientList.map((ing, index) => (
//                   <option key={index} value={ing.name}>
//                     {ing.name} ({ing.type})
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="number"
//                 placeholder="Quantity (kg)"
//                 value={newIngredient.quantity}
//                 onChange={(e) => setNewIngredient(prev => ({
//                   ...prev,
//                   quantity: e.target.value
//                 }))}
//                 style={{
//                   width: '100%',
//                   padding: '10px',
//                   marginBottom: '10px'
//                 }}
//               />
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between'
//               }}>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   style={{
//                     backgroundColor: '#e74c3c',
//                     color: 'white',
//                     border: 'none',
//                     padding: '10px 20px',
//                     borderRadius: '4px'
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddIngredient}
//                   style={{
//                     backgroundColor: '#2ecc71',
//                     color: 'white',
//                     border: 'none',
//                     padding: '10px 20px',
//                     borderRadius: '4px'
//                   }}
//                 >
//                   Add Ingredient
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProcessedMilk;


//*****************************V2*************************************

//-------------------------------------------------------------------------------------
// import React, { useState, useMemo } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// // Custom CSS
// const customStyles = `
//   .gradient-background {
//     background: linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%);
//   }
//   .tank-hover:hover {
//     background-color: rgba(0,123,255,0.1);
//     transition: background-color 0.3s ease;
//   }
//   .gradient-header {
//     background: linear-gradient(to right, #007bff, #0056b3);
//     color: white;
//   }
//   .nav-pills .nav-link.active {
//     background: linear-gradient(to right, #007bff, #0056b3) !important;
//     color: white !important;
//   }
// `;

// const ProcessedMilk = () => {
//   // Generate comprehensive dummy data
//   const generateDummyData = () => {
//     const ingredientList = [
//       { name: 'Sugar', color: '#FF6B6B', nutritionalValue: 387, type: 'Sweetener' },
//       { name: 'Vitamin Blend', color: '#2ECC71', nutritionalValue: 250, type: 'Supplement' },
//       { name: 'Calcium Fortifier', color: '#AF7AC5', nutritionalValue: 300, type: 'Mineral' },
//       { name: 'Protein Enhancer', color: '#F39C12', nutritionalValue: 400, type: 'Supplement' },
//       { name: 'Flavoring', color: '#4ECDC4', nutritionalValue: 0, type: 'Additive' },
//       { name: 'Milk Solids', color: '#F1C40F', nutritionalValue: 200, type: 'Base' }
//     ];

//     return {
//       ingredientList,
//       initialTanks: [
//         {
//           tank: 'Tank 1',
//           totalMilk: 500,
//           processedMilk: 300,
//           date: new Date().toLocaleString(),
//           ingredients: [
//             { name: 'Sugar', quantity: 25, color: '#FF6B6B', nutritionalValue: 387 },
//             { name: 'Vitamin Blend', quantity: 15, color: '#2ECC71', nutritionalValue: 250 }
//           ],
//           status: 'Processing',
//           temperature: 4.2,
//           processingTime: 45
//         },
//         {
//           tank: 'Tank 2',
//           totalMilk: 400,
//           processedMilk: 100,
//           date: new Date().toLocaleString(),
//           ingredients: [
//             { name: 'Calcium Fortifier', quantity: 20, color: '#AF7AC5', nutritionalValue: 300 }
//           ],
//           status: 'Idle',
//           temperature: 4.5,
//           processingTime: 20
//         },
//         {
//           tank: 'Tank 3',
//           totalMilk: 600,
//           processedMilk: 300,
//           date: new Date().toLocaleString(),
//           ingredients: [
//             { name: 'Protein Enhancer', quantity: 30, color: '#F39C12', nutritionalValue: 400 },
//             { name: 'Flavoring', quantity: 10, color: '#4ECDC4', nutritionalValue: 0 }
//           ],
//           status: 'Processing',
//           temperature: 4.3,
//           processingTime: 60
//         }
//       ]
//     };
//   };

//   const { ingredientList, initialTanks } = generateDummyData();
//   const [tanks, setTanks] = useState(initialTanks);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentTankIndex, setCurrentTankIndex] = useState(null);
//   const [selectedView, setSelectedView] = useState('overview');
//   const [newIngredient, setNewIngredient] = useState({
//     name: '',
//     quantity: ''
//   });

//   // Processing statistics
//   const processingStats = useMemo(() => {
//     const totalMilk = tanks.reduce((sum, tank) => sum + tank.totalMilk, 0);
//     const totalProcessedMilk = tanks.reduce((sum, tank) => sum + tank.processedMilk, 0);
//     const percentProcessed = ((totalProcessedMilk / totalMilk) * 100).toFixed(2);

//     const allIngredients = tanks.flatMap(tank => tank.ingredients);

//     const ingredientUsage = allIngredients.reduce((counts, ing) => {
//       counts[ing.name] = (counts[ing.name] || 0) + ing.quantity;
//       return counts;
//     }, {});

//     const ingredientUsageData = Object.entries(ingredientUsage).map(([name, quantity]) => ({
//       name,
//       quantity
//     }));

//     const mostUsedIngredient = ingredientUsageData.reduce(
//       (max, current) => (current.quantity > max.quantity ? current : max),
//       { name: 'N/A', quantity: 0 }
//     );

//     return {
//       totalMilk,
//       totalProcessedMilk,
//       percentProcessed,
//       mostUsedIngredient,
//       ingredientUsageData
//     };
//   }, [tanks]);

//   const handleAddIngredient = () => {
//     if (newIngredient.name && newIngredient.quantity) {
//       const selectedIngredient = ingredientList.find(
//         ing => ing.name === newIngredient.name
//       );

//       const updatedTanks = [...tanks];
//       const currentTank = updatedTanks[currentTankIndex];

//       currentTank.ingredients.push({
//         ...newIngredient,
//         color: selectedIngredient.color,
//         nutritionalValue: selectedIngredient.nutritionalValue
//       });

//       currentTank.status = 'Processing';
//       currentTank.processingTime += parseInt(newIngredient.quantity) * 0.5;
//       currentTank.date = new Date().toLocaleString();

//       setTanks(updatedTanks);
//       setNewIngredient({ name: '', quantity: '' });
//       setIsModalOpen(false);
//     }
//   };

//   const renderContent = () => {
//     switch (selectedView) {
//       case 'overview':
//         return (
//           <div className="row">
//             <div className="col-md-6">
//               <div className="card mb-4">
//                 <div className="card-header bg-primary text-white">Processing Overview</div>
//                 <div className="card-body">
//                   <p>Total Milk: {processingStats.totalMilk} Ltr</p>
//                   <p>Processed Milk: {processingStats.totalProcessedMilk} Ltr</p>
//                   <p>Processed Percentage: {processingStats.percentProcessed}%</p>
//                   <p>Most Used Ingredient: {processingStats.mostUsedIngredient.name}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-6">
//               <div className="card mb-4">
//                 <div className="card-header bg-primary text-white">Ingredient Usage</div>
//                 <div className="card-body" style={{ height: '400px' }}>
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={processingStats.ingredientUsageData}
//                         dataKey="quantity"
//                         nameKey="name"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={100}
//                         fill="#8884d8"
//                         label
//                       >
//                         {processingStats.ingredientUsageData.map((entry, index) => (
//                           <Cell
//                             key={`cell-${index}`}
//                             fill={ingredientList.find(ing => ing.name === entry.name)?.color || '#000'}
//                           />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case 'ingredients':
//         return (
//           <div className="card">
//             <div className="card-header bg-primary text-white">Ingredient Quantity</div>
//             <div className="card-body" style={{ height: '500px' }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={processingStats.ingredientUsageData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="quantity" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         );
//       case 'tanks':
//         return (
//           <div className="card">
//             <div className="card-header bg-primary text-white">Tank Details</div>
//             <div className="card-body">
//               <div className="table-responsive">
//                 <table className="table table-striped">
//                   <thead>
//                     <tr>
//                       <th>Tank</th>
//                       <th>Total Milk</th>
//                       <th>Processed Milk</th>
//                       <th>Status</th>
//                       <th>Ingredients</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {tanks.map((tank, index) => (
//                       <tr key={index}>
//                         <td>{tank.tank}</td>
//                         <td>{tank.totalMilk} Ltr</td>
//                         <td>{tank.processedMilk} Ltr</td>
//                         <td>{tank.status}</td>
//                         <td>
//                           {tank.ingredients.map((ing, i) => (
//                             <span
//                               key={i}
//                               className="badge me-1"
//                               style={{ backgroundColor: ing.color }}
//                             >
//                               {ing.name}: {ing.quantity}
//                             </span>
//                           ))}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <style>{customStyles}</style>
//       <div className="container-fluid gradient-background min-vh-100 py-5">
//         <div className="container bg-white rounded shadow-lg p-4">
//           <h1 className="text-center text-primary mb-4">Milk Processing Tracker</h1>

//           {/* Navigation */}
//           <ul className="nav nav-pills nav-fill mb-4">
//             {[
//               { key: 'overview', label: 'Overview' },
//               { key: 'ingredients', label: 'Ingredients' },
//               { key: 'tanks', label: 'Tanks' }
//             ].map(nav => (
//               <li key={nav.key} className="nav-item">
//                 <button
//                   className={`nav-link ${selectedView === nav.key ? 'active' : ''}`}
//                   onClick={() => setSelectedView(nav.key)}
//                 >
//                   {nav.label}
//                 </button>
//               </li>
//             ))}
//           </ul>

//           {/* Content Renderer */}
//           {renderContent()}

//           {/* Tanks Table with Add Ingredient */}
//           <div className="table-responsive mt-4">
//             <table className="table table-striped table-hover">
//               <thead className="gradient-header">
//                 <tr>
//                   <th>Tank</th>
//                   <th>Total Milk</th>
//                   <th>Processed Milk</th>
//                   <th>Ingredients</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tanks.map((tank, index) => (
//                   <tr key={index} className="tank-hover">
//                     <td>{tank.tank}</td>
//                     <td>{tank.totalMilk} Ltr</td>
//                     <td>{tank.processedMilk} Ltr</td>
//                     <td>
//                       {tank.ingredients.map((ing, i) => (
//                         <span
//                           key={i}
//                           className="badge me-1"
//                           style={{ backgroundColor: ing.color }}
//                         >
//                           {ing.name}: {ing.quantity}
//                         </span>
//                       ))}
//                     </td>
//                     <td>
//                       <button
//                         className="btn btn-primary btn-sm"
//                         onClick={() => {
//                           setCurrentTankIndex(index);
//                           setIsModalOpen(true);
//                         }}
//                       >
//                         Add Ingredient
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Modal */}
//           {isModalOpen && (
//             <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//               <div className="modal-dialog">
//                 <div className="modal-content">
//                   <div className="modal-header gradient-header">
//                     <h5 className="modal-title">Add Ingredient</h5>
//                     <button
//                       type="button"
//                       className="btn-close"
//                       onClick={() => setIsModalOpen(false)}
//                     ></button>
//                   </div>
//                   <div className="modal-body">
//                     <select
//                       className="form-select mb-3"
//                       value={newIngredient.name}
//                       onChange={(e) => setNewIngredient(prev => ({
//                         ...prev,
//                         name: e.target.value
//                       }))}
//                     >
//                       <option value="">Select Ingredient</option>
//                       {ingredientList.map((ing, index) => (
//                         <option key={index} value={ing.name}>
//                           {ing.name}
//                         </option>
//                       ))}
//                     </select>
//                     <input
//                       type="number"
//                       className="form-control"
//                       placeholder="Quantity"
//                       value={newIngredient.quantity}
//                       onChange={(e) => setNewIngredient(prev => ({
//                         ...prev,
//                         quantity: e.target.value
//                       }))}
//                     />
//                   </div>
//                   <div className="modal-footer">
//                     <button
//                       type="button"
//                       className="btn btn-secondary"
//                       onClick={() => setIsModalOpen(false)}
//                     >
//                       Close
//                     </button>
//                     <button
//                       type="button"
//                       className="btn btn-primary"
//                       onClick={handleAddIngredient}
//                     >
//                       Add
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProcessedMilk;
