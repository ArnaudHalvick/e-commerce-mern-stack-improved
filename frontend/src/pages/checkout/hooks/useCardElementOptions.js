import { useMemo } from "react";

const useCardElementOptions = () => {
  // Memoize card element options to prevent re-renders
  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    }),
    []
  );

  return cardElementOptions;
};

export default useCardElementOptions;
