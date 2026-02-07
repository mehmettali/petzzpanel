import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.PETZZ_API_URL;
const USERNAME = process.env.PETZZ_USERNAME;
const PASSWORD = process.env.PETZZ_PASSWORD;

let token = null;
let tokenExpiry = null;

// Login and get token
export async function login() {
  try {
    const response = await axios.post(`${API_URL}/api/Users/login`, {
      username: USERNAME,
      password: PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    token = response.data.token;
    tokenExpiry = new Date(response.data.expiration);
    console.log('✅ Petzz API login successful');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Get valid token (refresh if expired)
export async function getToken() {
  if (!token || !tokenExpiry || new Date() >= tokenExpiry) {
    await login();
  }
  return token;
}

// Fetch products with pagination
export async function fetchProducts(skip = 0, top = 50) {
  const authToken = await getToken();

  const params = new URLSearchParams({
    '$top': top,
    '$skip': skip,
    '$expand': 'Analytics,Metas,AkakceProduct($expand=AkakceSellers),InvoiceItems($expand=Invoice),ShelvedProducts',
    '$filter': '(IsBundle eq false) and (IsObsolete eq false)',
    '$count': 'true'
  });

  try {
    const response = await axios.get(`${API_URL}/odata/HamurlabsProduct?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    return {
      count: response.data['@odata.count'],
      products: response.data.value
    };
  } catch (error) {
    console.error(`❌ Fetch products failed (skip=${skip}):`, error.message);
    throw error;
  }
}

// Fetch all products
export async function fetchAllProducts(onProgress) {
  let allProducts = [];
  let skip = 0;
  const pageSize = 100;
  let totalCount = 0;

  // First fetch to get total count
  const firstPage = await fetchProducts(0, pageSize);
  totalCount = firstPage.count;
  allProducts = firstPage.products;

  if (onProgress) {
    onProgress(allProducts.length, totalCount);
  }

  // Fetch remaining pages
  while (allProducts.length < totalCount) {
    skip += pageSize;
    const page = await fetchProducts(skip, pageSize);
    allProducts = allProducts.concat(page.products);

    if (onProgress) {
      onProgress(allProducts.length, totalCount);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return allProducts;
}

export default {
  login,
  getToken,
  fetchProducts,
  fetchAllProducts
};
