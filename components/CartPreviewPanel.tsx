"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight, Plus, AlertTriangle, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useCartStore from "@/store";
import PriceFormatter from "./PriceFormatter";
import QuantityButtons from "./QuantityButtons";
import toast from "react-hot-toast";
import EmptyCart from "./EmptyCart";
import { useLocation } from "@/contexts/LocationContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CartPreviewPanelProps {
  children: React.ReactNode;
}

const CartPreviewPanel = ({ children }: CartPreviewPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewCartDialog, setShowNewCartDialog] = useState(false);
  const [isCreatingCart, setIsCreatingCart] = useState(false);
  const cartStore = useCartStore();
  const { addressId, selectedLocation } = useLocation();

  const handleDeleteProduct = async (productId: number) => {
    await cartStore.deleteCartProduct(productId);
    toast.success("Product removed from cart!");
  };

  const handleCreateNewCart = async () => {
    const hasItems = cartStore.items.length > 0;
    
    if (hasItems) {
      setShowNewCartDialog(true);
    } else {
      await createNewCart();
    }
  };

  const createNewCart = async () => {
    try {
      setIsCreatingCart(true);
      const newCart = await cartStore.createNewCart();
      toast.success(`New cart "${newCart.name}" created!`);
      setShowNewCartDialog(false);
    } catch (error) {
      console.error('Failed to create new cart:', error);
      toast.error('Failed to create new cart. Please try again.');
    } finally {
      setIsCreatingCart(false);
    }
  };


  // Use only local cart calculations - no backend data
  const safeItems = cartStore.items || [];
  const totalPrice = safeItems.length > 0 ? cartStore.getTotalPrice() : 0;
  const itemCount = safeItems.length;
  const activeCart = cartStore.getActiveCart();
  
  // Debug: Log cart items
  if (safeItems.length > 0) {
    console.log('🔍 CartPreviewPanel - Cart items:', safeItems.map(item => ({
      productId: item.product?.id,
      productName: item.product?.name,
      hasImage: !!item.product?.image_urls?.length,
      hasPricing: !!item.product?.pricing
    })));
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] flex flex-col">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-6 w-6" />
              Cart({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </SheetTitle>
            
            {/* Create New Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewCart}
              disabled={isCreatingCart}
              className="flex items-center gap-1 text-xs"
            >
              <Plus className="h-3 w-3" />
              {isCreatingCart ? 'Creating...' : 'New Cart'}
            </Button>
          </div>
        </SheetHeader>

        {safeItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyCart />
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {safeItems.map((item) => {
                if (!item || !item.product) return null;
                return (
                  <div
                    key={item.product.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {item.product.image_urls?.[0] || item.product.imageUrl ? (
                      <Image
                        src={(item.product.image_urls?.[0] || item.product.imageUrl) as string}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[80px] h-[80px] bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.product.name}
                      </h3>
                      <div className="text-gray-600 text-sm mb-2">
                        {item.product.pricing?.discount_applied && item.product.pricing.discount_applied > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                              {Math.round(item.product.pricing.discount_percentage || 0)}% OFF
                            </span>
                            <PriceFormatter 
                              amount={item.product.pricing.final_price || 0} 
                              className="text-red-600 font-semibold"
                            />
                            <PriceFormatter 
                              amount={item.product.pricing.base_price || 0} 
                              className="line-through text-gray-400 text-xs"
                            />
                          </div>
                        ) : (
                          <PriceFormatter 
                            amount={item.product.pricing?.final_price || item.product.base_price || item.product.price || 0} 
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <QuantityButtons
                          product={item.product}
                          className="text-xs"
                          onQuantityChange={() => {
                            // No need to refresh preview data - cart is purely local
                            // The cart state will automatically update the UI
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(item.product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="mt-6 space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Order Summary</h3>
                  <div className="text-xs text-gray-500">
                    Delivery fees calculated at checkout
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    <PriceFormatter amount={cartStore.getSubTotalPrice()} />
                  </span>
                </div>
                
                {/* Delivery fees, service charges, and tax calculated at checkout */}
                
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>
                    <PriceFormatter amount={totalPrice} />
                  </span>
                </div>
              </div>

              {/* Go to Checkout Button */}
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                <Button className="w-full mt-4 flex items-center justify-center gap-2">
                  Go to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
      
      {/* New Cart Confirmation Dialog */}
      <Dialog open={showNewCartDialog} onOpenChange={setShowNewCartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Create New Cart?
            </DialogTitle>
            <DialogDescription>
              You currently have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart. 
              Creating a new cart will start fresh with an empty cart.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Your current cart will be saved and you can switch back to it later.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowNewCartDialog(false)}
              disabled={isCreatingCart}
            >
              Cancel
            </Button>
            <Button
              onClick={createNewCart}
              disabled={isCreatingCart}
              className="flex items-center gap-2"
            >
              {isCreatingCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create New Cart
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};

export default CartPreviewPanel;