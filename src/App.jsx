import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { useState, useEffect } from "react"


function App() {
  const [imageUploaded, setImageUploaded] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    async function asyncWrapper() {
      if (imageUploaded == false) {
        console.log("please")
        return
      }
      // React.StrictMode in main.jsx makes this code run twice
      async function scenesQuery(filename) {
        const data = await (await fetch(filename)).arrayBuffer()
        const response = await fetch(
          "https://api-inference.huggingface.co/models/jmillan736/BEiT-Scenes",
          {
            headers: {Authorization: `Bearer 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`},
            method: "POST",
            body: data,
          }
        );
        const result = await response.json();
        if ("error" in result) {
          throw new Error("API Call failed! " + result.error);
        }
        return result;
      }

      async function timeQuery(filename) {
        const data = await (await fetch(filename)).arrayBuffer()
        const response = await fetch(
          "https://api-inference.huggingface.co/models/jmillan736/BEiT-Time-Of-Day",
          {
            headers: {Authorization: `Bearer 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`},
            method: "POST",
            body: data,
          }
        );
        const result = await response.json();
        if ("error" in result) {
          throw new Error("API Call failed! " + result.error);
        }
        return result;
      }
      
      async function callQuery(maxRetries, query) {
        if (maxRetries > 5) {
          throw new Error("Maximum number of API Calls exceeded");
        }
        try {
          const answer = await query(imageUrl)
          return answer;
        } catch (error) {
          setTimeout(() => {console.log(error + " Retrying...")}, 1000)
          await callQuery(maxRetries + 1, query)
        }
      }

      const scenesOutput = await callQuery(0, scenesQuery);
      const timeOutput = await callQuery(0, timeQuery);
      
      console.log(scenesOutput)
      console.log(timeOutput)
    }
    asyncWrapper().then(() => {}).catch((error) => console.log("FAILED: " + error))
  }, [imageUploaded, imageUrl]);

  const [newIdea, setNewIdea] = useState("")
  const [includeRandom, setIncludeRandom] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  const ideas = useQuery(api.myFunctions.listIdeas)
  const saveIdea = useMutation(api.myFunctions.saveIdea)
  const generateIdea = useAction(api.myFunctions.fetchRandomIdea)

  const morningSongs = useQuery(api.morningSongs.get);
  const daySongs = useQuery(api.daySongs.get);
  const nightSongs = useQuery(api.nightSongs.get);

  return (
    <>
      <main className="container max-w-2xl flex flex-col gap-8">
        <h1 className="text-3xl font-extrabold mt-8 text-center">
          Cris-Branch
        </h1>

        {/* <div className="App">
          {nightSongs?.map(({ _id, added_at}) => (
            <div key={_id}>{added_at}</div>
          ))}
        </div> */}

      <input type='file' name='image' onChange={(e) => {
        console.log(e.target.files[0])
        setSelectedImage(e.target.files[0])
        const imageUrl = URL.createObjectURL(e.target.files[0])
        console.log("ImageURL: " + imageUrl)
        setImageUrl(imageUrl)
        setImageUploaded(true)
      }}/>
 

      </main>
      <footer className="text-center text-xs mb-5 mt-10 w-full">
        <p>
          Built with <a href="https://convex.dev">Convex</a>,{" "}
          <a href="https://www.typescriptlang.org">TypeScript</a>,{" "}
          <a href="https://react.dev">React</a>, and{" "}
          <a href="https://vitejs.dev">Vite</a>
        </p>
      </footer>
    </>
  )
}

export default App
