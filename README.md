# TravelMap 旅行地图组件

一个基于React和Leaflet的交互式旅行地图组件，用于展示和记录您的旅行足迹。

## 特性

- 🗺️ 使用Leaflet实现的交互式地图
- 📍 自定义标记点和弹出窗口
- 🔍 地点搜索和过滤功能
- 🌓 多种地图样式（标准、暗色、地形图、卫星图）
- 📱 响应式设计，适配移动设备
- 🌐 支持多语言（中英文）

## 安装

```bash
npm install travelmap-react-wilboerht
# 或
yarn add travelmap-react-wilboerht
```

## 依赖

本组件依赖以下库：
- React 
- react-leaflet
- leaflet
- next.js (可选，用于图片优化)
- react-icons

## 使用示例

```jsx
import TravelMap from 'travelmap-react-wilboerht';

// 定义您访问过的地点
const myLocations = [
  {
    id: 1,
    name: '上海',
    nameEn: 'Shanghai',
    coordinates: [31.2304, 121.4737],
    description: '我的故乡，一个充满活力的国际大都市。',
    descriptionEn: 'My hometown, a vibrant international metropolis.',
    visitDate: '2022-01-01',
    image: '/images/shanghai.jpg',
    category: '居住',
    rating: 5
  },
  // 更多地点...
];

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <TravelMap locations={myLocations} />
    </div>
  );
}
```

## 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| locations | Location[] | [] | 地点数据数组 |
| defaultZoom | number | 5 | 默认缩放级别 |
| defaultCenter | [number, number] | [35, 105] | 默认中心点坐标(中国) |
| language | 'zh' \| 'en' | 'zh' | 界面语言 |
| enableSearch | boolean | true | 是否启用搜索功能 |
| enableFilter | boolean | true | 是否启用过滤功能 |
| mapStyles | MapStyle[] | [...] | 可用地图样式 |

## Location 数据结构

```typescript
interface Location {
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
```

## 许可证

MIT © 2025 王泓坤

## 贡献

欢迎提交问题和改进建议！ 