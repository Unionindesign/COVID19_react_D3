import React, { useState, useEffect } from "react";
import "axios";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import { csv } from "d3";
import _ from "lodash";

//pages
import USAMap from "../src/pages/usaMap/usamap";

function App() {
  // const [bingData, setBingData] = useState([]);
  const [usaLatestData, setUsaLatestData] = useState([]);
  const [loadingBingData, setLoadingBingData] = useState(false);
  // retrieve data from the Microsoft BING covid tracker when the app loads
  useEffect(() => {
    //declare an async function to get the raw data from the Github repo
    async function getBingData() {
      // set loading state
      setLoadingBingData(true);
      //URL path for Microsoft Bing COVID tracker data
      const bing_url =
        "https://raw.githubusercontent.com/microsoft/Bing-COVID-19-Data/master/data/Bing-COVID19-Data.csv";

      await csv(bing_url).then((data) => {
        //load data to application state
        // setBingData(data);
        const usaData = data.filter(
          (country) => country.Country_Region === "United States"
        );
        //get the latest date in the data set
        const dates = _.compact(data.map((d) => d.Updated));
        const maxDate = new Date(dates.slice(-1)[0]).toDateString();
        const usaLatestData = usaData.filter(
          (d) => new Date(d.Updated).toDateString() === maxDate
        );
        console.log("Max Date: ", maxDate);
        console.log("Latest US Data: ", usaLatestData);
      });

      setUsaLatestData(usaLatestData);
      //turn off loading state
      setLoadingBingData(false);
    }
    // call the function, and use [] empty array as the 2nd arg to the useEffect hook so it runs when the component is mounted to the DOM
    getBingData();
  }, [usaLatestData]);
  return (
    <BrowserRouter basename="/">
      <div className="App">
        {/* <Header /> */}
        <Route exact path="/">
          {/* <LandingPage /> */}
          <h1>{loadingBingData ? "loading..." : "Welcome"}</h1>
        </Route>
        <Route exact path="/usamap">
          <USAMap usaLatestData={usaLatestData}/>
        </Route>
        {/* <Route path="/amselect" >
					<AMData />
				</Route> */}
        <Route path="/state">{/* <AMData /> */}</Route>
      </div>
    </BrowserRouter>
  );
}

export default App;
