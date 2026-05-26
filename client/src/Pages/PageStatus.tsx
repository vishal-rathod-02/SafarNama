import React from "react";
import { SkeletonLoader } from '../Components/Shared/SkeletonLoader';
import { ErrorMessage } from "../Components/Shared/ErrorMessage";
import { PageStatusProps } from "../hooks/types";

export const PageStatus: React.FC<PageStatusProps> = ({
  isLoading,
  error,
  onRetry,
  errorVariant = "generic",
  onOpenAuthModal,
}) => {
  const handlePrimaryClick = () => {
    if (errorVariant === "auth" && onOpenAuthModal) {
      onOpenAuthModal("login");
      return;
    }
    onRetry?.();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-10">

      {isLoading && !error && (   
        <SkeletonLoader />
      )}

      {error && (
        <ErrorMessage
          message={error}
          variant={errorVariant}
          onPrimaryAction={handlePrimaryClick}  
        />
      )}
    </div>
  );
};