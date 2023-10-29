import axios from "axios";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import ImageSlider from "./ImageSlider";
import { Waveform } from "@uiball/loaders";
import SpotifyPlaylist from "./components/SpotifyPlaylist";

const images = [
  "src/assets/image1.jpeg",
  "src/assets/image2.jpeg",
  "src/assets/image3.jpeg",
  "src/assets/image4.jpeg",
  "src/assets/image5.jpeg",
  "src/assets/image6.jpeg",
  "src/assets/image7.jpeg",
  "src/assets/image8.jpeg",
  "src/assets/image9.jpeg",
  "src/assets/image10.jpeg",
  "src/assets/image11.jpeg",
];

function App() {
  const CLIENT_ID = "ff3b13358d7a4b2bbc5a0f4df6112b5d";
  const REDIRECT_URI = "http://localhost:5173/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const [token, setToken] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const mutatePlaylist = useMutation(api.tasks.createTask);
  const playlistToVibe = {
    forest: {
      Sunrise: "Liminal Space Mix",
      Daytime: "Autumn Mix",
      Nighttime: "Running Mix",
    },
    buildings: {
      Sunrise: "Hype Morning Mix",
      Daytime: "Driving Mix",
      Nighttime: "Late Night Mix",
    },
    mountains: {
      Sunrise: "Feel Good Morning Mix",
      Daytime: "Happy Camping Mix",
      Nighttime: "Camping Night Time Mix",
    },
    sea: {
      Sunrise: "Surfing Mix",
      Daytime: "Ocean Mix",
      Nighttime: "Nature Mix",
    },
  };
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const [playlistOptions, setPlaylistOptions] = useState([])
  const [timeOfDayLabel, setTimeOfDayLabel] = useState("")
  const [environmentLabel, setEnvironmentLabel] = useState("")

  // three labels: Sunrise, Daytime, Nighttime
  // TODO: these labels are undefined at first, I'm not sure why
  // const labelToSongs = {
  //   Sunrise: morningSongs,
  //   Daytime: daySongs,
  //   Nighttime: nightSongs,
  // };

  const handleGeneratePlaylistClick = async () => {
    if (imageUrl == "") {
      alert("No image found! Did you upload an image?")
    }
    async function scenesQuery(filename) {
      const data = await (await fetch(filename)).arrayBuffer();
      const response = await fetch(
        "https://api-inference.huggingface.co/models/jmillan736/BEiT-Scenes",
        {
          headers: {
            Authorization: `Bearer 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`,
          },
          method: "POST",
          body: data,
        }
      );
      const result = await response.json();
      if ("error" in result) {
        throw new Error("Environment Model Call failed! " + result.error);
      }
      return result;
    }

    async function timeQuery(filename) {
      const data = await (await fetch(filename)).arrayBuffer();
      const response = await fetch(
        "https://api-inference.huggingface.co/models/jmillan736/BEiT-Time-Of-Day",
        {
          headers: {
            Authorization: `Bearer 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`,
          },
          method: "POST",
          body: data,
        }
      );
      const result = await response.json();
      if ("error" in result) {
        throw new Error("Time Of Day Model Call failed! " + result.error);
      }
      return result;
    }

    async function callQuery(maxRetries, query) {
      if (maxRetries > 5) {
        alert("API Call failed, please try again")
        throw new Error("Maximum number of API Calls exceeded");
      }
      try {
        const answer = await query(imageUrl);
        return answer;
      } catch (error) {
        setTimeout(() => {
          console.log(error + " Retrying...");
        }, 2000);
        await callQuery(maxRetries + 1, query);
      }
    }

    const environment = await callQuery(0, scenesQuery);
    const timeOfDay = await callQuery(0, timeQuery);

    console.log("Environment Labels: " + JSON.stringify(environment))
    console.log("Time of day labels: " + JSON.stringify(timeOfDay))

    setTimeOfDayLabel(timeOfDay[0].label);
    setEnvironmentLabel(environment[0].label);
  };

  function isBackgroundColorWhite(element) {
    if (!element) {
      return false; // Return false if the element is not provided
    }
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;

    // Check if the background color is white
    return backgroundColor === "rgb(255, 255, 255)";
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const element = document.querySelector("body"); // Replace with your element selector
  const isLightMode = isBackgroundColorWhite(element);
  let shuffleimage = shuffleArray(images);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");
    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    function generateRandomString(secret, length) {
      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      return window.crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
        return hashHex.substr(0, length);
      });
    }

    const secretString = token;

    const length = 31;

    generateRandomString(secretString, length)
      .then((randomString) => {
        setUniqueId("s" + randomString);
      })

      .catch((error) => {
        console.error(error);
      });

    setToken(token);
  }, []);

  const logout = () => {
    setToken("");

    window.localStorage.removeItem("token");
  };

  const renderPlaylistSongs = (tracks, environment, timeOfDay) => {
    tracks.map((track) => {
      mutatePlaylist({
        unique_id: uniqueId,
        environment: environment,
        time_of_day: timeOfDay,
        added_at: track.added_at,
        added_by: track.added_by,
        is_local: track.is_local,
        primary_color: track.primary_color,
        track: track.track,
        video_thumbnail: track.video_thumbnail,
      });
    });
  };

  const searchTracks = async (apiEndpoint, environment, timeOfDay) => {
    const { data } = await axios.get(apiEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    renderPlaylistSongs(data.tracks.items, environment, timeOfDay);
  };

  const searchPlaylist = async (e) => {
    e.preventDefault();

    for (const environment in playlistToVibe) {
      for (const timeOfDay in playlistToVibe[environment]) {
        console.log(playlistToVibe[environment][timeOfDay]);

        const { data } = await axios.get("https://api.spotify.com/v1/search", {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          params: {
            q: playlistToVibe[environment][timeOfDay],

            type: "playlist",
          },
        });
        searchTracks(data.playlists.items[0].href, environment, timeOfDay);
      }
    }
  };

  return (
    <>
      <div className="top-bar">
        <h1 className="title"> VibeS</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
          >
            Login to Spotify
          </a>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>
      <div className="App">
        <ImageSlider images={shuffleimage} />
        <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center text-white -z-10">
          <h1 className="text-4xl font-bold "> Make a playlist for any </h1>
          <h1 className="title">
            <span className="text-4xl font-bold" style={{ color: "#E63946" }}>
              V
            </span>
            <span className="text-4xl font-bold" style={{ color: "#FFD700" }}>
              i
            </span>
            <span className="text-4xl font-bold" style={{ color: "#228B22" }}>
              b
            </span>
            <span className="text-4xl font-bold" style={{ color: "#457B9D" }}>
              e
            </span>
            <span className="text-4xl font-bold" style={{ color: "#1D3557" }}>
              S
            </span>
          </h1>
        </div>
        <form onSubmit={searchPlaylist}>
          {/* <input type="text" onChange={(e) => setSearchKey(e.target.value)} /> */}
          <button type={"submit"}>Begin Table Population</button>
        </form>
        <div
          className="upload-btn-wrapper"
          color={isLightMode ? "black" : "white"}
        >
          <button className="btn1">
            {imageUploaded ? imageName : "Upload a file"}
          </button>
          <input
            type="file"
            name="image"
            onChange={(e) => {
              console.log(e.target.files[0]);
              const imageUrl = URL.createObjectURL(e.target.files[0]);
              setImageUrl(imageUrl);
              setImageName(e.target.files[0]["name"]);
              setImageUploaded(true);
            }}
          />{" "}
        </div>
        <div className={`GeneratePlaylistButton ${isLoading ? "loading" : ""}`}>
          <Button
            className="btn2"
            color={isLightMode ? "black" : "white"}
            onClick={handleGeneratePlaylistClick}
          >
            Generate Playlist
          </Button>
        </div>
        <div
          className={`loadingPlaylistAnimation ${
            isLoading ? "show" : "hidden"
          }`}
        >
          <Waveform
            id={"waveform"}
            size={100}
            lineWeight={3.5}
            speed={1}
            color={isLightMode ? "black" : "white"}
          />
        </div>
        <SpotifyPlaylist tableName={uniqueId}
        environmentLabel={environmentLabel} timeOfDayLabel={timeOfDayLabel}/>
      </div>
    </>
  );
}

export default App;
