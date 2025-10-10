"use client";
import { Product } from "../store";
import React from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  products: Product[];
}

const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {products?.map((product) => (
        <motion.div
          key={product?.id} // Use product.id as the key
          layout
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
