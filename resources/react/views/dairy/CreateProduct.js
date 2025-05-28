import React, { useState, useEffect } from 'react';
import { getAPICall } from '../../util/api';

const ProductFormulaExecutor = () => {
  const [formulas, setFormulas] = useState([]);
  const [inputs, setInputs] = useState({ buffaloQty: '', skimQty: '' });
  const [result, setResult] = useState(null);

  // Static milk tank data
  const tankData = {
    101: { avg_fat: 5, snf: 8, avg_degree: 30.5 },     // Cow
    102: { avg_fat: 7, snf: 9, avg_degree: 30.5 },     // Buffalo
    103: { avg_fat: 0.1, snf: 8.5, avg_degree: 32.5 }, // Skim
  };

  // Fetch formulas by product_id
  useEffect(() => {
    async function data() {
      const resp = await getAPICall('/api/product-formulas/product/16');
      setFormulas(resp);
    }
    data();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Evaluate formulas
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
      skimQty: parseFloat(inputs.skimQty),
      buffaloFat,
      skimFat,
      cowFat,
      buffaloLacto,
      skimLacto,
      cowLacto,
    };

    const intermediateResults = {};

    try {
      formulas
        .sort((a, b) => a.step - b.step)
        .forEach(({ step, formula }) => {
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

          // Truncate to 1 decimal place (not rounded)
          const evaluated = typeof rawValue === 'number'
            ? Math.trunc(rawValue * 10) / 10
            : rawValue;

          intermediateResults[`Step${step}`] = evaluated;
          finalResult = evaluated;

          // Logging
          console.log(`Step ${step}:`);
          console.log(`  Original Formula: ${formula}`);
          console.log(`  Replaced Formula: ${replaced}`);
          console.log(`  Raw Result: ${rawValue}`);
          console.log(`  Truncated Result (1 decimal): ${evaluated}`);
        });

      setResult(finalResult);
    } catch (error) {
      console.error("Error evaluating formula:", error);
      setResult("Error in formula");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Formula Executor</h2>

      <div className="mb-2">
        <label>Buffalo Milk Qty:</label>
        <input
          type="number"
          name="buffaloQty"
          value={inputs.buffaloQty}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div className="mb-2">
        <label>Skim Milk Qty:</label>
        <input
          type="number"
          name="skimQty"
          value={inputs.skimQty}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <button
        onClick={evaluateFormula}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Execute Formula
      </button>

      {result !== null && (
        <div className="mt-4">
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  );
};

export default ProductFormulaExecutor;
