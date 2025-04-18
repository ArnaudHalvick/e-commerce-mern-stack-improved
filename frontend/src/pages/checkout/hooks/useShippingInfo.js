import { useState, useEffect } from "react";
import { authService } from "../../../api";
import { COUNTRIES } from "../../../utils/validationSchemas";

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
