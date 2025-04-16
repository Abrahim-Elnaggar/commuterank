"use client"

import { useState, useEffect } from "react"
import { MapContainer } from "@/components/map-container"
import { LocationInput } from "@/components/location-input"
import { ResultsList } from "@/components/results-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useLoadScript } from "@react-google-maps/api"
import { parseMBTAData, findNearestStation, type MBTARecord, getStationMetrics } from "@/lib/mbta-utils"
import { Loader2 } from "lucide-react"

const libraries = ["places"]

export default function CommuteRankApp() {
  const [locations, setLocations] = useState([])
  const [results, setResults] = useState([])
  const [activeTab, setActiveTab] = useState("map")
  const [mbtaData, setMbtaData] = useState<MBTARecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries as any,
  })

  useEffect(() => {
    const loadMbtaData = async () => {
      const data = await parseMBTAData()
      setMbtaData(data)
    }

    loadMbtaData()
  }, [])

  const addLocation = (location) => {
    setLocations([...locations, location])
  }

  const removeLocation = (index) => {
    const updatedLocations = [...locations]
    updatedLocations.splice(index, 1)
    setLocations(updatedLocations)
  }

  const calculateRanking = async () => {
    if (locations.length === 0 || mbtaData.length === 0) return

    setIsLoading(true)

    try {
      // Calculate reliability for each location
      const calculatedResults = locations.map((loc, index) => {
        const { station, distance } = findNearestStation(loc.lat, loc.lng)

        // Get all data for this station's lines
        const stationData = mbtaData.filter((record) => station.lines.includes(record.gtfs_route_id))

        // Calculate reliability metrics
        const metrics = getStationMetrics(mbtaData, station)

        return {
          id: index,
          address: loc.address,
          formattedAddress: loc.formattedAddress || loc.address,
          station: station.name,
          distance: distance,
          reliability: metrics.overall.reliability,
          otpPercentage: metrics.overall.otpPercentage,
          cancelledPercentage: metrics.overall.cancelledPercentage,
          peakReliability: metrics.peak.reliability,
          offPeakReliability: metrics.offPeak.reliability,
          lines: station.lines,
          lineDetails: metrics.lineDetails,
          rank: 0, // Will be set after sorting
        }
      })

      // Sort by reliability (highest first)
      calculatedResults.sort((a, b) => b.reliability - a.reliability)

      // Update ranks
      calculatedResults.forEach((result, index) => {
        result.rank = index + 1
      })

      setResults(calculatedResults)
      setActiveTab("results")
    } catch (error) {
      console.error("Error calculating rankings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="container py-6 flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 flex-1 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <Card className="p-4 md:col-span-1">
          <LocationInput
            locations={locations}
            onAddLocation={addLocation}
            onRemoveLocation={removeLocation}
            onCalculate={calculateRanking}
          />
        </Card>

        <Card className="md:col-span-2 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="map" className="flex-1 m-0">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <MapContainer locations={locations} mbta={mbtaData} />
              )}
            </TabsContent>

            <TabsContent value="results" className="flex-1 m-0 overflow-auto">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResultsList results={results} />
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
