import { useState, useCallback, useEffect } from "react";
import { authService } from "../../../api";
import useErrorRedux from "../../../hooks/useErrorRedux";

// List of countries with ISO codes
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brazil" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
];

const useShippingInfo = () => {
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "US", // Default to US
    postalCode: "",
    phoneNumber: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const { showError, globalError } = useErrorRedux();

  // Load user profile and prefill shipping info
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getCurrentUser();
        const userData = response.user || {};

        // Only update shipping info fields that exist in user profile
        const userAddress = userData.address || {};
        const userPhone = userData.phone || "";

        // Convert country name to country code if needed
        let countryCode = userAddress.country || "US";
        if (countryCode.length > 2) {
          // If it's a full country name, try to match it to a code
          const foundCountry = COUNTRIES.find(
            (c) => c.name.toLowerCase() === countryCode.toLowerCase()
          );
          countryCode = foundCountry ? foundCountry.code : "US";
        }

        setShippingInfo((prevState) => ({
          ...prevState,
          name: userData.name || userData.username || "",
          address: userAddress.street || "",
          city: userAddress.city || "",
          state: userAddress.state || "",
          country: countryCode,
          postalCode: userAddress.zipCode || userAddress.postalCode || "",
          phoneNumber: userPhone,
        }));
      } catch (err) {
        console.error("Error loading user profile:", err);
        // Show error using Redux
        showError(
          "Error loading user profile. Using default shipping information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [showError]);

  // Handle form field changes
  const handleShippingInfoChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  // Validate shipping info
  const isShippingInfoValid = useCallback(() => {
    return (
      shippingInfo.name &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.country &&
      shippingInfo.postalCode &&
      shippingInfo.phoneNumber
    );
  }, [
    shippingInfo.name,
    shippingInfo.address,
    shippingInfo.city,
    shippingInfo.state,
    shippingInfo.country,
    shippingInfo.postalCode,
    shippingInfo.phoneNumber,
  ]);

  // Format shipping info for API
  const getFormattedShippingInfo = useCallback(() => {
    // Format shipping address for API - the backend expects a nested structure
    const shippingAddress = {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.postalCode,
      country: shippingInfo.country,
    };

    // Format shipping information as expected by the backend
    return {
      shippingAddress,
      shippingMethod: "standard",
      name: shippingInfo.name,
      phoneNumber: shippingInfo.phoneNumber,
    };
  }, [shippingInfo]);

  return {
    shippingInfo,
    handleShippingInfoChange,
    isShippingInfoValid,
    getFormattedShippingInfo,
    COUNTRIES,
    isLoading,
    error: globalError, // Return global error from Redux for backward compatibility
  };
};

export default useShippingInfo;
