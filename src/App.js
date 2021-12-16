import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
mapboxgl.accessToken = 'pk.eyJ1Ijoic2F1cmFiaDAxMDciLCJhIjoiY2t3b243Zmc4MDRodjJ2cDNvOHcxYjl5NiJ9.uOfwlZFIDg137UHurtL3IQ';

function App() {
  let routes = []
  const mapWrapper = useRef(null)

  useEffect(() => {

    var map = new mapboxgl.Map({
      container: mapWrapper.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.31360782632991, 28.579735610693188],
      zoom: 13
    });


    async function getRoute(start, end) {
      // make a directions request using cycling profile
      // an arbitrary start will always be the same
      // only the end or destination will change
     const drag= new mapboxgl.Marker()
      .setLngLat(start)
      //.setPopup(new mapboxgl.Popup().setHTML("<h1>welcome to the map!</h1>"))
      .addTo(map);
      drag.togglePopup();
      new mapboxgl.Marker()
      .setLngLat(end)
      .addTo(map);

      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      );
      
      const json = await query.json();
      const data = json.routes[0];
      routes.push(...data.geometry.coordinates)
      console.log(routes, 'route')
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: 
        {
          type: 'LineString',
          coordinates: routes
        }
      };
      
      // if the route already exists on the map, we'll reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      }

      // otherwise, we'll make a new request
      else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
      
      // add turn instructions here at the end
    }
    axios.get("https://demolionmanapi.rozgarhrms.com/v1/attendance/getUserLocation?empUserId=435&date=2021-11-25",{
      headers: {
        'Authorization': `Basic ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIzLCJzdWJzY3JpcHRpb25Db2RlIjoibXRjIiwiaWF0IjoxNjM4NTEyNTc1LCJleHAiOjE2NzAwNDg1NzV9.HufVZPE06AWL6sEzImhPPHRx6IW51cxBJ-DZPAclvh0"}` 
      }}).then((res) => {
        console.log(res.data.result)
        // getRoute([res.data.result[0].lng,res.data.result[0].lat],[res.data.result[1].lng,res.data.result[1].lat])
        res.data.result.map((item,index)=>{if(index != res.data.result.length)getRoute([item.lng,item.lat],[res.data.result[index].lng,res.data.result[index].lat])})
      })
      .catch((error) => {
        console.error(error)
      })
    // getRoute([78.1025, 28.7041], [78.1125, 28.7041])
    // getRoute([78.1125, 28.7041], [78.6285, 28.7041])
    // getRoute([78.1125, 28.7041], [78.8285, 28.7041])
    // getRoute([78.1125, 28.7041], [78.5085, 28.7041])

  }, [])
  

  return <div
    ref={mapWrapper}
    className="mapWrapper"
  />
  
}


export default App;