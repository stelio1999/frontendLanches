// src/components/client/LocationPickerModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createPortal } from 'react-dom';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente para controlar o mapa
function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 16);
    }
  }, [center, map]);

  return null;
}

// Componente de sugestão animada
const SuggestionItem = ({ item, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(21, 101, 192, 0.08)' }}
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderRadius: '8px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      <LocationIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
        {item.display_name}
      </span>
    </motion.div>
  );
};

export default function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialAddress = '',
  initialPosition = null,
}) {
  const [search, setSearch] = useState(initialAddress || '');
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState(
    initialPosition || [-25.9653, 32.5892]
  );
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Buscar localização atual
  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [initialPosition]);

  // Buscar sugestões
  useEffect(() => {
    if (!search || search.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            search
          )}&limit=5&countrycodes=mz`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (err) {
        console.error('Erro ao buscar localização:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [search]);

  // Limpar busca
  const handleClearSearch = () => {
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Selecionar sugestão
  const handleSelectSuggestion = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    setPosition([lat, lng]);
    setSelectedAddress(item.display_name);
    setSearch(item.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getAddressFromCoords = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=mz`
    );
    const data = await res.json();
    
    if (data.display_name) {
      return data.display_name;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return null;
  }
};

// Ir para localização atual - CORRIGIDO handleGoToCurrentLocation
const handleGoToCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      
      setPosition([lat, lng]);
      
      // Buscar endereço real
      const address = await getAddressFromCoords(lat, lng);
      
      if (address) {
        setSelectedAddress(address);
        setSearch(address);
      } else {
        // Fallback: usar coordenadas formatadas
        const fallbackAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        setSelectedAddress(fallbackAddress);
        setSearch(fallbackAddress);
      }
    },
    () => {
      // Fallback para Maputo
      const fallbackLat = -25.9653;
      const fallbackLng = 32.5892;
      setPosition([fallbackLat, fallbackLng]);
      setSelectedAddress('Maputo, Moçambique');
      setSearch('Maputo, Moçambique');
    },
    { enableHighAccuracy: true }
  );
};

  // Confirmar localização
  const handleConfirm = () => {
    const address = selectedAddress || `Lat: ${position[0].toFixed(6)}, Lng: ${position[1].toFixed(6)}`;
    onConfirm({
      address: address,
      lat: position[0],
      lng: position[1],
    });
    onClose();
  };

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            style={{
              background: 'var(--surface)',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '92vh',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              overflow: 'hidden',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div
              style={{
                width: '40px',
                height: '4px',
                background: 'var(--border)',
                borderRadius: 'var(--radius-full)',
                margin: '12px auto 0',
                flexShrink: 0,
                cursor: 'grab',
              }}
            />

            {/* Header com gradiente */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                margin: '0 -24px 20px -24px',
                padding: '20px 24px 16px 24px',
                borderRadius: '0 0 30px 30px',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%',
                }}
              />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        color: 'white',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <LocationIcon style={{ fontSize: 24 }} />
                      Selecionar Localização
                    </h2>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.85rem',
                      }}
                    >
                      Mova o marcador ou busque um endereço
                    </p>
                  </div>
                   
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div
              style={{
                padding: '0 20px 20px',
                flex: 1,
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                position: 'relative', // Importante para o posicionamento das sugestões
              }}
              className="hide-scrollbar"
            >
              {/* Search Input com efeito glass */}
              <div
                ref={suggestionsRef}
                style={{
                  position: 'relative',
                  marginBottom: '16px',
                  zIndex: 20, // Z-index alto para ficar acima do mapa
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 12px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 21, // Acima das sugestões
                  }}
                >
                  <SearchIcon
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 20,
                    }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Buscar endereço, rua, bairro..."
                    style={{
                      flex: 1,
                      padding: '14px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.95rem',
                      color: 'var(--text)',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  {search && (
                    <button
                      onClick={handleClearSearch}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DeleteIcon style={{ fontSize: 18 }} />
                    </button>
                  )}
                  {isSearching && (
                    <div
                      className="spinner-small"
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--secondary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        marginLeft: '4px',
                      }}
                    />
                  )}
                </div>

                {/* Sugestões - COM Z-INDEX ALTO PARA FICAR ACIMA DO MAPA */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 999, // Z-index muito alto para ficar acima de tudo
                        pointerEvents: 'auto', // Garantir que seja clicável
                      }}
                    >
                      {suggestions.map((item) => (
                        <SuggestionItem
                          key={item.place_id}
                          item={item}
                          onClick={() => handleSelectSuggestion(item)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botão Localização Atual */}
              <button
                onClick={handleGoToCurrentLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px',
                  marginBottom: '16px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                <MyLocationIcon style={{ fontSize: 18, color: 'var(--secondary)' }} />
                Usar minha localização atual
              </button>

              {/* Mapa com z-index menor */}
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  marginBottom: '16px',
                  zIndex: 1, // Z-index baixo para as sugestões ficarem acima
                }}
              >
                <MapContainer
                  center={position}
                  zoom={16}
                  style={{
                    height: '320px',
                    width: '100%',
                  }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <ChangeMapView center={position} />
                  <Marker
                    position={position}
                    draggable={true}
                    icon={markerIcon}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target.getLatLng();
                        setPosition([marker.lat, marker.lng]);
                        // Tentar obter endereço do local
                        fetch(
                          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${marker.lat}&lon=${marker.lng}`
                        )
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.display_name) {
                              setSelectedAddress(data.display_name);
                              setSearch(data.display_name);
                            }
                          })
                          .catch(() => {});
                      },
                    }}
                  />
                </MapContainer>

                {/* Overlay de instrução */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    color: 'white',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  Arraste o marcador para ajustar a localização
                </div>
              </div>

              {/* Endereço selecionado */}
              {selectedAddress && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'var(--success)10',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--success)30',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <CheckIcon style={{ fontSize: 18, color: 'var(--success)', marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Endereço selecionado
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
                      {selectedAddress}
                    </p>
                  </div>
                </div>
              )}

              {/* Coordenadas */}
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>Lat: {position[0].toFixed(6)}</span>
                <span>Lng: {position[1].toFixed(6)}</span>
              </div>

              {/* Botões de ação */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 2,
                    padding: '14px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(21, 101, 192, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckIcon style={{ fontSize: 18 }} />
                  Confirmar Localização
                </button>
              </div>
            </div>

            {/* Estilos */}
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .spinner-small {
                animation: spin 0.8s linear infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .leaflet-container {
                background: var(--bg);
              }
              .leaflet-control-zoom a {
                background: var(--surface) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
              }
              .leaflet-control-attribution {
                background: var(--surface) !important;
                color: var(--text-secondary) !important;
                font-size: 8px !important;
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}