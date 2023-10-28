import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

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
      <h1>Spotify React</h1>
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
    </>
  );
}

export default App;
