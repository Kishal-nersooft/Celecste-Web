"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { Store } from "@/types/store";
import { getUserAddresses } from "@/lib/api";

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  deliveryType: "pickup" | "delivery";
  setDeliveryType: (type: "pickup" | "delivery") => void;
  hasSelectedDeliveryType: boolean;
  setHasSelectedDeliveryType: (hasSelected: boolean) => void;
  defaultAddress: any | null;
  setDefaultAddress: (address: any | null) => void;
  addressId: number | null;
  setAddressId: (id: number | null) => void;
  isLocationLoading: boolean;
  isLocationReady: boolean; // True when we have valid location data
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with default values to prevent hydration mismatch
  const [selectedLocation, setSelectedLocation] = useState("Location");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
  const [hasSelectedDeliveryType, setHasSelectedDeliveryType] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<any | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  
  // Add loading state for better UX
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  
  // Check if location is ready (has valid data)
  const isLocationReady = useMemo(() => {
    return !!(defaultAddress && defaultAddress.latitude && defaultAddress.longitude);
  }, [defaultAddress]);

  // Persistence functions
  const saveToLocalStorage = useCallback((key: string, value: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error);
      }
    }
  }, []);

  const loadFromLocalStorage = useCallback((key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn(`Failed to load ${key} from localStorage:`, error);
        return null;
      }
    }
    return null;
  }, []);

  // Memoized setters to prevent unnecessary re-renders
  const memoizedSetSelectedLocation = useCallback((location: string) => {
    setSelectedLocation((prev) => {
      if (prev !== location) {
        saveToLocalStorage("selectedLocation", location);
        return location;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  const memoizedSetSelectedStore = useCallback((store: Store | null) => {
    setSelectedStore((prev) => {
      if (prev !== store) {
        saveToLocalStorage("selectedStore", store);
        return store;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  const memoizedSetDeliveryType = useCallback((type: "pickup" | "delivery") => {
    setDeliveryType((prev) => {
      if (prev !== type) {
        saveToLocalStorage("deliveryType", type);
        return type;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  const memoizedSetHasSelectedDeliveryType = useCallback(
    (hasSelected: boolean) => {
      setHasSelectedDeliveryType((prev) => {
        if (prev !== hasSelected) {
          saveToLocalStorage("hasSelectedDeliveryType", hasSelected);
          return hasSelected;
        }
        return prev;
      });
    },
    [saveToLocalStorage]
  );

  const memoizedSetDefaultAddress = useCallback((address: any | null) => {
    setDefaultAddress((prev: any) => {
      if (prev !== address) {
        saveToLocalStorage("defaultAddress", address);
        return address;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  const memoizedSetAddressId = useCallback((id: number | null) => {
    setAddressId((prev) => {
      if (prev !== id) {
        saveToLocalStorage("selectedAddressId", id);
        return id;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  // Load from localStorage after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem("selectedLocation");
      const savedStore = localStorage.getItem("selectedStore");
      const savedDeliveryType = localStorage.getItem("deliveryType");
      const savedHasSelectedDeliveryType = localStorage.getItem("hasSelectedDeliveryType");
      const savedAddress = localStorage.getItem("defaultAddress");
      const savedAddressId = localStorage.getItem("selectedAddressId");

      if (savedLocation) setSelectedLocation(savedLocation);
      if (savedStore) setSelectedStore(JSON.parse(savedStore));
      if (savedDeliveryType) setDeliveryType(savedDeliveryType as "pickup" | "delivery");
      if (savedHasSelectedDeliveryType) setHasSelectedDeliveryType(savedHasSelectedDeliveryType === "true");
      if (savedAddress) setDefaultAddress(JSON.parse(savedAddress));
      if (savedAddressId) setAddressId(parseInt(savedAddressId));
    }
  }, []);

  // Load default address on mount - optimized for quick loading
  useEffect(() => {
    const loadDefaultAddress = async () => {
      setIsLocationLoading(true);
      
      try {
        // If we already have valid data from localStorage, use it immediately
        if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
          console.log("✅ Using cached location data for immediate stock loading");
          setIsLocationLoading(false);
          return;
        }

        // Load from backend to get fresh data
        console.log("🔄 Loading fresh address data from backend...");
        const addresses = await getUserAddresses();
        console.log("🔍 Backend addresses loaded:", addresses);

        if (addresses && addresses.length > 0) {
          // Find the default address or use the first one
          const defaultAddr =
            addresses.find((addr: any) => addr.is_default) || addresses[0];
          console.log("📍 Default address found:", defaultAddr);

          // Update all location data
          setDefaultAddress(defaultAddr);
          setAddressId(defaultAddr.id);
          setSelectedLocation(defaultAddr.address);
          setHasSelectedDeliveryType(true);

          console.log("💾 Location data updated and ready for stock loading");
        } else {
          console.log("⚠️ No addresses found in backend");
        }
      } catch (error) {
        console.warn("Could not load default address:", error);
      } finally {
        setIsLocationLoading(false);
      }
    };

    loadDefaultAddress();
  }, []);

  const contextValue = useMemo(
    () => ({
      selectedLocation,
      setSelectedLocation: memoizedSetSelectedLocation,
      selectedStore,
      setSelectedStore: memoizedSetSelectedStore,
      deliveryType,
      setDeliveryType: memoizedSetDeliveryType,
      hasSelectedDeliveryType,
      setHasSelectedDeliveryType: memoizedSetHasSelectedDeliveryType,
      defaultAddress,
      setDefaultAddress: memoizedSetDefaultAddress,
      addressId,
      setAddressId: memoizedSetAddressId,
      isLocationLoading,
      isLocationReady,
    }),
    [
      selectedLocation,
      memoizedSetSelectedLocation,
      selectedStore,
      memoizedSetSelectedStore,
      deliveryType,
      memoizedSetDeliveryType,
      hasSelectedDeliveryType,
      memoizedSetHasSelectedDeliveryType,
      defaultAddress,
      memoizedSetDefaultAddress,
      addressId,
      memoizedSetAddressId,
      isLocationLoading,
      isLocationReady,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
