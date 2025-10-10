"use client";
import { Product } from "../store";
import React, { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  products: Product[];
  categoryName: string;
  categoryId: string;
}

const ProductRow = ({ products, categoryName, categoryId }: Props) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const router = useRouter();

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Check scroll buttons on mount and when products change
  React.useEffect(() => {
    checkScrollButtons();
  }, [products]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 200; // Approximate width of each product card + gap
      scrollContainerRef.current.scrollBy({
        left: -cardWidth * 3, // Scroll by 3 cards at a time
        behavior: "smooth",
      });
      // Update button states after scroll
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = 200; // Approximate width of each product card + gap
      scrollContainerRef.current.scrollBy({
        left: cardWidth * 3, // Scroll by 3 cards at a time
        behavior: "smooth",
      });
      // Update button states after scroll
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Show all products in the scrollable view, filtering out invalid products
  const visibleProducts = products.filter(product => 
    product && 
    product.id && 
    product.name && 
    typeof product.id === 'number' && 
    typeof product.name === 'string'
  );

  const handleSeeAllClick = () => {
    // Store subcategory products and info for caching
    sessionStorage.setItem(`subcategory_${categoryId}_products`, JSON.stringify(products));
    sessionStorage.setItem(`subcategory_${categoryId}_name`, categoryName);
    sessionStorage.setItem(`subcategory_${categoryId}_id`, categoryId);
    
    // Store parent category info for back navigation
    // We need to get the parent category ID from the current context
    // This will be set by the parent component that knows the parent category
    const parentCategoryId = (window as any).currentParentCategoryId;
    if (parentCategoryId) {
      sessionStorage.setItem(`subcategory_${categoryId}_parent_id`, parentCategoryId.toString());
    }
    
    // For "all" category, redirect to a special route or handle differently
    if (categoryId === "all") {
      // You might want to create a special route for "all products" or handle this differently
      console.log("See all products clicked - all products already displayed");
      return;
    }
    
    router.push(`/categories/${categoryId}`);
  };

  return (
    <div className="mb-8">
      {/* Header with category name and See All button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-600">
          {categoryName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeeAllClick}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            See All
          </button>
          <div className="flex gap-1">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full transition-colors ${
                canScrollLeft
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-2 rounded-full transition-colors ${
                canScrollRight
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable product container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {visibleProducts.map((product) => (
            <motion.div
              key={product?.id}
              layout
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-shrink-0 w-[180px] sm:w-[200px]"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductRow;
