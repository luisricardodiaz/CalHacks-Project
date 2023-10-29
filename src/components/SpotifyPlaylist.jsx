import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import './playlist.css';

function SpotifyPlaylist({ tableName, environmentLabel, timeOfDayLabel }) {
    const recommendedSongs = useQuery(api.mySongs.get, {tableName: tableName, environment: environmentLabel, timeOfDay: timeOfDayLabel})
    if (recommendedSongs === undefined || recommendedSongs.length == 0) {
        return (<div></div>)
    }
    const playlist = getPlaylist(recommendedSongs);
    return (
      (<div className="playlist-container">
        {/* <button
          onClick={() => createPlaylist({ playlistArray })}>
          Create Playlist
        </button> */}
        <table>
          <thead>
            <tr className="title-align playlist-title">
              <th>#</th>
              <th>Title</th>
              <th>Album</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody className="table-body">  
         {playlist.map((song,index )=> {
                        return <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="title-align">
                            <ul>
                              <li>{song.track.name}</li>
                              <li>{getArtists(song.track.artists)}</li>
                            </ul>
                          </td>
                          <td className="title-align">{song.track.album.name}</td>
                          <td>{msToMinutesAndSeconds(song.track.duration_ms)}</td>
                          </tr>;
                    })} 
          </tbody>
        </table>
      </div>)
    );
  }

function msToMinutesAndSeconds(milliseconds) {
    let output = []
    const totalSeconds = milliseconds / 1000
    const totalMinutes = String(Math.floor(totalSeconds / 60))
    let extraSeconds = String(Math.floor(totalSeconds % 60))
    if (extraSeconds.length == 1) {
        extraSeconds = "0" + extraSeconds
    }
    output.push(totalMinutes + ":" + extraSeconds)
    return output.join("")
}

function getArtists(artistArray) {
    let output = []
    for (const artist of artistArray) {
        output.push(artist.name)
        output.push(", ")
    }
    output.pop()
    return output.join("")
}

function getPlaylist(playlistOptions) {
  var itemsPicked = 0;
  var playlist = []; // need to sample without replacement. this code randomly chooses one item from playlistOptions, adds it to the playlist, // and removes it from playlistOptions
  while (itemsPicked < 20) {
    var index = Math.floor(Math.random() * playlistOptions.length);
    var item = playlistOptions[index];
    playlist.push(item);
    playlistOptions.splice(index, 1);
    itemsPicked += 1;
  }
  return playlist;
}
  
  export default SpotifyPlaylist;