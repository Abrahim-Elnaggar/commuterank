import Papa from "papaparse"

// Define the MBTARecord type
export interface MBTARecord {
  service_date: string
  gtfs_route_id: string
  gtfs_route_short_name: string
  gtfs_route_long_name: string
  gtfs_route_desc: string
  route_category: string
  mode_type: string
  peak_offpeak_ind: string
  metric_type: string
  otp_numerator: string
  otp_denominator: string
  cancelled_numerator: string
  ObjectId: string
}

// Define the Station type
export interface Station {
  name: string
  location: { lat: number; lng: number }
  lines: string[]
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Radius of the earth in miles
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c
  return distance
}

export async function parseMBTAData(): Promise<MBTARecord[]> {
  try {
    const response = await fetch("/MBTA.csv");
    const text = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<MBTARecord>(text, {
        header: true,
        dynamicTyping: false,
        complete: (results) => {
          resolve(results.data as MBTARecord[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    return [];
  }
}




// Function to find the nearest T station to a given location
export function findNearestStation(lat: number, lng: number): { station: Station; distance: number } {
  let closestStation: Station = stations[0]
  let shortestDistance = Number.POSITIVE_INFINITY

  for (const station of stations) {
    const distance = calculateDistance(lat, lng, station.location.lat, station.location.lng)
    if (distance < shortestDistance) {
      shortestDistance = distance
      closestStation = station
    }
  }

  
  return { station: closestStation, distance: shortestDistance }
}

// Function to filter MBTA data for rapid transit lines
export function filterRapidTransitData(data: MBTARecord[]): MBTARecord[] {
  const rapidTransitLines = ["Red", "Orange", "Blue", "Green-B", "Green-C", "Green-D", "Green-E"]
  return data.filter((record) => rapidTransitLines.includes(record.gtfs_route_id))
}

// Function to get station metrics
export function getStationMetrics(
  data: MBTARecord[],
  station: Station,
): {
  overall: { reliability: number; otpPercentage: number; cancelledPercentage: number }
  peak: { reliability: number }
  offPeak: { reliability: number }
  lineDetails: { name: string; reliability: number; color: string }[]
} {
  // Filter data for this station's lines
  const stationData = data.filter((record) => station.lines.includes(record.gtfs_route_id))

  // Calculate overall reliability
  const overallMetrics = calculateStationReliability(stationData, station)

  // Calculate peak reliability
  const peakData = stationData.filter((record) => record.peak_offpeak_ind === "PEAK")
  const peakMetrics = calculateStationReliability(peakData, station)

  // Calculate off-peak reliability
  const offPeakData = stationData.filter((record) => record.peak_offpeak_ind === "OFF_PEAK")
  const offPeakMetrics = calculateStationReliability(offPeakData, station)

  // Calculate per-line reliability
  const lineDetails = station.lines.map((line) => {
    const lineData = stationData.filter((record) => record.gtfs_route_id === line)
    const lineMetrics = calculateStationReliability(lineData, { lines: [line] })
    return {
      name: line,
      reliability: lineMetrics.reliability,
      color: getLineColor(line),
    }
  })

  return {
    overall: {
      reliability: overallMetrics.reliability,
      otpPercentage: overallMetrics.otpPercentage,
      cancelledPercentage: overallMetrics.cancelledPercentage,
    },
    peak: { reliability: peakMetrics.reliability },
    offPeak: { reliability: offPeakMetrics.reliability },
    lineDetails: lineDetails,
  }
}

// Define the calculateStationReliability function to ensure numeric values
export function calculateStationReliability(
  data: MBTARecord[],
  station: { lines: string[] },
): {
  reliability: number
  otpPercentage: number
  cancelledPercentage: number
} {
  if (!station || !station.lines || station.lines.length === 0) {
    return {
      reliability: 0,
      otpPercentage: 0,
      cancelledPercentage: 0,
    }
  }

  let totalOtpNumerator = 0
  let totalOtpDenominator = 0
  let totalCancelledNumerator = 0

  

  data.forEach((record) => {
    const otpNum = Number.parseFloat(record.otp_numerator) || 0
    const otpDenom = Number.parseFloat(record.otp_denominator) || 0
    const cancelledNum = Number.parseFloat(record.cancelled_numerator) || 0

    totalOtpNumerator += otpNum
    totalOtpDenominator += otpDenom
    totalCancelledNumerator += cancelledNum
    
  })

  const reliability = totalOtpDenominator > 0 ? (totalOtpNumerator / totalOtpDenominator) * 100 : 0
  const otpPercentage = totalOtpDenominator > 0 ? (totalOtpNumerator / totalOtpDenominator) * 100 : 0
  const cancelledPercentage = totalOtpDenominator > 0 ? (totalCancelledNumerator / totalOtpDenominator) * 100 : 0

  return {
    
    reliability: Number(reliability), // Ensure it's a number
    otpPercentage: Number(otpPercentage), // Ensure it's a number
    cancelledPercentage: Number(cancelledPercentage), // Ensure it's a number
  }
}

export const stations: Station[] = [
  // -------------------------
  // RED LINE (Full: Ashmont + Braintree Branches)
  // -------------------------
  {
    name: "Alewife",
    location: { lat: 42.395428, lng: -71.142483 },
    lines: ["Red"],
  },
  {
    name: "Davis",
    location: { lat: 42.39674, lng: -71.121815 },
    lines: ["Red"],
  },
  {
    name: "Porter",
    location: { lat: 42.3884, lng: -71.119148 },
    lines: ["Red"],
  },
  {
    name: "Harvard",
    location: { lat: 42.373362, lng: -71.118956 },
    lines: ["Red"],
  },
  {
    name: "Central",
    location: { lat: 42.365486, lng: -71.103802 },
    lines: ["Red"],
  },
  {
    name: "Kendall/MIT",
    location: { lat: 42.362491, lng: -71.086177 },
    lines: ["Red"],
  },
  {
    name: "Charles/MGH",
    location: { lat: 42.361166, lng: -71.070628 },
    lines: ["Red"],
  },
  {
    name: "Park Street",
    location: { lat: 42.356395, lng: -71.062424 },
    lines: ["Red", "Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "Downtown Crossing",
    location: { lat: 42.355518, lng: -71.060225 },
    lines: ["Red", "Orange"],
  },
  {
    name: "South Station",
    location: { lat: 42.352271, lng: -71.055242 },
    lines: ["Red"],
  },
  {
    name: "Broadway",
    location: { lat: 42.342622, lng: -71.056967 },
    lines: ["Red"],
  },
  {
    name: "Andrew",
    location: { lat: 42.330154, lng: -71.057655 },
    lines: ["Red"],
  },
  {
    name: "JFK/UMass",
    location: { lat: 42.320685, lng: -71.052391 },
    lines: ["Red"],
  },
  {
    name: "Savin Hill",
    location: { lat: 42.31129, lng: -71.053331 },
    lines: ["Red"],
  },
  {
    name: "Fields Corner",
    location: { lat: 42.300093, lng: -71.061667 },
    lines: ["Red"],
  },
  {
    name: "Shawmut",
    location: { lat: 42.293125, lng: -71.065737 },
    lines: ["Red"],
  },
  {
    name: "Ashmont",
    location: { lat: 42.284652, lng: -71.064489 },
    lines: ["Red"],
  },
  {
    name: "North Quincy",
    location: { lat: 42.275275, lng: -71.029583 },
    lines: ["Red"],
  },
  {
    name: "Wollaston",
    location: { lat: 42.266514, lng: -71.020336 },
    lines: ["Red"],
  },
  {
    name: "Quincy Center",
    location: { lat: 42.251809, lng: -71.005409 },
    lines: ["Red"],
  },
  {
    name: "Quincy Adams",
    location: { lat: 42.233391, lng: -71.007153 },
    lines: ["Red"],
  },
  {
    name: "Braintree",
    location: { lat: 42.207854, lng: -71.001138 },
    lines: ["Red"],
  },

  // -------------------------
  // ORANGE LINE
  // -------------------------
  {
    name: "Oak Grove",
    location: { lat: 42.43668, lng: -71.07105 },
    lines: ["Orange"],
  },
  {
    name: "Malden Center",
    location: { lat: 42.426632, lng: -71.07411 },
    lines: ["Orange"],
  },
  {
    name: "Wellington",
    location: { lat: 42.40237, lng: -71.077082 },
    lines: ["Orange"],
  },
  {
    name: "Assembly",
    location: { lat: 42.392844, lng: -71.077242 },
    lines: ["Orange"],
  },
  {
    name: "Sullivan Square",
    location: { lat: 42.383975, lng: -71.076994 },
    lines: ["Orange"],
  },
  {
    name: "Community College",
    location: { lat: 42.373622, lng: -71.069533 },
    lines: ["Orange"],
  },
  {
    name: "North Station",
    location: { lat: 42.3662, lng: -71.0621 },
    lines: ["Orange", "Green-B", "Green-C", "Green-D", "Green-E"], // Green trunk
  },
  {
    name: "Haymarket",
    location: { lat: 42.363021, lng: -71.05829 },
    lines: ["Orange", "Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "State Street",
    location: { lat: 42.358978, lng: -71.057598 },
    lines: ["Orange", "Blue"],
  },
  // (Downtown Crossing is above under Red/Orange)
  {
    name: "Chinatown",
    location: { lat: 42.3523, lng: -71.0622 },
    lines: ["Orange"],
  },
  {
    name: "Tufts Medical Center",
    location: { lat: 42.34966, lng: -71.063917 },
    lines: ["Orange"],
  },
  {
    name: "Back Bay",
    location: { lat: 42.34735, lng: -71.075727 },
    lines: ["Orange"],
  },
  {
    name: "Massachusetts Avenue",
    location: { lat: 42.341512, lng: -71.083423 },
    lines: ["Orange"],
  },
  {
    name: "Ruggles",
    location: { lat: 42.336377, lng: -71.088961 },
    lines: ["Orange"],
  },
  {
    name: "Roxbury Crossing",
    location: { lat: 42.33139, lng: -71.09545 },
    lines: ["Orange"],
  },
  {
    name: "Jackson Square",
    location: { lat: 42.309983, lng: -71.083417 },
    lines: ["Orange"],
  },
  {
    name: "Stony Brook",
    location: { lat: 42.30052, lng: -71.08347 },
    lines: ["Orange"],
  },
  {
    name: "Green Street",
    location: { lat: 42.297286, lng: -71.107653 },
    lines: ["Orange"],
  },
  {
    name: "Forest Hills",
    location: { lat: 42.300523, lng: -71.113686 },
    lines: ["Orange"],
  },

  // -------------------------
  // BLUE LINE
  // -------------------------
  {
    name: "Bowdoin",
    location: { lat: 42.361145, lng: -71.0622 },
    lines: ["Blue"],
  },
  {
    name: "Government Center",
    location: { lat: 42.359705, lng: -71.059215 },
    lines: ["Blue", "Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "State Street",
    location: { lat: 42.358978, lng: -71.057598 },
    lines: ["Blue", "Orange"],
  },
  {
    name: "Aquarium",
    location: { lat: 42.359784, lng: -71.051679 },
    lines: ["Blue"],
  },
  {
    name: "Maverick",
    location: { lat: 42.369118, lng: -71.039529 },
    lines: ["Blue"],
  },
  {
    name: "Airport",
    location: { lat: 42.374262, lng: -71.030395 },
    lines: ["Blue"],
  },
  {
    name: "Wood Island",
    location: { lat: 42.379640, lng: -71.022865 },
    lines: ["Blue"],
  },
  {
    name: "Orient Heights",
    location: { lat: 42.386867, lng: -71.004736 },
    lines: ["Blue"],
  },
  {
    name: "Suffolk Downs",
    location: { lat: 42.390500, lng: -70.997122 },
    lines: ["Blue"],
  },
  {
    name: "Beachmont",
    location: { lat: 42.397542, lng: -70.992319 },
    lines: ["Blue"],
  },
  {
    name: "Revere Beach",
    location: { lat: 42.407843, lng: -71.001667 },
    lines: ["Blue"],
  },
  {
    name: "Wonderland",
    location: { lat: 42.41342, lng: -70.99166 },
    lines: ["Blue"],
  },

  // -------------------------
  // GREEN LINE (Shared Trunk)
  // -------------------------
  {
    name: "North Station",
    location: { lat: 42.3662, lng: -71.0621 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Orange"],
  },
  {
    name: "Haymarket",
    location: { lat: 42.363021, lng: -71.05829 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Orange"],
  },
  {
    name: "Government Center",
    location: { lat: 42.359705, lng: -71.059215 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Blue"],
  },
  {
    name: "Park Street",
    location: { lat: 42.356395, lng: -71.062424 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E", "Red"],
  },
  {
    name: "Boylston",
    location: { lat: 42.35302, lng: -71.064486 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "Arlington",
    location: { lat: 42.351917, lng: -71.070854 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "Copley",
    location: { lat: 42.349699, lng: -71.077694 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "Hynes Convention Center",
    location: { lat: 42.34735, lng: -71.087 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E"],
  },
  {
    name: "Kenmore",
    location: { lat: 42.348996, lng: -71.097653 },
    lines: ["Green-B", "Green-C", "Green-D", "Green-E"],
  },

  // -------------------------
  // GREEN-B (Boston College Branch)
  // -------------------------
  {
    name: "Blandford Street",
    location: { lat: 42.34945, lng: -71.10028 },
    lines: ["Green-B"],
  },
  {
    name: "Boston University East",
    location: { lat: 42.3492, lng: -71.1045 },
    lines: ["Green-B"],
  },
  {
    name: "Boston University Central",
    location: { lat: 42.3494, lng: -71.1002 },
    lines: ["Green-B"],
  },
  {
    name: "Boston University West",
    location: { lat: 42.3500, lng: -71.1080 },
    lines: ["Green-B"],
  },
  {
    name: "Saint Paul Street (B)",
    location: { lat: 42.3512, lng: -71.1161 },
    lines: ["Green-B"],
  },
  {
    name: "Pleasant Street",
    location: { lat: 42.3517, lng: -71.1183 },
    lines: ["Green-B"],
  },
  {
    name: "Babcock Street",
    location: { lat: 42.3517, lng: -71.1212 },
    lines: ["Green-B"],
  },
  {
    name: "Packards Corner",
    location: { lat: 42.3519, lng: -71.1250 },
    lines: ["Green-B"],
  },
  {
    name: "Harvard Avenue",
    location: { lat: 42.3502, lng: -71.1310 },
    lines: ["Green-B"],
  },
  {
    name: "Griggs Street",
    location: { lat: 42.3485, lng: -71.1347 },
    lines: ["Green-B"],
  },
  {
    name: "Allston Street",
    location: { lat: 42.3480, lng: -71.1376 },
    lines: ["Green-B"],
  },
  {
    name: "Warren Street",
    location: { lat: 42.3473, lng: -71.1395 },
    lines: ["Green-B"],
  },
  {
    name: "Washington Street",
    location: { lat: 42.3459, lng: -71.1420 },
    lines: ["Green-B"],
  },
  {
    name: "Sutherland Road",
    location: { lat: 42.3438, lng: -71.1460 },
    lines: ["Green-B"],
  },
  {
    name: "Chiswick Road",
    location: { lat: 42.3408, lng: -71.1504 },
    lines: ["Green-B"],
  },
  {
    name: "Chestnut Hill Avenue",
    location: { lat: 42.3388, lng: -71.1532 },
    lines: ["Green-B"],
  },
  {
    name: "South Street",
    location: { lat: 42.3381, lng: -71.1565 },
    lines: ["Green-B"],
  },
  {
    name: "Boston College",
    location: { lat: 42.3400, lng: -71.1665 },
    lines: ["Green-B"],
  },

  // -------------------------
  // GREEN-C (Cleveland Circle Branch)
  // -------------------------
  {
    name: "Saint Marys Street (C)",
    location: { lat: 42.3459, lng: -71.1067 },
    lines: ["Green-C"],
  },
  {
    name: "Hawes Street",
    location: { lat: 42.3443, lng: -71.1102 },
    lines: ["Green-C"],
  },
  {
    name: "Kent Street",
    location: { lat: 42.3443, lng: -71.1142 },
    lines: ["Green-C"],
  },
  {
    name: "Saint Paul Street (C)",
    location: { lat: 42.3431, lng: -71.1167 },
    lines: ["Green-C"],
  },
  {
    name: "Coolidge Corner",
    location: { lat: 42.3424, lng: -71.1211 },
    lines: ["Green-C"],
  },
  {
    name: "Summit Avenue",
    location: { lat: 42.3413, lng: -71.1258 },
    lines: ["Green-C"],
  },
  {
    name: "Brandon Hall",
    location: { lat: 42.3413, lng: -71.1294 },
    lines: ["Green-C"],
  },
  {
    name: "Fairbanks Street",
    location: { lat: 42.3412, lng: -71.1326 },
    lines: ["Green-C"],
  },
  {
    name: "Washington Square",
    location: { lat: 42.3396, lng: -71.1354 },
    lines: ["Green-C"],
  },
  {
    name: "Tappan Street",
    location: { lat: 42.3387, lng: -71.1380 },
    lines: ["Green-C"],
  },
  {
    name: "Dean Road",
    location: { lat: 42.3369, lng: -71.1411 },
    lines: ["Green-C"],
  },
  {
    name: "Englewood Avenue",
    location: { lat: 42.3363, lng: -71.1435 },
    lines: ["Green-C"],
  },
  {
    name: "Cleveland Circle",
    location: { lat: 42.3362, lng: -71.1495 },
    lines: ["Green-C"],
  },

  // -------------------------
  // GREEN-D (Riverside Branch)
  // -------------------------
  {
    name: "Fenway",
    location: { lat: 42.3453, lng: -71.1027 },
    lines: ["Green-D"],
  },
  {
    name: "Longwood",
    location: { lat: 42.3411, lng: -71.1097 },
    lines: ["Green-D"],
  },
  {
    name: "Brookline Village",
    location: { lat: 42.3327, lng: -71.1162 },
    lines: ["Green-D"],
  },
  {
    name: "Brookline Hills",
    location: { lat: 42.3317, lng: -71.1265 },
    lines: ["Green-D"],
  },
  {
    name: "Beaconsfield",
    location: { lat: 42.3353, lng: -71.1341 },
    lines: ["Green-D"],
  },
  {
    name: "Reservoir",
    location: { lat: 42.3350, lng: -71.1487 },
    lines: ["Green-D"],
  },
  {
    name: "Chestnut Hill",
    location: { lat: 42.3267, lng: -71.1652 },
    lines: ["Green-D"],
  },
  {
    name: "Newton Centre",
    location: { lat: 42.3291, lng: -71.1922 },
    lines: ["Green-D"],
  },
  {
    name: "Newton Highlands",
    location: { lat: 42.3211, lng: -71.2063 },
    lines: ["Green-D"],
  },
  {
    name: "Eliot",
    location: { lat: 42.3190, lng: -71.2162 },
    lines: ["Green-D"],
  },
  {
    name: "Waban",
    location: { lat: 42.3262, lng: -71.2302 },
    lines: ["Green-D"],
  },
  {
    name: "Woodland",
    location: { lat: 42.3320, lng: -71.2447 },
    lines: ["Green-D"],
  },
  {
    name: "Riverside",
    location: { lat: 42.3370, lng: -71.2514 },
    lines: ["Green-D"],
  },

  // -------------------------
  // GREEN-E (Heath Street Branch)
  // -------------------------
  {
    name: "Prudential",
    location: { lat: 42.3453, lng: -71.0812 },
    lines: ["Green-E"],
  },
  {
    name: "Symphony",
    location: { lat: 42.3427, lng: -71.0851 },
    lines: ["Green-E"],
  },
  {
    name: "Northeastern",
    location: { lat: 42.3398, lng: -71.0892 },
    lines: ["Green-E"],
  },
  {
    name: "Museum of Fine Arts",
    location: { lat: 42.3383, lng: -71.0954 },
    lines: ["Green-E"],
  },
  {
    name: "Longwood Medical Area",
    location: { lat: 42.3358, lng: -71.1003 },
    lines: ["Green-E"],
  },
  {
    name: "Brigham Circle",
    location: { lat: 42.3342, lng: -71.1048 },
    lines: ["Green-E"],
  },
  {
    name: "Fenwood Road",
    location: { lat: 42.3333, lng: -71.1080 },
    lines: ["Green-E"],
  },
  {
    name: "Mission Park",
    location: { lat: 42.3326, lng: -71.1095 },
    lines: ["Green-E"],
  },
  {
    name: "Riverway",
    location: { lat: 42.3313, lng: -71.1111 },
    lines: ["Green-E"],
  },
  {
    name: "Back of the Hill",
    location: { lat: 42.3303, lng: -71.1126 },
    lines: ["Green-E"],
  },
  {
    name: "Heath Street",
    location: { lat: 42.3289, lng: -71.1106 },
    lines: ["Green-E"],
  },
];


export const getLineColor = (line: string) => {
  switch (line) {
    case "Red":
      return "#FF0000"
    case "Orange":
      return "#FFA500"
    case "Blue":
      return "#0000FF"
    case "Green-B":
    case "Green-C":
    case "Green-D":
    case "Green-E":
      return "#00AA00"
    default:
      return "#888888"
  }
}
