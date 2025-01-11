import React from 'react';
import { useState } from 'react';

interface CarouselProps {
  images: string[]; // Array of image URLs
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative w-full h-64 overflow-hidden">
      <div className="flex transition-transform duration-300" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Slide ${index}`} className="w-full h-full object-cover" />
        ))}
      </div>
      <button onClick={prevImage} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow">
        &#10094;
      </button>
      <button onClick={nextImage} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow">
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
