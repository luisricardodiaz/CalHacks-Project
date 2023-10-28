import React, { useState, useEffect, useRef } from "react";

function SpotifyPlaylist({ playlistArray }) {
    console.log("This is the playlist ARRAY " + playlistArray)
    if (playlistArray == null) {
        return (<div>bruh</div>)
    }
    console.log("SUCCESS")
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
         {playlistArray.map((song,index )=> {
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
  
  export default SpotifyPlaylist;