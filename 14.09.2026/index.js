const { Client } = require('pg');
const { calculatePartnerDiscount } = require('./discount');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sales_db',
  password: '1494',
  port: 5432,
});

async function getPartnerWithDiscount(partnerId) {
  const query = `
    SELECT 
      partners.id, 
      partners.name, 
      COALESCE(SUM(sales_history.quantity), 0)::INT AS total_quantity
    FROM partners
    LEFT JOIN sales_history ON partners.id = sales_history.partner_id
    WHERE partners.id = $1
    GROUP BY partners.id, partners.name;
  `;

  const response = await client.query(query, [partnerId]);

  if (response.rows.length === 0) {
    return null;
  }

  const partner = response.rows[0];
  const discount = calculatePartnerDiscount(partner.total_quantity);

  return {
    id: partner.id,
    name: partner.name,
    totalQuantity: partner.total_quantity,
    discountPercent: discount
  };
}

async function main() {
  try {
    await client.connect();
    console.log('Подключение к PostgreSQL успешно установлено.');

    for (let id = 1; id <= 3; id++) {
      const data = await getPartnerWithDiscount(id);
      console.log(`Данные партнера ID ${id}:`, data);
    }
  } catch (error) {
    console.error('Ошибка при выполнении:', error);
  } finally {
    await client.end();
  }
}

main();