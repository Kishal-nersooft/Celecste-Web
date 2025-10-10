// Individual product pricing API functions
const API_BASE_URL = "https://celeste-api-846811285865.us-central1.run.app";

// Function to get individual product pricing (for specific use cases)
export async function getProductPricing(productId: number, tierId: number = 1, quantity: number = 1) {
  try {
    // Check if we're running on the server side
    const isServer = typeof window === 'undefined';
    
    let url;
    if (isServer) {
      // On server side, use the external API directly
      url = `${API_BASE_URL}/pricing/calculate/product/${productId}?tier_id=${tierId}&quantity=${quantity}`;
    } else {
      // On client side, use local API proxy to avoid CORS issues
      url = `/api/pricing/calculate/product/${productId}?tier_id=${tierId}&quantity=${quantity}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    return null;
  }
}
