What is the project?
We would like to create a map functionality for people choosing apartments in Boston. We want to give them the ability to accurately choose a place that has the highest public transit reliability. In this case, we are looking at the MBTA T line. We want to give them an accurate reliability probability score for any given T line close to their selected apartment location. The inspiration for the project is a more efficient apartment search because something that some people might not realize is that subway systems are not always reliable, especially the MBTA. Due to this fact, it is unfortunate but we have to give them some sort of accurate reliability estimate because, if not, you make an erroneous apartment selection based on an assumption that every T line is on time, when this is far from the truth.

Dataset Used
https://mbta-massdot.opendata.arcgis.com/datasets/MassDOT::mbta-bus-commuter-rail-rapid-transit-reliability/explore

We are using the MBTA Bus, Commuter Rail, & Rapid Transit Reliability dataset which is a CSV that contains the reliability metric for rapid transit, bus, and commuter rail services which contains almost 1 million data entries and is updated monthly by the MBTA. It is a clean dataset with route names, categories, modality, and, most importantly, on-time-performance metrics. 

Functionality
The basic functionality of our application is that:
1) It takes in several user input locations that are sights for their potential apartments. 
2) It then finds the closest T station to that location and performs a calculation for our reliability metric. 
3) Then it ranks the locations based on highest reliability. 


Purpose
To make the apartment finding process easier for people moving into Boston. This can apply to every single person planning on relocating to Boston. They would want this information because it would give them a better insight into where to choose to live based on if  they need access to reliable public transportation. It would help them get a more reliable commute to any destination they plan on visiting often, such as school and work.
