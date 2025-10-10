"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import SubcategorySelector from "@/components/SubcategorySelector";
import { Product } from "../../../../store";
import { Category } from "@/components/Categories";
import { getSubcategories, getProductsBySubcategoryWithPricing, getParentCategoryFromSubcategory } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface Props {
  categoryId: string;
  fallbackProducts: Product[];
}

const CategoriesPageClient = ({ categoryId, fallbackProducts }: Props) => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [displayCategoryName, setDisplayCategoryName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [parentCategoryName, setParentCategoryName] = useState<string>("");
  const [parentCategory, setParentCategory] = useState<Category | null>(null);

  useEffect(() => {
    // Check if we have subcategory data stored in sessionStorage
    const storedProducts = sessionStorage.getItem(`subcategory_${categoryId}_products`);
    const storedCategoryName = sessionStorage.getItem(`subcategory_${categoryId}_name`);

    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        setProducts(parsedProducts);
        setDisplayCategoryName(storedCategoryName || "");
        
        // Clear the stored data after using it
        sessionStorage.removeItem(`subcategory_${categoryId}_products`);
        sessionStorage.removeItem(`subcategory_${categoryId}_name`);
        sessionStorage.removeItem(`subcategory_${categoryId}_id`);
      } catch (error) {
        console.error("Error parsing stored products:", error);
        // Keep fallback products
      }
    }
    
    // Fetch parent category info and subcategories
    const fetchCategoryData = async () => {
      try {
        // First get parent category info from the subcategory
        const parentCat = await getParentCategoryFromSubcategory(parseInt(categoryId));
        setParentCategory(parentCat);
        setParentCategoryName(parentCat.name);
        
        // Then get all subcategories of the parent category
        const subcats = await getSubcategories(parentCat.id);
        setSubcategories(subcats);
        
        // Pre-select the current subcategory
        setSelectedSubcategoryId(parseInt(categoryId));
        
        // Store parent category ID for back navigation if not already stored
        const existingParentId = sessionStorage.getItem(`subcategory_${categoryId}_parent_id`);
        if (!existingParentId) {
          sessionStorage.setItem(`subcategory_${categoryId}_parent_id`, parentCat.id.toString());
        }
        
        // Load products for the current subcategory
        const loadProducts = async () => {
          // Check if we have cached products
          const cachedProducts = sessionStorage.getItem(`subcategory_${categoryId}_products`);
          
          if (cachedProducts && !storedProducts) {
            try {
              const parsedProducts = JSON.parse(cachedProducts);
              setProducts(parsedProducts);
              setDisplayCategoryName(subcats.find((s: any) => s.id === parseInt(categoryId))?.name || "");
            } catch (error) {
              console.error("Error parsing cached products:", error);
            }
          } else if (!storedProducts) {
            // Fetch and cache products
            try {
              const subcategoryProducts = await getProductsBySubcategoryWithPricing(parseInt(categoryId));
              setProducts(subcategoryProducts);
              const currentSubcategoryName = subcats.find((s: any) => s.id === parseInt(categoryId))?.name || "";
              setDisplayCategoryName(currentSubcategoryName);
              
              // Cache the current subcategory products
              sessionStorage.setItem(`subcategory_${categoryId}_products`, JSON.stringify(subcategoryProducts));
              sessionStorage.setItem(`subcategory_${categoryId}_name`, currentSubcategoryName);
            } catch (error) {
              console.error("Error fetching current subcategory products:", error);
            }
          }
        };
        
        await loadProducts();
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    fetchCategoryData();
    setIsLoading(false);
  }, [categoryId]);

  const handleSubcategorySelect = async (subcategoryId: number | null) => {
    if (!subcategoryId) return;
    
    // Preserve parent category ID for the new subcategory
    const parentCategoryId = sessionStorage.getItem(`subcategory_${categoryId}_parent_id`);
    if (parentCategoryId) {
      sessionStorage.setItem(`subcategory_${subcategoryId}_parent_id`, parentCategoryId);
    }
    
    // Navigate to the new subcategory URL
    router.push(`/categories/${subcategoryId}`);
  };

  const handleGoBack = () => {
    // Check if we have parent category ID stored
    const parentCategoryId = sessionStorage.getItem(`subcategory_${categoryId}_parent_id`);
    
    if (parentCategoryId) {
      // Navigate to parent category page with category selected
      router.push(`/?category=${parentCategoryId}`);
    } else {
      // Fallback to browser back
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-top bg-gray-100 min-h-screen">
        <Container className="p-8 bg-white rounded-lg shadow-md mt-3">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Container className="py-4">
        {/* Header with Go Back Button */}
        <div className="flex items-center mb-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">{parentCategoryName}</span>
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '650px' }}>
          {/* Left Sidebar - Subcategory Selector */}
          <SubcategorySelector
            subcategories={subcategories}
            selectedSubcategoryId={selectedSubcategoryId}
            onSelectSubcategory={handleSubcategorySelect}
            parentCategoryName={parentCategoryName}
            currentSubcategoryId={parseInt(categoryId)}
          />

          {/* Right Side - Products Grid */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                {selectedSubcategoryId 
                  ? subcategories.find(s => s.id === selectedSubcategoryId)?.name || "Products"
                  : displayCategoryName || "All Products"
                }
              </h1>
              <p className="text-gray-600 mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {/* Scrollable Products Container - Shows 2 rows of 5 products */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0">
              <div className="grid grid-cols-5 gap-3">
                {products.map((product) => (
                  <div key={product.id} className="w-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {products.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No products found for this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoriesPageClient;
