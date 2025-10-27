"use client";

import React, { useState, useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { useCategory } from "@/contexts/CategoryContext";
import ProductList from "@/components/ProductList";
import PopularItemsSection from "@/components/PopularItemsSection";
import DiscountBanner from "@/components/DiscountBanner";
import StoresGrid from "@/components/StoresGrid";
import LocationLoadingIndicator from "@/components/LocationLoadingIndicator";
import { useAuth } from "@/components/FirebaseAuthProvider";
import { Product } from "../../store";
import { Category } from "../../components/Categories";
import { getProductsWithPricing, getParentCategories } from "../../lib/api";

interface HomeClientProps {
  products: Product[];
  categories: Category[];
}

const HomeClient: React.FC<HomeClientProps> = ({
  products: initialProducts,
  categories: initialCategories,
}) => {
  const { deliveryType, defaultAddress, isLocationLoading, isLocationReady } = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { selectedCategoryId, isDealsSelected, setLastVisitedCategory } =
    useCategory();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);

  // Clean console logs - only show once when data changes
  React.useEffect(() => {
    if (
      products.length > 0 &&
      typeof window !== 'undefined' &&
      products.length !== (window as any).lastHomeProductCount
    ) {
      console.log("🏠 HomeClient - Products loaded:", products.length);
      (window as any).lastHomeProductCount = products.length;
    }
  }, [products.length]);

  // Fetch data on client side - optimized for quick loading with cached location
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch products and categories for delivery mode
      if (deliveryType === "delivery") {
        // If location is still loading, wait for it
        if (isLocationLoading) {
          console.log("🏠 HomeClient - Waiting for location data...");
          return;
        }

        // If location is ready, fetch immediately with cached coordinates
        if (isLocationReady && defaultAddress) {
          console.log("🏠 HomeClient - Location ready, fetching data with cached coordinates...");
          setLoading(true);

          try {
            const latitude = defaultAddress.latitude;
            const longitude = defaultAddress.longitude;
            console.log("📍 Using cached coordinates for immediate stock loading:", { latitude, longitude });

            const [productsResponse, categoriesResponse] = await Promise.all([
              getProductsWithPricing(
                null,
                1,
                20,
                false,
                true,
                true,
                [1, 2, 3, 4], // Store IDs
                latitude,     // Latitude for inventory data
                longitude     // Longitude for inventory data
              ),
              getParentCategories(),
            ]);

            console.log("🏠 HomeClient - Data fetched successfully with stock information");

            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
            setCategories(
              Array.isArray(categoriesResponse) ? categoriesResponse : []
            );
          } catch (error) {
            console.error("HomeClient - Error fetching data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          console.log("⚠️ Location not ready, skipping data fetch");
        }
      } else {
        // For pickup mode, no need to fetch products or categories
        console.log(
          "🏠 HomeClient - Pickup mode - skipping product/category fetch"
        );
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, deliveryType, isLocationLoading, isLocationReady, defaultAddress]); // Wait for authentication to be ready and watch deliveryType and address changes

  // Show loading only for delivery mode or auth loading
  if (authLoading) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show location loading indicator
  if (deliveryType === "delivery" && (isLocationLoading || !isLocationReady)) {
    return (
      <div className="min-h-screen">
        <LocationLoadingIndicator 
          isLocationLoading={isLocationLoading}
          isLocationReady={isLocationReady}
          className="py-20"
        />
      </div>
    );
  }

  // Show loading for delivery mode when fetching products
  if (deliveryType === "delivery" && loading) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">Loading products with stock information...</div>
      </div>
    );
  }

  return (
    <>
      {deliveryType === "pickup" ? (
        // Pickup mode: Show only stores (no popular items or products)
        <>
          <StoresGrid />
          <DiscountBanner />
        </>
      ) : (
        // Delivery mode: Show all products as before
        <>
          <ProductList
            title={true}
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            isDealsSelected={isDealsSelected}
          />
          <PopularItemsSection />
          <DiscountBanner />
        </>
      )}
    </>
  );
};

export default HomeClient;
