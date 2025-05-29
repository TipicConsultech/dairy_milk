import React, { useState, useEffect } from 'react';
import { getAPICall } from '../../util/api';

const ProductFormulaExecutor = () => {
  const [formulas, setFormulas] = useState([]);
  const [dynamicComponents, setDynamicComponats] = useState(null);
  const [products, setProducts] = useState([]);
  const [tanksData, setTankData] = useState([]);
  const [inputs, setInputs] = useState({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:'' });
  const [result, setResult] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  console.log(dynamicComponents);

  const tankData = {
    101: { avg_fat: 5, snf: 8, avg_degree: 30.5 },
    102: { avg_fat: 7, snf: 9, avg_degree: 30.5 },
    103: { avg_fat: 0.1, snf: 8.5, avg_degree: 32.5 },
  };

  useEffect(() => {
    async function data() {
      const resp = await getAPICall('/api/product-formulas/product/10');
      setFormulas(resp);
    }
    data();
  }, []);

  useEffect(() => {
    async function data() {
      const resp = await getAPICall('/api/productComponents/10');
      setDynamicComponats(resp);
    }
    data();
  }, []);

  useEffect(() => {
    async function data() {
      const resp = await getAPICall('/api/commonProductInFormula');
      setProducts(resp);
    }
    data();
  }, []);

  useEffect(() => {
    async function data() {
      const resp = await getAPICall('/api/commonProductInFormula');
      setTankData(resp);
    }
    data();
  }, []);


  

  const handleChange = (e) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const evaluateFormula = () => {
  if (formulas.length === 0) return;

  let finalResult = null;

  const buffaloFat = tankData[102].avg_fat;
  const skimFat = tankData[103].avg_fat;
  const cowFat = tankData[101].avg_fat;

  const buffaloLacto = tankData[102].avg_degree;
  const skimLacto = tankData[103].avg_degree;
  const cowLacto = tankData[101].avg_degree;

  const context = {
    ...inputs,
    buffaloQty: parseFloat(inputs.buffaloQty),
    skim_milk: parseFloat(inputs.skimQty),
    cow_milk: parseFloat(inputs.cowQty),
    buffalo_milk: parseFloat(inputs.buffaloQty),
    milk: parseFloat(inputs.anyMilk),
    milk_fat: cowFat || buffaloFat,
    buffalo_fat: buffaloFat,
    skim_fat: skimFat,
    cow_fat: cowFat,
    buffalo_lacto: buffaloLacto,
    skim_lacto: skimLacto,
    cow_lacto: cowLacto,
    milk_lacto: cowLacto || buffaloLacto
  };

  const intermediateResults = {};

  try {
    formulas
      .sort((a, b) => a.step - b.step)
      .forEach(({ formula_name, formula }) => {
        // Normalize formula name by trimming whitespace/newlines
        const name = formula_name.trim();

        const replaced = formula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, match => {
          if (intermediateResults.hasOwnProperty(match)) {
            return intermediateResults[match];
          }
          if (context.hasOwnProperty(match)) {
            return context[match];
          }
          console.warn(`Unknown variable: ${match}`);
          return '0';
        });

        const rawValue = Function('"use strict";return (' + replaced + ')')();

        const evaluated = typeof rawValue === 'number'
          ? Math.trunc(rawValue * 10) / 10
          : rawValue;

        intermediateResults[name] = evaluated;
        finalResult = evaluated;

        console.log(`Formula: ${name}`);
        console.log(`  Original: ${formula}`);
        console.log(`  Replaced: ${replaced}`);
        console.log(`  Result: ${rawValue}`);
        console.log(`  Truncated (1 decimal): ${evaluated}`);
      });

    setResult(finalResult);
  } catch (error) {
    console.error("Error evaluating formula:", error);
    setResult("Error in formula");
  }
};


  const handleProductChange = (e) => {
    setSelectedProductId(e.target.value);
    setResult(null);
    setInputs({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:''});
  };

  const handleTankChange = (e) => {
    setSelectedTankId(e.target.value);
    setResult(null);
    setInputs({ buffaloQty: '', skimQty: '', cowQty: '',anyMilk:'' });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h4 className="mb-4">Product Calculator</h4>

        <div className="row align-items-end g-3">
          <div className="col-md-2">
            <label className="form-label">Select Product</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={handleProductChange}
            >
              <option value="">-- Select Product --</option>
              {products.map(product => (
                <option key={product.id} value={product.product_id}>
                  {product.name} ({product.localName?.trim()})
                </option>
              ))}
            </select>
          </div>

          {selectedProductId && (
            <>
              {dynamicComponents?.[0]?.components?.tank === "any" && (
                <><div className="col-md-2">
                  <label className="form-label">Select Tank</label>
                  <select
                    className="form-select"
                    value={selectedProductId}
                    onChange={handleProductChange}
                  >
                    <option value={0}>-- Select Milk Tank --</option>
                    <option value={101}>Cow Milk</option>
                    <option value={102}>Buffalo Milk</option>
                  </select>
                </div>
          
                <div className="col-md-2">
                  <label className="form-label">Enter Milk Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    name="anyMilk"
                    value={inputs.anyMilk}
                    onChange={handleChange}
                  />
                </div></>
              )}

              {(dynamicComponents?.[0]?.components?.tank !== "any" &&
                (dynamicComponents?.[0]?.components?.tank === "both" ||
                  dynamicComponents?.[0]?.components?.tank === "baffalo")) && (
                <div className="col-md-2">
                  <label className="form-label">Buffalo Milk Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    name="buffaloQty"
                    value={inputs.buffaloQty}
                    onChange={handleChange}
                  />
                </div>
              )}

              {(dynamicComponents?.[0]?.components?.tank !== "any" &&
                (dynamicComponents?.[0]?.components?.tank === "both" ||
                  dynamicComponents?.[0]?.components?.tank === "cow")) && (
                <div className="col-md-2">
                  <label className="form-label">Cow Milk Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cowQty"
                    value={inputs.cowQty}
                    onChange={handleChange}
                  />
                </div>
              )}

              {dynamicComponents?.[0]?.components?.skim_tank === true && (
                <div className="col-md-2">
                  <label className="form-label">Skim Milk Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    name="skimQty"
                    value={inputs.skimQty}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="col-md-2">
                <button className="btn btn-info w-100" onClick={evaluateFormula}>
                  Calculate
                </button>
              </div>
            </>
          )}
        </div>

        {result !== null && (
          <div className="alert alert-success mt-4 fw-bold fs-5">
            ✅ Final Calculated Result: <span className="text-success">{result}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFormulaExecutor;
