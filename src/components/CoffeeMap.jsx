import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import L from 'leaflet'

// Roastery / final destination — Cairo, Egypt
const ROASTERY = [30.0444, 31.2357]

const originIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#C08A3E;border:2.5px solid #2A1810;
    box-shadow:0 0 0 4px rgba(192,138,62,0.25);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const roasteryIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#2A1810;border:2.5px solid #F1E6D6;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 0 4px rgba(42,24,16,0.2);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export default function CoffeeMap({ product }) {
  const center = [
    (product.coords[0] + ROASTERY[0]) / 2,
    (product.coords[1] + ROASTERY[1]) / 2,
  ]

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={2} scrollWheelZoom={false} style={{ height: '380px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={[product.coords, ROASTERY]}
          pathOptions={{ color: '#5C3A28', weight: 2, dashArray: '2 10', lineCap: 'round' }}
        />
        <Marker position={product.coords} icon={originIcon}>
          <Popup>
            <strong>{product.farm}</strong>
            <br />
            {product.country} — نقطة البداية
          </Popup>
        </Marker>
        <Marker position={ROASTERY} icon={roasteryIcon}>
          <Popup>
            <strong>محمصة BeanRoute</strong>
            <br />
            القاهرة، مصر — نهاية الرحلة
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
