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
 
  return (
    <>
      <UploadDropzone
        uploadUrl={generateUploadUrl}
        fileTypes={[".pdf", "image/*"]}
        onClientUploadComplete={saveAfterUpload}
        onUploadError={(error) => {
          // Do something with the error.
          alert(`ERROR! ${error}`);
        }}
      />
    </>
  );
}

export default App;