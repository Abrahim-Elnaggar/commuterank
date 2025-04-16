"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, Train } from 'lucide-react'

export function ResultsList({ results }) {
  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-muted-foreground text-center">
          Enter apartment locations and calculate to see transit reliability rankings
        </p>
      </div>
    )
  }

  // Helper function to safely format numbers
  const safeFormat = (value, decimals = 1) => {
    const num = Number(value);
    return isNaN(num) ? "0.0" : num.toFixed(decimals);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Reliability Rankings</h2>
      
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className={result.rank === 1 ? "border-green-500" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2">{`Rank #${result.rank}`}</Badge>
                  <CardTitle className="text-base flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {result.address}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{safeFormat(result.reliability)}%</span>
                  <p className="text-xs text-muted-foreground">reliability</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Train className="h-4 w-4 mr-1" />
                    Nearest Station: {result.station}
                  </span>
                  <span>{safeFormat(result.distance, 2)} miles away</span>
                </div>
                
                <Progress 
                  value={Number(result.reliability) || 0} 
                  className="h-2" 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2">
                    <div className="font-medium">Available Lines</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.lineDetails && result.lineDetails.map((line, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="bg-white"
                          style={{ borderColor: line.color }}
                        >
                          {line.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <div className="font-medium">Reliability Factors</div>
                    <ul className="mt-1 space-y-1">
                      <li>On-time performance: {safeFormat(result.otpPercentage)}%</li>
                    </ul>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-center pt-1">
                  <div className="bg-amber-100 rounded p-1">
                    <div className="font-medium">Peak Hours</div>
                    <div>{safeFormat(result.peakReliability)}% reliable</div>
                  </div>
                  <div className="bg-blue-100 rounded p-1">
                    <div className="font-medium">Off-Peak Hours</div>
                    <div>{safeFormat(result.offPeakReliability)}% reliable</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  <p>Line-by-line reliability:</p>
                  <ul className="mt-1 space-y-1">
                    {result.lineDetails && result.lineDetails.map((line, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{line.name}</span>
                        <span>{safeFormat(line.reliability)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
