import React, { useState } from "react";
import { useGetLoginPageQuery } from "../../redux/feature/loginPage";
import { Button } from "@/components/ui/button";
import LoginImageModal from "@/components/modals/LoginImageModal";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // API returns relative paths like `/images/...`
  return `${apiBaseUrl}${path}`;
};

const LoginImage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetLoginPageQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-sm text-gray-400">Loading image...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-sm text-red-400">
          Failed to load login images.
        </span>
      </div>
    );
  }

  const images = data?.data?.[0]?.images || [];

  if (!images.length) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <span className="text-sm text-gray-400">No login images found.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="mb-3">
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Update Login Image
        </Button>
      </div>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        {images.map((imgPath, index) => (
          <img
            key={imgPath || index}
            src={buildImageUrl(imgPath)}
            alt={`Login visual ${index + 1}`}
            className="w-full h-80 rounded-lg object-cover"
          />
        ))}
      </div>
      <LoginImageModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default LoginImage;