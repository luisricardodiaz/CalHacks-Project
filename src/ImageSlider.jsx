import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((currentIndex + 1) % images.length);
    }, 5000); // Change the interval as needed (5 seconds in this example)

    return () => clearInterval(interval);
  }, [currentIndex, images]);

  return (
    <div className="relative h-screen overflow-hidden -z-10">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Image ${index}`}
          className={`absolute w-full h-full transform -z-10 ${
            index === currentIndex ? 'translate-y-0' : 'translate-y-full'
          } transition-transform duration-1000`}
        />
      ))}
    </div>
  );
};

export default ImageSlider;




