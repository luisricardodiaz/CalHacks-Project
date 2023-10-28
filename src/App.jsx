import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { useState, useEffect } from "react"


function App() {
  const [imageUploaded, setImageUploaded] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    async function asyncWrapper() {
      if (imageUploaded == false) {
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
      console.log(labelToSongs)

      // the 0th item in the output is the highest match
      const highestTimeMatch = timeOutput[0].label
      
      console.log(highestTimeMatch)
      const playlistOptions = Array.from(labelToSongs[highestTimeMatch])
      console.log(playlistOptions)

      function getPlaylist(playlistOptions) {
        var itemsPicked = 0
        var playlist = [];
        // need to sample without replacement. this code randomly chooses one item from playlistOptions, adds it to the playlist,
        // and removes it from playlistOptions
        while (itemsPicked < 12) {
          var index = Math.floor(Math.random() * playlistOptions.length);
          var item = playlistOptions[index]
          playlist.push(item)
          playlistOptions.splice(index, 1)
          itemsPicked += 1
        }
        return playlist
      }

      const playlist = getPlaylist(playlistOptions)
      console.log(playlist)
    }
    asyncWrapper().then(() => {}).catch((error) => console.log("asyncwrapper FAILED: " + error))
  }, [imageUploaded, imageUrl]);

  const morningSongs = useQuery(api.morningSongs.get);
  const daySongs = useQuery(api.daySongs.get);
  const nightSongs = useQuery(api.nightSongs.get);

  // three labels: Sunrise, Daytime, Nighttime
  // TODO: these labels are undefined at first, I'm not sure why
  const labelToSongs = {
    "Sunrise" : morningSongs,
    "Daytime" : daySongs,
    "Nighttime" : nightSongs
  }

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
        const imageUrl = URL.createObjectURL(e.target.files[0])
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
