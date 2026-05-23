// Initial E-FUEL products & prices in IDR (Indonesian Rupiah)
let FUEL_PRODUCTS = {
  IGNITE: { name: 'E-Fuel Ignite', ron: 'RON 92', pricePerLiter: 10000 },
  BLAZE: { name: 'E-Fuel Blaze', ron: 'RON 95', pricePerLiter: 14000 },
  QUANTUM: { name: 'E-Fuel Quantum', ron: 'RON 98', pricePerLiter: 16500 },
  DIESEL: { name: 'E-Fuel Diesel', ron: 'CN 51', pricePerLiter: 13000 },
};

// Flat delivery / service fee in IDR
let SERVICE_FEE = 5000;

const getFuelProducts = () => FUEL_PRODUCTS;

const updateFuelProduct = (fuelType, data) => {
  if (FUEL_PRODUCTS[fuelType]) {
    FUEL_PRODUCTS[fuelType] = { ...FUEL_PRODUCTS[fuelType], ...data };
    return true;
  }
  return false;
};

const getServiceFee = () => SERVICE_FEE;

const updateServiceFee = (fee) => {
  SERVICE_FEE = fee;
};

module.exports = {
  getFuelProducts,
  updateFuelProduct,
  getServiceFee,
  updateServiceFee,
};
