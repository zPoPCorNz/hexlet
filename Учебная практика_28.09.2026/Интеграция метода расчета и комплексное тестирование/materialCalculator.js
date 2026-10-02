const MOCK_PRODUCT_TYPES = {
  1: { id: 1, name: 'Ламинат', coefficient: 1.20 },
  2: { id: 2, name: 'Массивная доска', coefficient: 1.50 },
  3: { id: 3, name: 'Паркетная доска', coefficient: 2.10 },
};

const MOCK_MATERIAL_TYPES = {
  1: { id: 1, name: 'Древесина дуба', defectRate: 0.25 },
  2: { id: 2, name: 'Древесина сосны', defectRate: 0.40 },
  3: { id: 3, name: 'Полимерный клей', defectRate: 0.15 },
};

async function calculateRequiredMaterial(productTypeId, materialTypeId, quantity, param1, param2, dbClient = null) {
  try {
    const isQuantityInvalid = typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0;
    if (isQuantityInvalid) {
      return -1;
    }

    const isParam1Invalid = typeof param1 !== 'number' || isNaN(param1) || param1 <= 0;
    const isParam2Invalid = typeof param2 !== 'number' || isNaN(param2) || param2 <= 0;
    if (isParam1Invalid || isParam2Invalid) {
      return -1;
    }

    const isProductTypeInvalid = typeof productTypeId !== 'number' || !Number.isInteger(productTypeId) || productTypeId <= 0;
    const isMaterialTypeInvalid = typeof materialTypeId !== 'number' || !Number.isInteger(materialTypeId) || materialTypeId <= 0;
    if (isProductTypeInvalid || isMaterialTypeInvalid) {
      return -1;
    }

    let productTypeCoefficient = null;
    let materialDefectRate = null;

    if (dbClient) {
      const productQuery = 'SELECT coefficient FROM product_types WHERE id = $1;';
      const productResult = await dbClient.query(productQuery, [productTypeId]);
      if (productResult.rows.length === 0) {
        return -1;
      }
      productTypeCoefficient = parseFloat(productResult.rows[0].coefficient);

      const materialQuery = 'SELECT defect_rate FROM material_types WHERE id = $1;';
      const materialResult = await dbClient.query(materialQuery, [materialTypeId]);
      if (materialResult.rows.length === 0) {
        return -1;
      }
      materialDefectRate = parseFloat(materialResult.rows[0].defect_rate);
    } else {
      const productType = MOCK_PRODUCT_TYPES[productTypeId];
      const materialType = MOCK_MATERIAL_TYPES[materialTypeId];
      if (!productType || !materialType) {
        return -1;
      }
      productTypeCoefficient = productType.coefficient;
      materialDefectRate = materialType.defectRate;
    }

    if (productTypeCoefficient <= 0 || materialDefectRate < 0) {
      return -1;
    }

    const basePerUnit = param1 * param2 * productTypeCoefficient;
    const totalNetMaterial = basePerUnit * quantity;

    const defectMultiplier = 1 + (materialDefectRate / 100);
    const totalWithDefects = totalNetMaterial * defectMultiplier;

    return Math.ceil(totalWithDefects);
  } catch (error) {
    return -1;
  }
}

module.exports = {
  calculateRequiredMaterial,
  MOCK_PRODUCT_TYPES,
  MOCK_MATERIAL_TYPES,
};