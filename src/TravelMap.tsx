import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复Leaflet图标问题
// 在构建时需确保images文件夹中包含这些图标
const defaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// 定义Location类型
export interface Location {
  id: number;
  name: string;
  nameEn: string;
  coordinates: [number, number]; // [latitude, longitude]
  description: string;
  descriptionEn: string;
  visitDate: string;
  image?: string;
  category?: string;
  rating?: number; // 1-5的评分
  blogUrl?: string; // 博文链接
  shortName?: string; // 城市简称
}

// 定义地图样式类型
export interface MapStyle {
  name: string;
  url: string;
  attribution: string;
}

// 组件属性接口
export interface TravelMapProps {
  locations: Location[];
  defaultZoom?: number;
  defaultCenter?: [number, number];
  language?: 'zh' | 'en';
  enableSearch?: boolean;
  enableFilter?: boolean;
  mapStyles?: MapStyle[];
}

// 默认地图样式
const defaultMapStyles: MapStyle[] = [
  {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  },
  {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
];

// 分类颜色映射
const categoryColors: Record<string, string> = {
  '居住': '#4CAF50',
  '旅行': '#2196F3',
  '商务': '#FF9800',
  '路过': '#9C27B0',
  'default': '#F44336'
};

// 当地图加载时自动调整视图以包含所有地点
const FitBoundsToLocations = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => L.latLng(loc.coordinates[0], loc.coordinates[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  
  return null;
};

// TravelMap主组件
const TravelMap: React.FC<TravelMapProps> = ({
  locations = [],
  defaultZoom = 5,
  defaultCenter = [35, 105], // 中国中心点
  language = 'zh',
  enableSearch = true,
  enableFilter = true,
  mapStyles = defaultMapStyles
}: TravelMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle>(mapStyles[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  
  // 根据分类创建自定义图标
  const createIcon = (category = 'default') => {
    const color = categoryColors[category] || categoryColors.default;
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFF;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  // 渲染星级评分
  const renderRating = (rating: number = 0) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} style={{ 
        color: index < rating ? '#FFD700' : '#e4e5e9',
        marginRight: '2px' 
      }}>★</span>
    ));
  };
  
  // 根据搜索和过滤条件更新显示的地点
  useEffect(() => {
    let filtered = [...locations];
    
    // 应用搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(term) || 
        loc.nameEn.toLowerCase().includes(term) ||
        loc.description.toLowerCase().includes(term) ||
        loc.descriptionEn.toLowerCase().includes(term)
      );
    }
    
    // 应用分类过滤
    if (filterCategory) {
      filtered = filtered.filter(loc => loc.category === filterCategory);
    }
    
    setFilteredLocations(filtered);
  }, [locations, searchTerm, filterCategory]);
  
  // 获取地点对应的图标
  const getLocationIcon = (location: Location) => {
    return createIcon(location.category);
  };

  return (
    <div className="travel-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 搜索和过滤控件 */}
      {(enableSearch || enableFilter) && (
        <div className="travel-map-controls" style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          {enableSearch && (
            <div className="search-container" style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder={language === 'zh' ? "搜索地点..." : "Search locations..."}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </div>
          )}
          
          {enableFilter && (
            <div className="filter-container">
              <select
                value={filterCategory || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value || null)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  width: '100%'
                }}
              >
                <option value="">{language === 'zh' ? "全部分类" : "All Categories"}</option>
                {Array.from(new Set(locations.map(loc => loc.category))).filter(Boolean).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      {/* 地图样式选择器 */}
      <div className="map-style-selector" style={{
        position: 'absolute',
        bottom: '20px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <select
          value={currentMapStyle.name}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const selected = mapStyles.find(style => style.name === e.target.value);
            if (selected) setCurrentMapStyle(selected);
          }}
          style={{
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          {mapStyles.map(style => (
            <option key={style.name} value={style.name}>
              {language === 'zh' ? 
                style.name === 'Standard' ? '标准' : 
                style.name === 'Dark' ? '暗色' : 
                style.name === 'Terrain' ? '地形图' : 
                style.name === 'Satellite' ? '卫星图' : style.name
              : style.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Leaflet地图 */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={currentMapStyle.url}
          attribution={currentMapStyle.attribution}
        />
        <ZoomControl position="bottomleft" />
        <FitBoundsToLocations locations={filteredLocations} />
        
        {filteredLocations.map((location: Location) => (
          <Marker
            key={location.id}
            position={location.coordinates}
            icon={getLocationIcon(location)}
            eventHandlers={{
              click: () => {
                setSelectedLocation(location.id);
              }
            }}
          >
            <Popup>
              <div className="location-popup" style={{ maxWidth: '300px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>
                  {language === 'zh' ? location.name : location.nameEn}
                </h3>
                
                {location.image && (
                  <div style={{ marginBottom: '8px' }}>
                    <img 
                      src={location.image} 
                      alt={language === 'zh' ? location.name : location.nameEn} 
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }} 
                    />
                  </div>
                )}
                
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  {language === 'zh' ? location.description : location.descriptionEn}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '4px' }}>
                  <span role="img" aria-label="calendar" style={{ marginRight: '5px' }}>📅</span>
                  <span>{location.visitDate}</span>
                </div>
                
                {location.category && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '4px' }}>
                    <span role="img" aria-label="category" style={{ marginRight: '5px' }}>🏷️</span>
                    <span>{location.category}</span>
                  </div>
                )}
                
                {location.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '4px' }}>
                    <span role="img" aria-label="rating" style={{ marginRight: '5px' }}>⭐</span>
                    <div>{renderRating(location.rating)}</div>
                  </div>
                )}
                
                {location.blogUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <a 
                      href={location.blogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      {language === 'zh' ? '阅读更多' : 'Read More'}
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TravelMap; 