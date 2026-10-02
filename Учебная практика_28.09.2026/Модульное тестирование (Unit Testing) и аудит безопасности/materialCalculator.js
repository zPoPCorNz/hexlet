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

/**
 * Расчет необходимого количества сырья для производства продукции.
 *
 * @param {number} productTypeId - ID типа продукции (целое положительное число)
 * @param {number} materialTypeId - ID типа материала (целое положительное число)
 * @param {number} quantity - Количество производимой продукции (целое число > 0)
 * @param {number} param1 - Первый вещественный параметр изделия (> 0)
 * @param {number} param2 - Второй вещественный параметр изделия (> 0)
 * @param {object|null} [dbClient=null] - Опциональный клиент pg для получения данных из БД
 * @returns {Promise<number>|number} - Итоговое количество материала (целое) или -1 при ошибке
 */
async function calculateRequiredMaterial(productTypeId, materialTypeId, quantity, param1, param2, dbClient = null) {
  try {

    if (
      typeof quantity !== 'number' || 
      !Number.isInteger(quantity) || 
      quantity <= 0
    ) {
      return -1;
    }

    if (
      typeof param1 !== 'number' || 
      isNaN(param1) || 
      param1 <= 0 ||
      typeof param2 !== 'number' || 
      isNaN(param2) || 
      param2 <= 0
    ) {
      return -1;
    }

    if (
      typeof productTypeId !== 'number' || 
      !Number.isInteger(productTypeId) || 
      productTypeId <= 0 ||
      typeof materialTypeId !== 'number' || 
      !Number.isInteger(materialTypeId) || 
      materialTypeId <= 0
    ) {
      return -1;
    }

    let productTypeCoeff = null;
    let materialDefectRate = null;

    if (dbClient) {
      const prodRes = await dbClient.query('SELECT coefficient FROM product_types WHERE id = $1;', [productTypeId]);
      if (prodRes.rows.length === 0) return -1;
      productTypeCoeff = parseFloat(prodRes.rows[0].coefficient);

      const matRes = await dbClient.query('SELECT defect_rate FROM material_types WHERE id = $1;', [materialTypeId]);
      if (matRes.rows.length === 0) return -1;
      materialDefectRate = parseFloat(matRes.rows[0].defect_rate);
    } else {
      const productType = MOCK_PRODUCT_TYPES[productTypeId];
      const materialType = MOCK_MATERIAL_TYPES[materialTypeId];

      if (!productType || !materialType) {
        return -1;
      }

      productTypeCoeff = productType.coefficient;
      materialDefectRate = materialType.defectRate;
    }

    if (productTypeCoeff <= 0 || materialDefectRate < 0) {
      return -1;
    }

    const basePerUnit = param1 * param2 * productTypeCoeff;

    const totalNet = basePerUnit * quantity;
    const totalWithDefects = totalNet * (1 + (materialDefectRate / 100));
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