import axios from "axios";
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api";
import { Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from 'react';
import ImageSlider from './ImageSlider';
import { Waveform } from '@uiball/loaders';

const images = ['src/assets/image1.jpeg', 'src/assets/image2.jpeg', 'src/assets/image3.jpeg', 'src/assets/image4.jpeg', 'src/assets/image5.jpeg', 'src/assets/image6.jpeg', 'src/assets/image7.jpeg', 'src/assets/image8.jpeg', 'src/assets/image9.jpeg', 'src/assets/image10.jpeg', 'src/assets/image11.jpeg']

function App() {
  const CLIENT_ID = "ff3b13358d7a4b2bbc5a0f4df6112b5d";
  const REDIRECT_URI = "http://localhost:5173/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const [token, setToken] = useState("");
  const mutatePlaylist = useMutation(api.tasks.createTask);
  const playlistToVibe = {
    "Forest": {"Sunrise" : "Liminal Space Mix", "DayTime": "Autumn Mix", "Nighttime": "Running Mix"}, 
    "Buildings": {"Sunrise" : "Hype Morning Mix", "DayTime": "Driving Mix", "Nighttime": "Late Night Mix"},
    "Mountains": {"Sunrise" : "Feel Good Morning Mix", "DayTime": "Happy Camping Mix", "Nighttime": "Camping Night Time Mix"},
    "Sea": {"Sunrise" : "Surfing Mix", "DayTime": "Ocean Mix", "Nighttime": "Nature Mix"}
  }
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageName, setImageName] = useState("")


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


  const handleGeneratePlaylistClick = async () => {
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

    setToken(token);
  }, []);

  const logout = () => {
        setToken("");
        window.localStorage.removeItem("token");
      };
    
      const renderPlaylistSongs = (tracks, environment, timeOfDay) => {
        tracks.map((track) => {
          mutatePlaylist({ environment: environment, time_of_day: timeOfDay, added_at: track.added_at, added_by: track.added_by, is_local: track.is_local, primary_color: track.primary_color, track: track.track, video_thumbnail: track.video_thumbnail })
        });
      }
    
      const searchTracks = async (apiEndpoint, environment, timeOfDay) => {
        const { data } = await axios.get(apiEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        renderPlaylistSongs(data.tracks.items, environment, timeOfDay)
      }
    
      const searchPlaylist = async (e) => {
        e.preventDefault();
        for (const environment in playlistToVibe) {
          for (const timeOfDay in playlistToVibe[environment]) {
            console.log(playlistToVibe[environment][timeOfDay])
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
        <div className="upload-btn-wrapper" color={isLightMode ? 'black' : 'white'}> 
          <button class="btn1">{imageUploaded ?  imageName: "Upload a file"}</button>
          <input type='file' name='image' onChange={(e) => {
          console.log(e.target.files[0])
          const imageUrl = URL.createObjectURL(e.target.files[0]) 
          setImageUrl(imageUrl)
          setImageName(e.target.files[0]['name'])
          setImageUploaded(true)
          }}/> </div>
        <div className={`GeneratePlaylistButton ${isLoading ? 'loading' : ''}`}>
          <Button className = "btn2" color={isLightMode ? 'black' : 'white'} onClick={handleGeneratePlaylistClick}>Generate Playlist</Button>
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
        {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
        >
          Login to Spotify
        </a>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
      <form onSubmit={searchPlaylist}>
        {/* <input type="text" onChange={(e) => setSearchKey(e.target.value)} /> */}
        <button type={"submit"}>Begin Table Population</button>
      </form>
      </div>
    </>
  );
}

export default App;
