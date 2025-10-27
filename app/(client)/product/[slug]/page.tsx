"use client";

import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import SmartBackButton from "@/components/SmartBackButton";
import { useAuth } from "@/components/FirebaseAuthProvider";
import { useLocation } from "@/contexts/LocationContext";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { LuStar } from "react-icons/lu";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";
import { Product } from "../../../../store";
import { getProductById, getProductsWithPricing } from "@/lib/api";

const ProductPage = ({ params }: { params: { slug: string } }) => {
  const { user, loading: authLoading } = useAuth();
  const { defaultAddress, isLocationLoading } = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { slug } = params;

  // Fetch product data with authentication
  useEffect(() => {
    const fetchProduct = async () => {
      if (authLoading || isLocationLoading) return; // Wait for auth and location to be ready
      
      if (!user) {
        setError("Please sign in to view product details");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 ProductPage - Fetching product with authentication...");
        console.log("🔍 ProductPage - User authenticated:", !!user);
        console.log("🔍 ProductPage - Product slug:", slug);
        console.log("🔍 ProductPage - Default address:", defaultAddress);
        
        setLoading(true);
        setError(null);

        // Get latitude and longitude from user's default address
        const latitude = defaultAddress?.latitude;
        const longitude = defaultAddress?.longitude;

        console.log("🔍 ProductPage - Using location:", { latitude, longitude });

        // Use latitude and longitude for proper inventory lookup (no store IDs)
        const foundProduct = await getProductById(
          slug, // Product ID/slug
          undefined, // No store IDs - let backend determine based on location
          latitude, // User's latitude
          longitude // User's longitude
        );

        if (!foundProduct) {
          console.log("❌ ProductPage - Product not found:", slug);
          setError("Product not found");
          return;
        }

        console.log("✅ ProductPage - Found product:", {
          id: foundProduct.id,
          name: foundProduct.name,
          pricing: foundProduct.pricing
        });

        setProduct(foundProduct);
      } catch (error) {
        console.error("❌ ProductPage - Error fetching product:", error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [user, authLoading, slug, defaultAddress, isLocationLoading]);

  // Debug logging when product is loaded
  useEffect(() => {
    if (product) {
      console.log("=== PRODUCT PAGE DEBUG ===");
      console.log("Product ID/Slug:", slug);
      console.log("Full Product Data:", JSON.stringify(product, null, 2));
      console.log("Pricing Data:", product?.pricing);
      console.log("Discount Applied:", product?.pricing?.discount_applied);
      console.log("Discount Percentage:", product?.pricing?.discount_percentage);
      console.log("Final Price:", product?.pricing?.final_price);
      console.log("Base Price:", product?.pricing?.base_price);
      console.log("Legacy Price:", product?.price);
      // console.log("Inventory Data:", product?.inventory); // Inventory not available in Product type
      console.log("Image URLs:", product?.image_urls);
      console.log("Product Name:", product?.name);
      console.log("Product Brand:", product?.brand);
      console.log("========================");
    }
  }, [product, slug]);

  // Handle loading and error states
  if (authLoading || isLocationLoading || loading) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  // Get the first valid image URL
  const imageUrl = product?.image_urls?.[0] || product?.imageUrl;
  const hasValidImage =
    imageUrl && imageUrl.trim() !== "" && imageUrl.startsWith("http");

  return (
    <div>
      {/* Back Button */}
      <Container className="py-4">
        <SmartBackButton className="mb-4" />
      </Container>

      <Container className="flex flex-col md:flex-row gap-10 py-10">
        {hasValidImage && (
          <div className="w-full md:w-1/2 h-auto border border-darkBlue/20 shadow-md rounded-md group overflow-hidden relative">
            {/* Discount Tag on Product Image */}
            {((product?.pricing?.discount_applied && product.pricing.discount_applied > 0) || 
              (product?.pricing?.discount_percentage && product.pricing.discount_percentage > 0)) && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-lg shadow-lg">
                    {Math.round(product.pricing?.discount_percentage || 0)}% OFF
                  </div>
                </div>
              )}
            <Image
              src={imageUrl}
              alt={product.name || "Product image"}
              width={700}
              height={700}
              priority
              className="w-full max-h-[550px] group-hover:scale-110 hoverEffect rounded-md"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
          <div>
            {/* Discount Tag for Product Page */}
            {((product?.pricing?.discount_applied && product.pricing.discount_applied > 0) || 
              (product?.pricing?.discount_percentage && product.pricing.discount_percentage > 0)) && (
                <div className="mb-4">
                  {/* <div className="bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-lg inline-block shadow-lg">
                  🎉 {product.pricing.applied_discounts[0].discount_value}% OFF - Limited Time Offer!
                </div> */}
                </div>
              )}

            <p className="text-lg font-bold text-gray-800 mb-1 uppercase tracking-wide">
              {product?.brand}
            </p>
            <p className="text-4xl font-bold mb-2">{product?.name}</p>
            <p className="text-sm text-gray-500 mb-2">
              {product?.unit_measure || product?.unit}
            </p>
            {/* <div className="flex items-center gap-2">
              <div className="text-lightText flex items-center gap-.5 text-sm">
                {Array.from({ length: 5 }).map((_, index) => {
                  const isLastStar = index === 4;
                  return (
                    <LuStar
                      fill={!isLastStar ? "#fca99b" : "transparent"}
                      key={index}
                      className={`${isLastStar ? "text-gray-500" : "text-lightOrange"}`}
                    />
                  );
                })}
              </div>
              <p className="text-sm font-medium text-gray-500">{`(25 reviews)`}</p>
            </div> */}
          </div>
          {/* Debug Information - Remove this after debugging */}

          {/* Custom Price Display with Discount Styling */}
          {((product?.pricing?.discount_applied && product.pricing.discount_applied > 0) || 
            (product?.pricing?.discount_percentage && product.pricing.discount_percentage > 0)) ? (
            <div className="flex items-center gap-3">
              {/* Discount Percentage Badge */}
              {/* <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                {product.pricing?.discount_percentage || 
                 product.pricing?.discount_applied || 
                 0}% OFF
              </span> */}

              {/* Final Price in Red Background - Bigger text for discounted products */}
              <div className="bg-red-500 text-white text-lg font-bold px-2 py-1 rounded-md">
                LKR{" "}
                {(
                  product?.pricing?.final_price ||
                  product?.base_price ||
                  product?.price ||
                  0
                ).toFixed(2)}
              </div>

              {/* Base Price with Strikethrough */}
              <div className="text-gray-500 text-sm line-through">
                LKR {(product?.pricing?.base_price || 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-800">
              LKR{" "}
              {(
                product?.pricing?.final_price ||
                product?.base_price ||
                product?.price ||
                0
              ).toFixed(2)}
            </div>
          )}

          {/* Savings Amount Display */}
          {/* {((product?.pricing?.discount_applied && product.pricing.discount_applied > 0) || 
            (product?.pricing?.discount_percentage && product.pricing.discount_percentage > 0)) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold">
                    💰 You Save:
                  </span>
                  <span className="text-green-700 font-bold text-lg">
                    LKR {((product.pricing?.base_price || 0) - (product.pricing?.final_price || 0)).toFixed(2)}
                  </span>
                  <span className="text-green-600 text-sm">
                    ({product.pricing?.discount_percentage || 
                      product.pricing?.discount_applied || 
                      0}% off)
                  </span>
                </div>
              </div>
            )} */}
          {/* Stock display removed as it's not in the new Product interface */}

          {/* <p className="text-base text-gray-800">
            <span className="bg-black text-white px-3 py-1 text-sm font-semibold rounded-md mr-2">
              20
            </span>{" "}
            People are viewing this right now
          </p> */}

          <p className="text-sm text-gray-600 tracking-wide">
            {product?.description}
          </p>
          <AddToCartButton product={product} />
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <RxBorderSplit className="text-lg" />
              <p>Compare color</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <FaRegQuestionCircle className="text-lg" />
              <p>Ask a question</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <TbTruckDelivery className="text-lg" />
              <p>Delivery & Return</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
              <FiShare2 className="text-lg" />
              <p>Share</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">
                Free Shipping
              </p>
              <p className="text-sm text-gray-500">
                Free shipping over order Rs. 15,000
              </p>
            </div>
            <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue hoverEffect rounded-md">
              <p className="text-base font-semibold text-black">
                Flexible Payment
              </p>
              <p className="text-sm text-gray-500">
                Pay with Multiple Credit Cards
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductPage;
