import { useState } from 'react';
import { useMutation } from "convex/react";
import { UploadDropzone } from "@xixixao/uploadstuff/react";
import "@xixixao/uploadstuff/react/styles.css";
import { api } from "../convex/_generated/api";
 
function App() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveStorageId = useMutation(api.files.saveStorageId);
  const saveAfterUpload = async (uploaded) => {
    await saveStorageId({ storageId: (uploaded[0].response).storageId });
  };

  const [selectedImage, setSelectedImage] = useState(null);
 
  return (
    <>
      {/* <UploadDropzone
        uploadUrl={generateUploadUrl}
        fileTypes={["image/*"]}
        onClientUploadComplete={saveAfterUpload}
        onUploadError={(error) => {
          // Do something with the error.
          alert(`ERROR! ${error}`);
        }}
      /> */}
      {selectedImage && (
        <div>
          <img 
            alt='not found'
            width={250}
            src={URL.createObjectURL(selectedImage)}
          />
          <br />
          <button onClick={() => setSelectedImage(null)}>Remove</button>
        </div>
      )}
      <br /><br />

      <input type='file' name='image' onChange={(e) => {
        console.log(e.target.files[0])
        setSelectedImage(e.target.files[0])
      }}/>
    </>
  );
}

export default App;