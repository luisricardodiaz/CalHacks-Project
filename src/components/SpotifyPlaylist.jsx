import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function SpotifyPlaylist({ tableName, generatePlaylistClicked, timeOfDayLabel, environmentLabel }) {
    const mySongs = useQuery(api.mySongs.get, {tableName: tableName, environment: environmentLabel, timeOfDay: timeOfDayLabel})
    if (generatePlaylistClicked == false) {
        return (<div></div>)
    }
    const playlist = getPlaylist(mySongs);
    return (
      (<div>
        {/* <button
          onClick={() => createPlaylist({ playlistArray })}>
          Create Playlist
        </button> */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Album</th>
              <th>Artist(s)</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>  
         {playlist.map((song,index )=> {
                        return <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{song.track.name}</td>
                          <td>{song.track.album.name}</td>
                          <td>{getArtists(song.track.artists)}</td>
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
  while (itemsPicked < 12) {
    var index = Math.floor(Math.random() * playlistOptions.length);
    var item = playlistOptions[index];
    playlist.push(item);
    playlistOptions.splice(index, 1);
    itemsPicked += 1;
  }
  return playlist;
}
  
  export default SpotifyPlaylist;