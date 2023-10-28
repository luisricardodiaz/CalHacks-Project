import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"


function App() {
  useEffect(() => {
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
      if (result.hasOwnProperty("error")) {
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
      if (result.hasOwnProperty("error")) {
        throw new Error("API Call failed! " + result.error);
      }
      return result;
    }
    
    function callQuery(maxRetries, query) {
      if (maxRetries > 5) {
        throw new Error("Maximum number of API Calls exceeded");
      }
      query("src/image.JPG").then((response) => {
        console.log(JSON.stringify(response));
      }).catch((error) => {
        setTimeout(function () {console.log("ERROR: " + error + " Retrying...")}, 1000);
        callQuery(maxRetries + 1);
      });
    }

    callQuery(0, scenesQuery);
    callQuery(0, timeQuery);
  }, []);

  const [newIdea, setNewIdea] = useState("")
  const [includeRandom, setIncludeRandom] = useState(true)

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
          Get hacking with Convex
        </h1>

        <h2 className="text-center">Let's brainstorm apps to build!</h2>

        {/* <div className="App">
          {nightSongs?.map(({ _id, added_at}) => (
            <div key={_id}>{added_at}</div>
          ))}
        </div> */}

        <div className="flex gap-2">
          <Input
            type="text"
            value={newIdea}
            onChange={(event) => setNewIdea(event.target.value)}
            placeholder="Type your app idea here"
          />
          <Button
            disabled={!newIdea}
            title={
              newIdea
                ? "Save your idea to the database"
                : "You must enter an idea first"
            }
            onClick={async () => {
              await saveIdea({ idea: newIdea.trim(), random: false })
              setNewIdea("")
            }}
            className="min-w-fit"
          >
            Save idea
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={async () => {
              await generateIdea()
            }}
            title="Save a randomly generated app idea to the database"
          >
            Generate a random app idea
          </Button>

          <div
            className="flex gap-2"
            title="Uh oh, this checkbox doesn't work! Until we fix it ;)"
          >
            <Checkbox
              id="show-random"
              checked={includeRandom}
              onCheckedChange={() => setIncludeRandom(!includeRandom)}
            />
            <Label htmlFor="show-random">Include random ideas</Label>
          </div>
        </div>

        <ul>
          {ideas?.map((document, i) => (
            <li key={i}>
              {document.random ? "🤖 " : "💡 "}
              {document.idea}
            </li>
          ))}
        </ul>
      </main>
      <footer className="text-center text-xs mb-5 mt-10 w-full">
        <p>
          Built with <a href="https://convex.dev">Convex</a>,{" "}
          <a href="https://www.typescriptlang.org">TypeScript</a>,{" "}
          <a href="https://react.dev">React</a>, and{" "}
          <a href="https://vitejs.dev">Vite</a>
        </p>
        <p>
          Random app ideas thanks to{" "}
          <a target="_blank" href="https://appideagenerator.com/">
            appideagenerator.com
          </a>
        </p>
      </footer>
    </>
  )
}

export default App
