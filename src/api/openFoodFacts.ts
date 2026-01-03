export const searchFood = async (query: string) => {
  try {
    // Utilisation de l'API de recherche avec des paramètres plus larges
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`
    );
    const data = await response.json();

    if (data.products && data.products.length > 0) {
      return data.products.map((product: any) => ({
        name: product.product_name || product.product_name_fr || "Produit inconnu",
        brand: product.brands || "Marque inconnue",
        // L'API OpenFoodFacts utilise parfois energy-kcal ou energy-kcal_100g
        calories: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
        proteins: product.nutriments?.proteins_100g || 0,
        carbs: product.nutriments?.carbohydrates_100g || 0,
        fats: product.nutriments?.fat_100g || 0,
        image: product.image_front_small_url || 'https://via.placeholder.com/150',
      }));
    }
    return [];
  } catch (error) {
    console.error("Erreur API OpenFoodFacts:", error);
    return [];
  }
};