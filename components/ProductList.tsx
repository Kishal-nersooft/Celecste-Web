'use client';
import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import ProductRow from "./ProductRow";
import Categories, { Category } from "./Categories";
import { Product } from "../store";
import DiscountBanner from "./DiscountBanner";
import { getProducts, getProductsWithPricing, getSubcategories, getProductsBySubcategoryWithPricing } from "../lib/api";
import { useCachedProducts } from "../hooks/useCachedProducts";
import { useCategory } from "../contexts/CategoryContext";

interface Props {
  products: Product[];
  categories: Category[];
  title?: boolean;
  storeId?: number; // Optional store ID for filtering
  selectedCategoryId?: number | null; // Selected category ID from parent
  isDealsSelected?: boolean; // Whether deals is selected from parent
}

const ProductList = ({ products, categories, title, storeId, selectedCategoryId, isDealsSelected }: Props) => {
  // Use category context for global state management
  const { selectedCategoryId: contextCategoryId, isDealsSelected: contextIsDeals, setSelectedCategory, setLastVisitedCategory } = useCategory();
  
  // Filter out invalid products to prevent errors
  const validProducts = products.filter(product => 
    product && 
    product.id && 
    product.name && 
    typeof product.id === 'number' && 
    typeof product.name === 'string'
  );
  
  // Use context values if available, otherwise fall back to props (for store pages)
  const selectedCategory = storeId ? (selectedCategoryId ?? null) : contextCategoryId;
  const isDeals = storeId ? (isDealsSelected ?? false) : contextIsDeals;
  
  // Category selection handler
  const handleCategorySelect = (categoryId: number | null, isDealsSelected: boolean = false) => {
    if (storeId) {
      // For store pages, we don't use context
      console.log("📦 ProductList - Store page category selection:", { categoryId, isDealsSelected });
    } else {
      // For homepage, use context
      setSelectedCategory(categoryId, isDealsSelected);
      setLastVisitedCategory(categoryId, isDealsSelected);
    }
  };

  // Use the cached products hook
  const {
    dealsProducts,
    subcategories,
    subcategoryProducts,
    parentCategoryNames,
    loadingDeals,
    loadingSubcategories
  } = useCachedProducts({
    selectedCategory,
    isDeals,
    storeId,
    categories
  });

  // Clean console logs - only show once when data changes
  if (validProducts.length > 0 && validProducts.length !== (window as any).lastProductCount) {
    console.log("📦 ProductList - Products:", validProducts.length, "Categories:", categories.length);
    (window as any).lastProductCount = validProducts.length;
  }



  // For "All" category, we'll use the original products array with better filtering

  console.log("ProductList - All products:", validProducts);
  console.log("ProductList - Selected category ID:", selectedCategory);
  console.log("ProductList - Is deals selected:", isDeals);
  console.log("ProductList - Categories:", categories);

  return (
    <div>
      {/* Add Categories component - only show on homepage (when storeId is not provided) */}
      {!storeId && <Categories onSelectCategory={handleCategorySelect} />}

      {title && selectedCategory === null && !isDeals && (
        <div className="pb-5">
          <h2 className="text-2xl font-semibold text-gray-600">
            All Products
          </h2>
        </div>
      )}
      
      {isDeals ? (
        <div>
          {loadingDeals ? (
            <div className="text-center py-10 text-gray-500">
              Loading deals...
            </div>
          ) : (
            <div>
              {/* <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">
                  🎯 Deals Category Active - Showing {dealsProducts.length} discounted products
                </p>
              </div> */}
              <ProductRow
                products={dealsProducts}
                categoryName="Deals & Discounts"
                categoryId="deals"
              />
            </div>
          )}
        </div>
      ) : selectedCategory ? (
        // Show subcategories and their products when a specific category is selected
        <div>
          {loadingSubcategories ? (
            <div className="text-center py-10 text-gray-500">
              Loading subcategories...
            </div>
          ) : subcategories.length > 0 ? (
            subcategories.map((subcategory) => {
              const productsInSubcategory = subcategoryProducts[subcategory.id] || [];
              
              if (productsInSubcategory.length === 0) {
                return null; // Don't show subcategory if it has no products
              }

              // Set parent category ID for back navigation
              (window as any).currentParentCategoryId = selectedCategory;

              return (
                <ProductRow
                  key={subcategory.id}
                  products={productsInSubcategory}
                  categoryName={subcategory.name}
                  categoryId={subcategory.id.toString()}
                />
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              No subcategories found for this category.
            </div>
          )}
        </div>
      ) : (
        // Show all products grouped by parent categories when "All" is selected
        <div>
          {loadingSubcategories ? (
            <div className="text-center py-10 text-gray-500">
              Loading all products...
            </div>
          ) : Object.keys(subcategoryProducts).length > 0 ? (
            Object.keys(subcategoryProducts).map((parentId) => {
              const productsInParentCategory = subcategoryProducts[parseInt(parentId)] || [];
              const parentCategoryName = parentCategoryNames[parseInt(parentId)] || 'Unknown Category';
              
              if (productsInParentCategory.length === 0) {
                return null; // Don't show parent category if it has no products
              }

              return (
                <ProductRow
                  key={parentId}
                  products={productsInParentCategory}
                  categoryName={parentCategoryName}
                  categoryId={parentId}
                />
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              No products available at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
