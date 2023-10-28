import { useMutation } from "convex/react";
import { UploadDropzone } from "@xixixao/uploadstuff/react";
import "@xixixao/uploadstuff/react/styles.css";
import { api } from "../convex/_generated/api";
import { Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from 'react';
import ImageSlider from './ImageSlider';
import { Waveform } from '@uiball/loaders';

const images = ['src/assets/image1.jpeg', 'src/assets/image2.jpeg', 'src/assets/image3.jpeg', 'src/assets/image4.jpeg', 'src/assets/image5.jpeg', 'src/assets/image6.jpeg', 'src/assets/image7.jpeg', 'src/assets/image8.jpeg', 'src/assets/image9.jpeg', 'src/assets/image10.jpeg', 'src/assets/image11.jpeg']

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveStorageId = useMutation(api.files.saveStorageId);
  const waveRef = useRef(null);

  const saveAfterUpload = async (uploaded) => {
    await saveStorageId({ storageId: (uploaded[0].response).storageId });
  };

  const handleGeneratePlaylistClick = async () => {

    setIsLoading(prev => !prev);

    await new Promise((resolve) => setTimeout(resolve, 100));

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });

    // Simulate an asynchronous operation (e.g., generating a playlist)
    await saveAfterUpload([]); // Replace this with your actual logic

    setIsLoading(false);
  };

  function isBackgroundColorWhite(element) {
    if (!element) {
      return false; // Return false if the element is not provided
    }
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    //console.log(computedStyle);
  
    // Check if the background color is white
    return (
      backgroundColor === 'rgb(255, 255, 255)'
    );
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array
  }
  
  
  const element = document.querySelector('body'); // Replace with your element selector
  const isLightMode = isBackgroundColorWhite(element);
  let shuffleimage = shuffleArray(images);

  return (
    <>
      <h1 className="title">VibeS</h1>
      <div className="App">
        <ImageSlider images={shuffleimage} />
        <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center text-white">
          <h1 className="text-4xl font-bold"> Make a playlist for any </h1>
          <h1 className="title">
            <span className="text-4xl font-bold" style={{ color: '#E63946' }}>V</span>
            <span className="text-4xl font-bold" style={{ color: '#FFD700' }}>i</span>
            <span className="text-4xl font-bold" style={{ color: '#228B22' }}>b</span>
            <span className="text-4xl font-bold" style={{ color: '#457B9D' }}>e</span>
            <span className="text-4xl font-bold" style={{ color: '#1D3557' }}>S</span>
          </h1>
        </div>
        <div className="dragPicture">
          <UploadDropzone
            uploadUrl={generateUploadUrl}
            fileTypes={[".pdf", "image/*"]}
            onClientUploadComplete={saveAfterUpload}
            onUploadError={(error) => {
              alert(`ERROR! ${error}`);
            }}
          />
        </div>
        <div className={`GeneratePlaylistButton ${isLoading ? 'loading' : ''}`}>
          <Button onClick={handleGeneratePlaylistClick}>Generate Playlist</Button>
        </div>
        <div className={`loadingPlaylistAnimation ${isLoading ? 'show' : 'hidden'}`}>
          <Waveform
            id={'waveform'}
            size={100}
            lineWeight={3.5}
            speed={1}
            color= {isLightMode ? 'black' : 'white'}
          />
        </div>
      </div>
    </>
  );
}

// console.log(isLightMode)
export default App;

