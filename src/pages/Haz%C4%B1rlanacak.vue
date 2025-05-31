const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hazirlanacak`);

await axios.put(`${import.meta.env.VITE_API_BASE_URL}/siparis/${orderId}`, payload); 