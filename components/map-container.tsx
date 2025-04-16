"use client"

import { useEffect, useState } from "react"
import { GoogleMap, Marker, InfoWindow, Polyline } from "@react-google-maps/api"
import { findNearestStation, stations, getLineColor } from "@/lib/mbta-utils"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const center = {
  lat: 42.3601,
  lng: -71.0589,
}

export function MapContainer({ locations, mbta }) {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [mapRef, setMapRef] = useState(null)

  const onMapLoad = (map) => {
    setMapRef(map)
  }

  // Fit map to show all locations
  useEffect(() => {
    if (mapRef && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()

      // Add all locations to bounds
      locations.forEach((location) => {
        bounds.extend({ lat: location.lat, lng: location.lng })
      })

      // Add nearest stations to bounds
      locations.forEach((location) => {
        const { station } = findNearestStation(location.lat, location.lng)
        bounds.extend(station.location)
      })

      // Fit the map to the bounds
      mapRef.fitBounds(bounds)

      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(mapRef, "idle", () => {
        if (mapRef.getZoom() > 15) mapRef.setZoom(15)
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [mapRef, locations])

  return (
    <div className="h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={onMapLoad}
      >
        {/* Render T stations */}
        {stations.map((station, index) => {
          // Determine station color based on lines
          let stationColor = "#888888"
          if (station.lines.includes("Red")) stationColor = "#FF0000"
          else if (station.lines.includes("Orange")) stationColor = "#FFA500"
          else if (station.lines.includes("Blue")) stationColor = "#0000FF"
          else if (station.lines.some((line) => line.startsWith("Green"))) stationColor = "#00AA00"

          return (
            <Marker
              key={`station-${index}`}
              position={station.location}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: stationColor,
                fillOpacity: 0.7,
                strokeWeight: 2,
                strokeColor: "#FFFFFF",
              }}
              onClick={() => setSelectedStation(station)}
            />
          )
        })}

        {/* Render apartment locations */}
        {locations.map((location, index) => {
          const nearest = findNearestStation(location.lat, location.lng)
          return (
            <Marker
              key={`location-${index}`}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation({ ...location, nearest })}
              label={{
                text: (index + 1).toString(),
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
            />
          )
        })}

        {/* Draw lines between locations and their nearest stations */}
        {locations.map((location, index) => {
          const { station } = findNearestStation(location.lat, location.lng)

          // Create a polyline between location and station
          const path = [
            { lat: location.lat, lng: location.lng },
            { lat: station.location.lat, lng: station.location.lng },
          ]

          return (
            <Polyline
              key={`path-${index}`}
              path={path}
              options={{
                strokeColor: "#888888",
                strokeOpacity: 0.6,
                strokeWeight: 2,
                icons: [
                  {
                    icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                    offset: "100%",
                  },
                ],
              }}
            />
          )
        })}

        {/* Info window for selected location */}
        {selectedLocation && (
          <InfoWindow
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-1">
              <h3 className="font-medium text-sm">{selectedLocation.address}</h3>
              <p className="text-xs mt-1">
                Nearest station: {selectedLocation.nearest.station.name} ({selectedLocation.nearest.distance.toFixed(2)}{" "}
                miles)
              </p>
              <p className="text-xs">Lines: {selectedLocation.nearest.station.lines.join(", ")}</p>
            </div>
          </InfoWindow>
        )}

        {/* Info window for selected station */}
        {selectedStation && (
          <InfoWindow position={selectedStation.location} onCloseClick={() => setSelectedStation(null)}>
            <div className="p-1">
              <h3 className="font-medium text-sm">{selectedStation.name} Station</h3>
              <p className="text-xs mt-1">
                Lines:{" "}
                {selectedStation.lines.map((line) => (
                  <span
                    key={line}
                    className="inline-block px-1 mr-1 rounded"
                    style={{
                      backgroundColor: getLineColor(line),
                      color: line === "Orange" || line.startsWith("Green") ? "#000" : "#fff",
                    }}
                  >
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}

