import React, { useState, useEffect } from 'react';
import "axios"
import './App.css';
// import Axios from 'axios';

//require node package for parsing CSV files
const Papa = require("papaparse")

function App() {
  const [bingData, setBingData] = useState([])
  const [loadingBingData, setLoadingBingData] = useState(false)
  // retrieve data from the Microsoft BING covid tracker when the app loads
  useEffect(() => {
    //declare an async function to get the raw data from the Github repo
    async function getBingData() {
      // set loading state
      setLoadingBingData(true);
      //URL path for Microsoft Bing COVID tracker data
      const bing_url = "https://raw.githubusercontent.com/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv"
      //Use Papa parse to retrieve the remote csv file data, and format accordingly
      Papa.parse(bing_url, {
        download: true,
        header: false,
        skipEmptyLines: true,
        complete: res => {
          //console.log("Parsed MS Bing CSV data:", res.data)
          //convert the csv array of arrays into a JS object
          const msBingData = res.data.map(b => {
            return {
              id: b[0],
              date_updated: b[1],
              confirmed_cases: Math.round(b[2]),
              confirmed_change: Math.round(b[3]),
              deaths: Math.round(b[4]),
              deaths_change: Math.round(b[5]),
              recovered: Math.round(b[6]),
              recovered_change: Math.round(b[7]),
              latitude: parseFloat(b[8]),
              longitude: parseFloat(b[9]),
              iso2: b[10],
              iso3: b[11],
              country: b[12],
              region: b[13],
              subregion: b[14]
            }
          })
          //shift array to remove headers from first row of CSV
          msBingData.shift()
          console.log("MS Bing JSON: ", msBingData)
          //turn off loading state
          setLoadingBingData(false)
          //load data to application state
          setBingData(msBingData)
        }
      })


    }
    // call the function, and use [] empty array as the 2nd arg to the useEffect hook so it runs when the component is mounted to the DOM
    getBingData()
  }, [])

  if (loadingBingData) {
    return (
      <div className="App">
        <h1>Retrieving Latest COVID data from Microsoft BING</h1>
      </div>
    )
  }
  else {
    return (
      <div className="App">
        <h1>Covid React App</h1>
        <h3></h3>
      </div>
    );
  }
}

export default App;
