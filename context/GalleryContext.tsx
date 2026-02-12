import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
}

interface GalleryContextType {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id'>) => void;
  removeImage: (id: string) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const INITIAL_IMAGES: GalleryImage[] = [
  { 
    id: '1', 
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywjTY-ACoD5T274KEVbpjZpt1UsEACtIVbJMHCRFz6yvYkav1NDLgGVB_12KHvz-YIZHvQUer2FW__NQSlJOCK6aBQToLrM1_jTtkSfTu3dzqCouMKKe34n-UORwMKpwM_DqoWczq5GQZ_mTkp3jJIYcvRpXWs79XAgX29VkaUNEqffEILxgiOYXS2Ly14ndhnImJeE65WQdbkLJxGkoe6e68SEVHC_hPpQssIcTjsuT8vbXHWHITKEwrs4a-xvJ_6MXOM352ob4', 
    title: 'Residential Roof Mount', 
    category: 'Residential',
    description: 'A 10kW residential installation in Lagos, featuring 24 high-efficiency panels and a smart inverter system for 24/7 power.'
  },
  { 
    id: '2', 
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeVJOVAEcn2TC5LANFimRUWMhIN1Fbg-T_bpf2XYA413sZwSDYiLJF4tbkshKq0s8soG27g-Wza1A8rYfblgtmY8hqjnItF5Hn0W_rgBHM4_1qF2SaLsG6Nbq4U8F6mBvQeMSg7X3d4h_D9xYCzk91j3L2P8WB1u7btZhBcAzPSnJsxf8rFp0sHsYXEEfHYWuh5PyvPH3BazC0XxSqJ2HT_7QCGlgoA4jWZ94oKMQB11tTaQaPRdj8N1lzyLkAmBwGOLnKd0AQ6qg', 
    title: 'Commercial Complex', 
    category: 'Commercial',
    description: 'Full solar grid integration for a shopping complex, reducing diesel generator costs by 85%.'
  },
  { 
    id: '3', 
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU7uVdcCm0kXjHes7ZT0BeqnJUSq4eke4vXvI-DZPMxrV4SDZnXNYV3d_0F5_jnTICdM3WprFui3n7tWbQQSoNPTZs69lw0DNEojKaOBgqXc1xUg7L2J_vfY8CvpfQqlMK5He9M_fD18lNStUsi6N604UmX-4lCxrjXDz2Ars1UuGiSY8gEgtVFIT8gxXUL42FkMWtKB4AzGgfxdYhFJxl4iw0Qjk8WWyUsvF8sWbChVg8td7wSh36njhT5AqpoITrdGFB9shLJAQ', 
    title: 'Modern Villa Installation', 
    category: 'Residential',
    description: 'A sleek, aesthetic installation designed to blend perfectly with the modern architecture of this luxury villa.'
  },
  { 
    id: '4', 
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0m3nZ0RBhLRNfyxr_j9C-lR9ERyMyrPqxD-FLq1pU6j2KGgeYHGSEyATg7YjZ2309ZK9dWmvZvV23nVVkiphg8pm3NgXJHHGkCLGCCMnfU3BPPeMhRYbomnx_NeMZEnVTkesWhAS59GaqVKeaxSdbCpENwSwGstJjjY3Emfg9xrW3c4yl8nd2ZIp1xXQQya9LVLDCaB25TqYFr8O1mRBy-37GFTfTgOGRvJedqBvC_KnKm4_-Hu2L7t11VBG6Th3DMgg69_hkP7s', 
    title: 'Industrial Energy Storage', 
    category: 'Industrial',
    description: 'Heavy-duty battery bank installation supporting heavy machinery operations during grid downtime.'
  }
];

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem('greenlife_gallery');
    return saved ? JSON.parse(saved) : INITIAL_IMAGES;
  });

  useEffect(() => {
    localStorage.setItem('greenlife_gallery', JSON.stringify(images));
  }, [images]);

  const addImage = (image: Omit<GalleryImage, 'id'>) => {
    const newImage = { ...image, id: Date.now().toString() };
    setImages(prev => [newImage, ...prev]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <GalleryContext.Provider value={{ images, addImage, removeImage }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) throw new Error('useGallery must be used within a GalleryProvider');
  return context;
};