# CommuteRank

## 🏙️ Project Overview

**CommuteRank** is a web application designed to help apartment seekers in Boston make informed decisions based on **public transit reliability**, specifically focusing on the **MBTA T line**. While many apartment listings emphasize proximity to subway stations, they often overlook a crucial factor — **how reliable those lines actually are**.

Our application empowers users by providing a **reliability score** for the nearest T station to each apartment location they’re considering. This ensures that users don’t mistakenly assume all T lines are equally dependable, helping them avoid unexpected delays and choose a location that best suits their commuting needs.

## 📊 Dataset

We utilize the [MBTA Bus, Commuter Rail, & Rapid Transit Reliability dataset](https://mbta-massdot.opendata.arcgis.com/datasets/MassDOT::mbta-bus-commuter-rail-rapid-transit-reliability/explore), a public dataset updated monthly by the MBTA.

**Key features of the dataset:**
- Nearly 1 million records
- Clean and well-maintained format
- Includes:
  - Route names
  - Modal types (Bus, Commuter Rail, Rapid Transit)
  - Route categories
  - On-time performance (OTP) metrics

This dataset allows us to generate **reliable, data-backed probability scores** for each station based on historical performance.

## ⚙️ Functionality

The core features of CommuteRank include:

1. **User Input:**  
   Users can enter multiple potential apartment addresses across Boston.

2. **Nearest Station Detection:**  
   For each address, the app identifies the closest MBTA T station.

3. **Transit Reliability Score:**  
   It calculates a transit reliability score for that station based on OTP data from the MBTA dataset.

4. **Ranking:**  
   All entered apartment locations are then ranked by the reliability of their nearest T station, helping users prioritize locations with dependable commutes.

## 🎯 Purpose

The goal of CommuteRank is to **streamline the apartment-hunting process** in Boston by integrating a vital but often overlooked factor — **transit reliability**.

Whether you’re a student, a working professional, or anyone relocating to Boston, this tool can help you:
- Find apartments near **dependable public transportation**
- Avoid long or unpredictable commutes
- Make smarter, data-informed housing decisions

With CommuteRank, users are no longer left guessing about the performance of their local transit — they’ll have the data to back their choice.
