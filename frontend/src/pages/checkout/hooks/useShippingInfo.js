import { useState, useEffect } from "react";
import { authService } from "../../../api";

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
    country: "US",
    postalCode: "",
    phoneNumber: "",
  });

  // Load user profile data once on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      // Check if user is logged in
      const token = localStorage.getItem("auth-token");
      if (!token || localStorage.getItem("user-logged-out") === "true") {
        return; // Exit if not logged in
      }

      try {
        // Get user data
        const response = await authService.getCurrentUser();

        // Process response if it contains user data
        if (
          response &&
          ((response.success && response.user) || response._id || response.id)
        ) {
          const userData =
            response.success && response.user ? response.user : response;
          const userAddress = userData.address || {};

          // Update shipping info with user data
          setShippingInfo({
            name: userData.name || userData.username || "",
            address: userAddress.street || "",
            city: userAddress.city || "",
            state: userAddress.state || "",
            country: userAddress.country || "US",
            postalCode: userAddress.zipCode || userAddress.postalCode || "",
            phoneNumber: userData.phone || "",
          });
        }
      } catch (err) {
        // Silently fail - form will remain empty
        console.error("Error loading user profile:", err);
      }
    };

    loadUserProfile();
  }, []);

  // Handle form field changes
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validate shipping info
  const isShippingInfoValid = () => {
    return (
      shippingInfo.name &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.country &&
      shippingInfo.postalCode &&
      shippingInfo.phoneNumber
    );
  };

  // Format shipping info for API
  const getFormattedShippingInfo = () => ({
    shippingAddress: {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.postalCode,
      country: shippingInfo.country,
    },
    shippingMethod: "standard",
    name: shippingInfo.name,
    phoneNumber: shippingInfo.phoneNumber,
  });

  return {
    shippingInfo,
    handleShippingInfoChange,
    isShippingInfoValid,
    getFormattedShippingInfo,
    COUNTRIES,
  };
};

export default useShippingInfo;
