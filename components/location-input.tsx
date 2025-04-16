"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, X, CalculatorIcon, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLoadScript } from "@react-google-maps/api"

const libraries = ["places"]

// Declare google variable to avoid undefined error
declare global {
  interface Window {
    google: any
  }
}

export function LocationInput({ locations, onAddLocation, onRemoveLocation, onCalculate }) {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries as any,
  })

  const handleAddLocation = async () => {
    if (!address.trim()) return

    if (!isLoaded) {
      setError("Google Maps API is not loaded yet. Please try again in a moment.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const geocoder = new window.google.maps.Geocoder()
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: address + ", Boston, MA" }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results)
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        })
      })

      const location = result[0].geometry.location

      onAddLocation({
        address: address.trim(),
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: result[0].formatted_address,
      })

      setAddress("")
    } catch (err) {
      console.error("Error geocoding address:", err)
      setError("Could not find this address. Please try a different one.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4">Enter Apartment Locations</h2>

      <div className="space-y-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              placeholder="123 Main St, Boston, MA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
              disabled={isLoading || !isLoaded}
            />
            <Button onClick={handleAddLocation} disabled={isLoading || !isLoaded || !address.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          {!isLoaded && <p className="text-sm text-amber-500 mt-1">Loading Google Maps...</p>}
        </div>
      </div>

      {locations.length > 0 ? (
        <ScrollArea className="flex-1 border rounded-md p-2 mb-4">
          <ul className="space-y-2">
            {locations.map((location, index) => (
              <li key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{location.address}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemoveLocation(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <Alert className="mb-4">
          <AlertDescription>Add at least one apartment location to get started.</AlertDescription>
        </Alert>
      )}

      <Button onClick={onCalculate} disabled={locations.length === 0 || isLoading} className="w-full">
        <CalculatorIcon className="mr-2 h-4 w-4" />
        Calculate Transit Reliability
      </Button>
    </div>
  )
}

