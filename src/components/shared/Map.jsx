// src/components/shared/Map.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const Map = ({ 
  lat, 
  lng, 
  marker, 
  zoom = 15, 
  onLocationSelect,
  deliveryLocation,
  route = [],
  showDelivery = false
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const routeRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [lat || -25.9692, lng || 32.5732],
        zoom: zoom,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remover marcadores antigos
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    if (deliveryMarkerRef.current) {
      deliveryMarkerRef.current.remove();
      deliveryMarkerRef.current = null;
    }
    
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    // Adicionar marcador do destino
    if (lat && lng) {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: #4CAF50;
            color: white;
            padding: 8px 14px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            📍 ${marker || 'Destino'}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      markerRef.current = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<strong>📍 ${marker || 'Local da Entrega'}</strong>`);

      map.setView([lat, lng], zoom);
    }

    // Adicionar marcador do delivery
    if (showDelivery && deliveryLocation) {
      const deliveryIcon = L.divIcon({
        className: 'delivery-marker',
        html: `
          <div style="
            background: #FF9800;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 12px;
            box-shadow: 0 4px 16px rgba(255, 152, 0, 0.4);
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            animation: pulse-marker 1.5s ease-in-out infinite;
          ">
            🛵 Entregador
          </div>
          <style>
            @keyframes pulse-marker {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          </style>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      deliveryMarkerRef.current = L.marker(
        [deliveryLocation.lat, deliveryLocation.lng], 
        { icon: deliveryIcon }
      )
        .addTo(map)
        .bindPopup('🛵 Entregador em rota');

      // Adicionar círculo ao redor do delivery
      L.circle([deliveryLocation.lat, deliveryLocation.lng], {
        radius: 50,
        color: '#FF9800',
        fillColor: '#FF9800',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      // Ajustar zoom para mostrar delivery e destino
      if (lat && lng) {
        const bounds = L.latLngBounds([
          [lat, lng],
          [deliveryLocation.lat, deliveryLocation.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Adicionar rota
    if (route && route.length > 0) {
      routeRef.current = L.polyline(route, {
        color: '#1565c0',
        weight: 6,
        opacity: 0.7,
        smoothFactor: 1,
        dashArray: '10, 10',
      }).addTo(map);

      // Adicionar sombra da rota
      L.polyline(route, {
        color: 'rgba(21, 101, 192, 0.15)',
        weight: 14,
        opacity: 0.3,
        smoothFactor: 1,
      }).addTo(map);
    }

    // Evento de clique no mapa
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, marker, zoom, onLocationSelect, deliveryLocation, route, showDelivery]);

  return (
    <div id="map" style={{ height: '100%', width: '100%' }}>
      <style>{`
        .leaflet-container {
          background: var(--bg);
        }
        .leaflet-control-zoom a {
          background: var(--surface) !important;
          color: var(--text) !important;
          border-color: var(--border) !important;
        }
        .leaflet-popup-content-wrapper {
          background: var(--surface) !important;
          color: var(--text) !important;
          border-radius: var(--radius-md) !important;
          border: 1px solid var(--border) !important;
        }
        .leaflet-popup-tip {
          background: var(--surface) !important;
        }
        .leaflet-control-attribution {
          background: var(--surface) !important;
          color: var(--text-secondary) !important;
          font-size: 8px !important;
        }
        .custom-marker, .delivery-marker {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default Map;