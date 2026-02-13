import React, { createContext, useContext, ReactNode } from 'react';
import { useAdmin, GalleryImage } from './AdminContext';

// We re-export the type from AdminContext to avoid circular deps if possible, 
// or just use the one from AdminContext.
export type { GalleryImage };

interface GalleryContextType {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id'>) => Promise<boolean>;
  removeImage: (id: string) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gallery, addGalleryImage, removeGalleryImage } = useAdmin();

  return (
    <GalleryContext.Provider value={{
      images: gallery,
      addImage: addGalleryImage,
      removeImage: removeGalleryImage
    }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('useGallery must be used within a GalleryProvider');
  return context;
};