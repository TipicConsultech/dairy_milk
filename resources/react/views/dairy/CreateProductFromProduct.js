// import React, { useState, useEffect } from 'react';
// import { getAPICall } from '../../util/api';

// const ProductFormulaExecutor = () => {
//   const [formulas, setFormulas] = useState([]);
//   const [dynamicComponents, setDynamicComponats] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [tanksData, setTankData] = useState([]);
//   const [inputs, setInputs] = useState({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:'' });
//   const [result, setResult] = useState(null);
//   const [selectedProductId, setSelectedProductId] = useState('');
//   console.log(dynamicComponents);

//   const tankData = {
//     101: { avg_fat: 5, snf: 8, avg_degree: 30.5 },
//     102: { avg_fat: 7, snf: 9, avg_degree: 30.5 },
//     103: { avg_fat: 0.1, snf: 8.5, avg_degree: 32.5 },
//   };

//   useEffect(() => {
//     async function data() {
//       const resp = await getAPICall('/api/product-formulas/product/10');
//       setFormulas(resp);
//     }
//     data();
//   }, []);

//   useEffect(() => {
//     async function data() {
//       const resp = await getAPICall('/api/productComponents/10');
//       setDynamicComponats(resp);
//     }
//     data();
//   }, []);

//   useEffect(() => {
//     async function data() {
//       const resp = await getAPICall('/api/commonProductInFormula');
//       setProducts(resp);
//     }
//     data();
//   }, []);

//   useEffect(() => {
//     async function data() {
//       const resp = await getAPICall('/api/commonProductInFormula');
//       setTankData(resp);
//     }
//     data();
//   }, []);




//   const handleChange = (e) => {
//     setInputs(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const evaluateFormula = () => {
//   if (formulas.length === 0) return;

//   let finalResult = null;

//   const buffaloFat = tankData[102].avg_fat;
//   const skimFat = tankData[103].avg_fat;
//   const cowFat = tankData[101].avg_fat;

//   const buffaloLacto = tankData[102].avg_degree;
//   const skimLacto = tankData[103].avg_degree;
//   const cowLacto = tankData[101].avg_degree;

//   const context = {
//     ...inputs,
//     buffaloQty: parseFloat(inputs.buffaloQty),
//     skim_milk: parseFloat(inputs.skimQty),
//     cow_milk: parseFloat(inputs.cowQty),
//     buffalo_milk: parseFloat(inputs.buffaloQty),
//     milk: parseFloat(inputs.anyMilk),
//     milk_fat: cowFat || buffaloFat,
//     buffalo_fat: buffaloFat,
//     skim_fat: skimFat,
//     cow_fat: cowFat,
//     buffalo_lacto: buffaloLacto,
//     skim_lacto: skimLacto,
//     cow_lacto: cowLacto,
//     milk_lacto: cowLacto || buffaloLacto
//   };

//   const intermediateResults = {};

//   try {
//     formulas
//       .sort((a, b) => a.step - b.step)
//       .forEach(({ formula_name, formula }) => {
//         // Normalize formula name by trimming whitespace/newlines
//         const name = formula_name.trim();

//         const replaced = formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, match => {
//           if (intermediateResults.hasOwnProperty(match)) {
//             return intermediateResults[match];
//           }
//           if (context.hasOwnProperty(match)) {
//             return context[match];
//           }
//           console.warn(`Unknown variable: ${match}`);
//           return '0';
//         });

//         const rawValue = Function('"use strict";return (' + replaced + ')')();

//         const evaluated = typeof rawValue === 'number'
//           ? Math.trunc(rawValue * 10) / 10
//           : rawValue;

//         intermediateResults[name] = evaluated;
//         finalResult = evaluated;

//         console.log(`Formula: ${name}`);
//         console.log(`  Original: ${formula}`);
//         console.log(`  Replaced: ${replaced}`);
//         console.log(`  Result: ${rawValue}`);
//         console.log(`  Truncated (1 decimal): ${evaluated}`);
//       });

//     setResult(finalResult);
//   } catch (error) {
//     console.error("Error evaluating formula:", error);
//     setResult("Error in formula");
//   }
// };


//   const handleProductChange = (e) => {
//     setSelectedProductId(e.target.value);
//     setResult(null);
//     setInputs({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:''});
//   };

//   const handleTankChange = (e) => {
//     setSelectedTankId(e.target.value);
//     setResult(null);
//     setInputs({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:'' });
//   };

//   return (
//     <div className="container mt-5">
//       <div className="card shadow-sm p-4">
//         <h4 className="mb-4">Product Calculator</h4>

//         <div className="row align-items-end g-3">
//           <div className="col-md-2">
//             <label className="form-label">Select Product</label>
//             <select
//               className="form-select"
//               value={selectedProductId}
//               onChange={handleProductChange}
//             >
//               <option value="">-- Select Product --</option>
//               {products.map(product => (
//                 <option key={product.id} value={product.product_id}>
//                   {product.name} ({product.localName?.trim()})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {selectedProductId && (
//             <>
//               {dynamicComponents?.[0]?.components?.tank === "any" && (
//                 <><div className="col-md-2">
//                   <label className="form-label">Select Tank</label>
//                   <select
//                     className="form-select"
//                     value={selectedProductId}
//                     onChange={handleProductChange}
//                   >
//                     <option value={0}>-- Select Milk Tank --</option>
//                     <option value={101}>Cow Milk</option>
//                     <option value={102}>Buffalo Milk</option>
//                   </select>
//                 </div>
          
//                 <div className="col-md-2">
//                   <label className="form-label">Enter Milk Qty</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="anyMilk"
//                     value={inputs.anyMilk}
//                     onChange={handleChange}
//                   />
//                 </div></>
//               )}

//               {(dynamicComponents?.[0]?.components?.tank !== "any" &&
//                 (dynamicComponents?.[0]?.components?.tank === "both" ||
//                   dynamicComponents?.[0]?.components?.tank === "baffalo")) && (
//                 <div className="col-md-2">
//                   <label className="form-label">Buffalo Milk Qty</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="buffaloQty"
//                     value={inputs.buffaloQty}
//                     onChange={handleChange}
//                   />
//                 </div>
//               )}

//               {(dynamicComponents?.[0]?.components?.tank !== "any" &&
//                 (dynamicComponents?.[0]?.components?.tank === "both" ||
//                   dynamicComponents?.[0]?.components?.tank === "cow")) && (
//                 <div className="col-md-2">
//                   <label className="form-label">Cow Milk Qty</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="cowQty"
//                     value={inputs.cowQty}
//                     onChange={handleChange}
//                   />
//                 </div>
//               )}

//               {dynamicComponents?.[0]?.components?.skim_tank === true && (
//                 <div className="col-md-2">
//                   <label className="form-label">Skim Milk Qty</label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="skimQty"
//                     value={inputs.skimQty}
//                     onChange={handleChange}
//                   />
//                 </div>
//               )}

//               <div className="col-md-2">
//                 <button className="btn btn-info w-100" onClick={evaluateFormula}>
//                   Calculate
//                 </button>
//               </div>
//             </>
//           )}
//         </div>

//         {result !== null && (
//           <div className="alert alert-success mt-4 fw-bold fs-5">
//             ✅ Final Calculated Result: <span className="text-success">{result}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductFormulaExecutor;


import React, { useEffect, useState, useRef } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CCard,
  CCardBody,
  CButton,
  CCardHeader,
  CAlert,
} from '@coreui/react'
import { getAPICall, post } from '../../util/api'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilChevronBottom, cilX } from '@coreui/icons'
import { useTranslation } from 'react-i18next'

const MilkForm = () => {
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
  
    return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };
  
  const [milkType, setMilkType] = useState('')
  const [milkAmount, setMilkAmount] = useState('')
  const [availableQty, setAvailableQty] = useState(null)
  const [tankData, setTankData] = useState([])
  const [error, setError] = useState('')

  const [ingredientOptions, setIngredientOptions] = useState([])
  const [newIngredient, setNewIngredient] = useState({id:'', name: '', quantity: '', available_qty: '', unit: '' })
  const [newProducts, setNewProducts] = useState({ name: '', unit: '' })

  const [ingredients, setIngredients] = useState([])

  const [rawMaterialData, setRawMaterialData] = useState([])     // Full objects from API

  const [rawMaterialavailableQty, setRawMaterialavailableQty] = useState(null)
  const [productsUnits, setProductsUnits] = useState(null)

  const [ingError, setIngError] = useState('')

  const [prductsData, setPrductsData] = useState([])
  const [productUnit, setProductUnit] = useState([])
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const productsDropdownRef = useRef(null);

  // Add this ref for ingredients dropdown
  const ingredientsDropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [productOptions, setProductOptions] = useState([]);
  const [newProduct, setNewProduct] = useState({ name:'', quantity:'', unit:'',liters:null });
  const [products, setProducts] = useState([]);
  const [prodError, setProdError] = useState('');
  const [productAvailQty, setProductAvailQty] = useState(null);

  const [createdSummary, setCreatedSummary] = useState(null);
  const[selectedTank,setSelectedTank]= useState(null);
  const[productCalculationData,setProductCalculationData]= useState(null);


  console.log(selectedTank);
  

  useEffect(() => {
    function handleClickOutside(event) {
      // Handle products dropdown
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target)) {
        setIsProductsDropdownOpen(false);
      }

      // Handle ingredients dropdown
      if (ingredientsDropdownRef.current && !ingredientsDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTankData()
    fetchRawMaterials()
    fetchProducts()
  }, [])
  useEffect(() => {
    if(newProduct?.id){
      getProductCalculationData(newProduct?.id);
    }
  }, [newProduct.id])
  
  const fetchTankData = async () => {
    try {
      const res = await getAPICall('/api/milk-tanks-byname/names')
      console.log(res);
      
      setTankData(res.quantity)
    } catch (err) {
      console.error('Error fetching tank data:', err)
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const res = await getAPICall('/api/getRawMaterialsByParam/0')
      setRawMaterialData(res.quantity)
      setIngredientOptions(res.quantity.map(item => item.name))
    } catch (err) {
      console.error('Error fetching raw materials:', err)
    }
  }

  const handleMilkTypeChange = (e) => {
    const selected = e.target.value
    setMilkType(selected)
    setMilkAmount('')
    setError('')
    const selectedTank = tankData.find((t) => t.name === selected)
    if (selectedTank) {
      setAvailableQty(selectedTank.available_qty)
      setSelectedTank(selectedTank);
    } else {
      setAvailableQty(null);
      setSelectedTank(null);
    }
  }

  const clearMilkType = () => {
    setMilkType('')
    setMilkAmount('')
    setAvailableQty(null)
    setError('')
  }

  const handleMilkAmountChange = (e) => {
    const value = e.target.value
    setMilkAmount(value)

    if (availableQty !== null && parseFloat(value) > availableQty) {
      setError(t('MSG.quantityExceedsAvailableMilk'))
    } else {
      setError('')
    }
  }

  const handleIngredientChange = (e) => {
    const selectedName = e.target.value
    const selectedItem = rawMaterialData.find((item) => item.name === selectedName)

    if (selectedItem) {
      setNewIngredient({
        ...newIngredient,
        id:selectedItem.id,
        name: selectedName,
        available_qty: selectedItem.available_qty,
        unit: selectedItem.unit
      })
      setRawMaterialavailableQty(selectedItem.available_qty)
    } else {
      setNewIngredient({ name: '', quantity: '', available_qty: '', unit: '' })
      setRawMaterialavailableQty(null)
    }

    setIngError('')
  }

  const clearIngredient = () => {
    setNewIngredient({ id: '', name: '', quantity: '', available_qty: '', unit: '' })
    setRawMaterialavailableQty(null)
    setIngError('')
  }

  const handleIngredientQtyChange = (e) => {
    const value = e.target.value
    setNewIngredient({ ...newIngredient, quantity: value })

    if (rawMaterialavailableQty !== null && parseFloat(value) > rawMaterialavailableQty) {
      setIngError(t('MSG.quantityExceedsAvailableStock'))
    } else {
      setIngError('')
    }
  }

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && !ingError) {
      setIngredients([...ingredients, { ...newIngredient }])
      setNewIngredient({ id: '', name: '', quantity: '', available_qty: '', unit: '' })
      setRawMaterialavailableQty(null)
    }
  }

  const removeIngredient = (index) => {
    const updated = [...ingredients]
    updated.splice(index, 1)
    setIngredients(updated)
  }

  // ---------- fetch once ----------
  const fetchProducts = async () => {
    try {
      const res = await getAPICall('/api/getProductsByProductType');

      // convert { id, name, qty } -> { id, name, quantity }
      const normalized = res.products.map(p => ({
        ...p,
        id:p.id,
        quantity: p.qty,           // rename here
        unit:p.unit,
      }));

      setPrductsData(normalized);
      setProductOptions(normalized.map(p => p.name));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // ---------- handlers ----------
  const handleProductSelect = e => {
    const sel = e.target.value;
    const item = prductsData.find(p => p.name === sel);

    if (item) {
      setNewProduct({ id:item.id , name: sel, quantity:'', unit: item.unit || '',liters:null });
      setProductAvailQty(item.quantity);          // use renamed field
    } else {
      setNewProduct({ name:'', quantity:'', unit:'',liters:null });
      setProductAvailQty(null);
    }
    setProdError('');
  };

  const clearProduct = () => {
    setNewProduct({ id: '', name: '', quantity: '', unit: '',liters:null });
    setProductAvailQty(null);
    setProdError('');
  };
  const getProductCalculationData = async (id) =>  {
  const responce= await getAPICall(`/api/factoryProductsCalculation/${id}`);
  if(responce.factory_product_id){
    setProductCalculationData(responce);
  }else if(responce.message==="Factory product not found"){
    setProductCalculationData(null); 
  }
  else{
    setProductCalculationData(null); 
  }
  } 
  const handleProductQty = async (e) =>  {
    const val = e.target.value;
    setNewProduct(p => ({ ...p, quantity: val }));
    if(productCalculationData?.liters && productCalculationData?.divide_by){
    // let milk_in_liter=null;
    // milk_in_liter = (e.target.value * (selectedTank.snf + selectedTank.ts)) / productCalculationData?.divide_by;
    if(productCalculationData.cal_applicable===1){
          let rawValue = (e.target.value * (selectedTank.snf + selectedTank.ts)) / productCalculationData?.divide_by;
    let milk_in_liter = (rawValue % 1) >= 0.1 ? Math.ceil(rawValue) : Math.floor(rawValue);
      setNewProduct(p => ({ ...p, liters: milk_in_liter }));
    }
    else{
      setNewProduct(p => ({ ...p, liters: e.target.value }));
    }
     }

    // if (productAvailQty !== null && parseFloat(val) == productAvailQty) {
    //   setProdError(t('MSG.quantityExceedsAvailableStock'));
    // } else setProdError('');
  };

  

  const addProduct = () => {
    if (newProduct.name && newProduct.quantity && !prodError) {
      setProducts(prev => [...prev, newProduct]);
      setNewProduct({ id: '', name:'', quantity:'', unit:'',liters:null });
      setProductAvailQty(null);
    }
  };

  const removeProduct = idx => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
   
  };

  useEffect(() => {
    setCreatedSummary(null); // Clear it on load or refresh
  }, []);

  // Custom dropdown styles
  const dropdownIconStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    zIndex: 1
  };

  const clearButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    zIndex: 1
  };

  const inputContainerStyle = {
    position: 'relative'
  };

   const decodeUnicode = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
};

const [productType, setProductType] = useState("milk")

const [milkEntries, setMilkEntries] = useState([]);

const milkFormattedData = milkEntries.reduce((acc, entry, index) => {
  acc[`milk_${index}`] = entry.quantity
  acc[`milk_${index}_fat`] = parseFloat(entry.fat) || 0
  acc[`milk_${index}_lacto`] = parseFloat(entry.lacto) || 0
  return acc
}, {})
console.log('Formatted Milk Data:', milkFormattedData)

  return (
    // <CCard className="mb-4">

     




<>
    


  <CCardBody>
     <CRow className="g-3 align-items-end mb-0">
  <CCol md={3}>
    <CFormLabel><b>{t('LABELS.selectMilkStorage')}</b></CFormLabel>
  </CCol>

  <CCol md={4}>
    <div style={inputContainerStyle}>
      <CFormSelect
        value={milkType}
        onChange={handleMilkTypeChange}
        style={{ appearance: 'none', backgroundImage: 'none' }}
      >
        <option value="">{t('LABELS.selectTank')}</option>
        {tankData.map((tank, idx) => {
          const tankName = lng === 'en' ? tank.name : decodeUnicode(tank.localname);
          return (
            <option key={idx} value={tank.name}>
              {tankName}
            </option>
          );
        })}
      </CFormSelect>

      {!milkType ? (
        <div style={dropdownIconStyle}><CIcon icon={cilChevronBottom} size="sm" /></div>
      ) : (
        <div style={clearButtonStyle} onClick={() => {
          setMilkType('');
          setSelectedTank(null);
          setAvailableQty(null);
          setMilkAmount('');
          setError('');
        }}>
          <CIcon icon={cilX} size="sm" />
        </div>
      )}
    </div>
  </CCol>

  <CCol md={3}>
    <CFormInput
      type="number"
      placeholder={
        availableQty !== null
          ? `${t('LABELS.availableQuantity')}: ${availableQty} ltr`
          : t('LABELS.enterMilkForProduct')
      }
      value={milkAmount}
      onChange={(e) => {
        const value = e.target.value;
        setMilkAmount(value);
        if (availableQty !== null && parseFloat(value) > availableQty) {
          setError(t('MSG.quantityExceedsAvailableMilk'));
        } else {
          setError('');
        }
      }}
      className={error ? 'is-invalid' : ''}
    />
    {error && <div className="text-danger mt-1">{error}</div>}
  </CCol>

  <CCol md={2} className="d-flex ">
    <CButton
      color="success"
      variant="outline"
     onClick={() => {
  if (!milkType || !selectedTank || !milkAmount || error) return;

  setMilkEntries(prev => [
    ...prev,
    {
      name: milkType,
      fat: selectedTank.avg_fat ?? '-',     // use avg_fat
      lacto: selectedTank.avg_degree ?? '-', // use avg_degree
      quantity: milkAmount,
      id: selectedTank.id
    }
  ]);

  // Reset
  setMilkType('');
  setSelectedTank(null);
  setAvailableQty(null);
  setMilkAmount('');
  setError('');
}}
      disabled={!milkType || !milkAmount || !!error}
    >
      <CIcon icon={cilPlus} />
    </CButton>
  </CCol>
</CRow>

{milkEntries.length > 0 && milkEntries.map((entry, index) => (
  <CRow key={index} className="mb-2 mt-2 p-2 bg-light rounded">

    <CCol xs={8} md={4}>
      <b>{entry.name}</b>
      <div className="text-muted small d-md-none">
        {entry.quantity} Ltr&nbsp;&nbsp;FAT: {entry.fat || '-'}&nbsp;&nbsp;LACTO: {entry.lacto || '-'}
      </div>
    </CCol>
    <CCol className="d-none d-md-block" md={2}>{entry.quantity} Ltr</CCol>
    <CCol className="d-none d-md-block" md={2}>FAT: {entry.fat || '-'}</CCol>
    <CCol className="d-none d-md-block" md={2}>LACTO: {entry.lacto || '-'}</CCol>
    <CCol xs={4} md={2} className="text-end">
      <CButton
        color="danger"
        variant="outline"
        onClick={() => {
          setMilkEntries(prev => prev.filter((_, i) => i !== index));
        }}
      >
        <CIcon icon={cilTrash} />
      </CButton>
    </CCol>
  </CRow>
))}






        {/* Ingredients */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#E6E6FA'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >{t('LABELS.ingredientsUsed')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={ingredientsDropdownRef} style={inputContainerStyle}>
                  <CFormInput
                    type="text"
                    value={newIngredient.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewIngredient({...newIngredient, name: value});
                      // Keep the dropdown open when typing
                      if (value) {
                        setIsDropdownOpen(true);
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={t('LABELS.searchOrSelectIngredient')}
                   
                  />

                  {!newIngredient.name ? (
                    <div style={dropdownIconStyle}>
                      <CIcon icon={cilChevronBottom} size="sm" />
                    </div>
                  ) : (
                    <div style={clearButtonStyle} onClick={clearIngredient}>
                      <CIcon icon={cilX} size="sm" />
                    </div>
                  )}

                  {/* {isDropdownOpen && (
                    <div
                      className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm z-index-dropdown"
                      style={{maxHeight: '200px', overflowY: 'auto', zIndex: 1000}}
                    >
                      {ingredientOptions
                        .filter(item => item.toLowerCase().includes(newIngredient.name.toLowerCase()))
                        .map((item, index) => (
                          <div
                            key={index}
                            className="p-2 cursor-pointer hover-bg-light"
                            style={{cursor: 'pointer'}}
                            onClick={() => {
                              // Simulate the original handleIngredientChange logic
                              const selectedItem = rawMaterialData.find((material) => material.name === item);
                              

                              if (selectedItem) {
                                setNewIngredient({
                                  ...newIngredient,
                                  id: selectedItem.id,
                                  name: item,
      
                                  available_qty: selectedItem.available_qty,
                                  unit: selectedItem.unit
                                });
                                setRawMaterialavailableQty(selectedItem.available_qty);
                              }
                              setIsDropdownOpen(false);
                              setIngError('');
                            }}
                          >
                            {item}
                          </div>
                        ))}
                    </div>
                  )} */}
                  {isDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm z-index-dropdown"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {rawMaterialData
      .filter(material => {
        const name = lng === 'en' ? material.name : decodeUnicode(material.local_name);
        // const tankName = lng === 'en' ? tank.name : decodeUnicode(tank.localname);
        return name.toLowerCase().includes((newIngredient.name || '').toLowerCase());
      })
      .map((material, index) => {
        const displayName = lng === 'en' ? material.name : decodeUnicode(material.local_name);

        return (
          <div
            key={index}
            className="p-2 cursor-pointer hover-bg-light"
            onClick={() => {
              setNewIngredient({
                ...newIngredient,
                id: material.id,
                name: displayName,
                available_qty: material.available_qty,
                unit: material.unit,
              });
              setRawMaterialavailableQty(material.available_qty);
              setIsDropdownOpen(false);
              setIngError('');
            }}
            style={{ cursor: 'pointer' }}
          >
            {displayName}
          </div>
        );
      })}
  </div>
)}

                </div>
 

              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="number"
                  placeholder={
                    rawMaterialavailableQty !== null
                      ? t('LABELS.availableQuantityValue', { qty: rawMaterialavailableQty })
                      : t('LABELS.availableQuantity')
                  }
                  value={newIngredient.quantity}
                  onChange={handleIngredientQtyChange}
                  className={ingError ? 'is-invalid' : ''}
                />
                {ingError && <div className="text-danger mt-1">{ingError}</div>}
              </CCol>

              {/* Desktop View */}
              <CCol md={3} className="d-none d-md-block">
                <CFormInput
                  type="text"
                  placeholder={t('LABELS.unit')}
                  value={newIngredient.unit}
                  disabled
                />
              </CCol>

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addIngredient}
                  disabled={!!ingError || !newIngredient.name || !newIngredient.quantity}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
                <CFormInput
                  type="text"
                  placeholder={t('LABELS.unit')}
                  value={newIngredient.unit}
                  disabled
                  className="w-80"
                />
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addIngredient}
                  disabled={!!ingError || !newIngredient.name || !newIngredient.quantity}
                  className="w-auto"
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {ingredients.map((ing, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>

                {/* Name: full width on mobile, 4 cols on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={ing.name} readOnly />
                </CCol>

                {/* Quantity: half width on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={ing.quantity} readOnly />
                </CCol>

                {/* Unit: 3 cols on mobile, 1 on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {ing.unit}
                </CCol>

                {/* Delete Button: 3 cols on mobile, 2 on desktop */}
                <CCol xs={3} md={2} className="d-flex justify-content-end">
                  <CButton color="danger" variant="outline" onClick={() => removeIngredient(idx)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>

              </CRow>
            ))}
          </CCardBody>
        </CCard>

        {/* Products */}
        <CCard className="mb-4 mt-3">
          <CCardHeader style={{ backgroundColor: '#f8d7da'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 className="mb-0" >{t('LABELS.products')}</h5>
            </div>
          </CCardHeader>

          <CCardBody>
            <CRow className="g-2 align-items-center mb-3">
              <CCol md={4}>
                <div className="position-relative" ref={productsDropdownRef} style={inputContainerStyle}>
                  <CFormInput
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProduct({...newProduct, name: value});
                      if (value) {
                        setIsProductsDropdownOpen(true);
                      }
                    }}
                    onFocus={() => setIsProductsDropdownOpen(true)}
                    placeholder={t('LABELS.searchOrSelectProduct')}
                  />

                  {!newProduct.name ? (
                    <div style={dropdownIconStyle}>
                      <CIcon icon={cilChevronBottom} size="sm" />
                    </div>
                  ) : (
                    <div style={clearButtonStyle} onClick={clearProduct}>
                      <CIcon icon={cilX} size="sm" />
                    </div>
                  )}

                 {/* {isProductsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
     {productOptions.filter(item => item.toLowerCase().includes(newProduct.name.toLowerCase())).length === 0 ? (
      <div className="p-2 text-muted text-center">{t('MSG.productNotFound')}</div>
    ) : (
      productOptions
        .filter(item => item.toLowerCase().includes(newProduct.name.toLowerCase()))
        .map((item, index) => (
          <div
            key={index}
            className="p-2 cursor-pointer hover-bg-light"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const selectedItem = prductsData.find(p => p.name === item);
              if (selectedItem) {
                setNewProduct({
                  id: selectedItem.id,
                  name: item,
                  quantity: '',
                  unit: selectedItem.unit || '',
                  liters:null
                });
                setProductAvailQty(selectedItem.quantity);
              }
              setIsProductsDropdownOpen(false);
              setProdError('');
            }}
          >
            {item}
          </div>
        ))
    )} 
    

  </div>
)} */}

{isProductsDropdownOpen && (
  <div
    className="position-absolute w-100 mt-1 border rounded bg-white shadow-sm"
    style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
  >
    {prductsData.filter(p => {
      const displayName = i18n.language === 'mr' ? p.localName : p.name;
      return displayName?.toLowerCase().includes(newProduct.name.toLowerCase());
    }).length === 0 ? (
      <div className="p-2 text-muted text-center">{t('MSG.productNotFound')}</div>
    ) : (
      prductsData
        .filter(p => {
          const displayName = i18n.language === 'mr' ? p.localName : p.name;
          return displayName?.toLowerCase().includes(newProduct.name.toLowerCase());
        })
        .map((p, index) => {
          const displayName = i18n.language === 'mr' ? p.localName : p.name;
          return (
            <div
              key={index}
              className="p-2 cursor-pointer hover-bg-light"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setNewProduct({
                  id: p.id,
                  name: p.name, // Always keep 'name' in backend value
                  quantity: '',
                  unit: p.unit || '',
                  liters: null
                });
                setProductAvailQty(p.quantity);
                setIsProductsDropdownOpen(false);
                setProdError('');
              }}
            >
              {displayName}
            </div>
          );
        })
    )}
  </div>
)}




                </div>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="number"
                  placeholder={productAvailQty!==null ? t('LABELS.availableQuantityValue', { qty: productAvailQty }) : t('LABELS.availableQuantity')}
                  value={newProduct.quantity}
                  onChange={handleProductQty}
                  className={prodError ? 'is-invalid' : ''}
                />
                {prodError && <div className="text-danger mt-1">{prodError}</div>}
              </CCol>

              {/* Desktop View: unit and + button in separate columns */}
              <CCol md={3} className="d-none d-md-block">
  <CFormInput
    value={
      newProduct?.liters
        ? newProduct.liters + ' ltr'
        : ''
    }
    placeholder={t('LABELS.milk_required')}
    disabled
  />
</CCol>

              <CCol md={2} className="d-none d-md-block">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity}
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>

              {/* Mobile View: unit and + button in the same row */}
              <CCol xs={12} className="d-flex d-md-none justify-content-between align-items-center gap-3">
                <CFormInput
    value={
      newProduct?.liters
        ? newProduct.liters + ' ltr'
        : ''
    }
    placeholder={t('LABELS.milk_required')}
    disabled
  />
                <CButton
                  color="success"
                  variant="outline"
                  onClick={addProduct}
                  disabled={!!prodError || !newProduct.name || !newProduct.quantity}
                  className="w-auto"
                >
                  <CIcon icon={cilPlus} />
                </CButton>
              </CCol>
            </CRow>

            {products.map((p, idx) => (
              <CRow className="g-3 align-items-center mb-2" key={idx}>

                {/* Product Name: full width on mobile, 4 cols on desktop */}
                <CCol xs={12} md={4}>
                  <CFormInput value={p.name+' '+`(${p.unit} )`} readOnly />
                </CCol>

                {/* Quantity: half on mobile, 3 cols on desktop */}
                <CCol xs={6} md={3}>
                  <CFormInput value={p.quantity} readOnly />
                </CCol>

                {/* Unit: quarter on mobile, 1 col on desktop */}
                <CCol xs={3} md={1} className="d-flex align-items-center">
                  {p.liters+ " "+"ltr"}
                </CCol>

                {/* Delete Button: quarter on mobile, 2 cols on desktop */}
                <CCol xs={3} md={2} className="d-flex justify-content-end">
                  <CButton color="danger" variant="outline" onClick={() => removeProduct(idx)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CCol>

              </CRow>
            ))}

          </CCardBody>
        </CCard>

        <CButton color="primary" onClick={handleSubmit} disabled={!!error}>
          {t('LABELS.submit')}
        </CButton>

        {/* {createdSummary && (
          <CAlert color='success' className='mt-2'>
            <div className="">
              <strong>{t('LABELS.productCreated')}:</strong>
              <p>{createdSummary.text}</p>
              <p className=" mt-1">{t('LABELS.createdAt')}: {createdSummary.time}</p>
            </div>
          </CAlert>
        )} */}
        {createdSummary && (
  <CAlert color='success' className='mt-2'>
    <div>
      <strong>{t('LABELS.productCreated')}:</strong>
      <p>{createdSummary.text}</p>
      <p className="mt-1">{t('LABELS.createdAt')}: {formatDate(createdSummary.time || new Date())}</p>
    </div>
  </CAlert>
)}
      </CCardBody>
      </>
 


    // </CCard>
  )
}

export default MilkForm

