# WorldLens

WorldLens 是一个 Earth Exploration Platform（地球探索平台）原型。项目把 3D 地球、国家与文化内容、路线、地形、气候和 Earth Layers 组织到同一个探索界面里，让用户理解地球环境如何塑造文明与人类活动。

## 运行

```bash
npm install
npm run dev
```

默认前端地址通常为 `http://localhost:5173/`。

```bash
cd server
npm install
npm run dev
```

默认直接使用本地静态数据，避免未启动后端时等待请求超时。如需连接后端，设置 `VITE_API_BASE=http://localhost:4174/api`。

## 已接入模块

- Earth Scene：Three.js 地球、国家/大洲/海洋边界、路线弧线、地形点位、气候区域。
- Countries / Culture：国家目录、文化档案、详情页、收藏和历史记录。
- Routes：文化路线浏览、节点播放和地球飞行定位。
- Earth Layers：统一管理 Countries、Culture、Routes、Terrain、Climate、Oceans、Astronomy 等图层入口。
- Terrain Explorer：20 条核心地形数据、详情解释、形成动画、Terrain Layer。
- Climate Explorer：15 条气候系统数据、Climate Story、气候动画、Climate Layer。

## API

- `GET /api/places`
- `GET /api/places/:id`
- `GET /api/search?q=keyword`
- `GET /api/terrain`
- `GET /api/terrain/:id`
- `GET /api/terrain/types`
- `GET /api/terrain/featured`
- `GET /api/terrain/:id/related`
- `GET /api/countries/:code/terrain`
- `GET /api/climate`
- `GET /api/climate/:id`
- `GET /api/climate/types`
- `GET /api/climate/featured`
- `GET /api/climate/:id/related`
- `GET /api/countries/:code/climate`
- `GET /api/terrain/:id/climate`
- `GET /api/favorites`
- `POST /api/favorites`
- `GET /api/history`
- `POST /api/history`

## 数据来源

- 地球纹理：`public/textures`
- 国家、大洲、海洋边界：`public/geo`
- 地形数据：`src/data/terrain.js`
- 气候数据：`src/data/climate.js`
- 国家与文化内容：`src/data/*`
- 收藏与历史记录：`server/data/db`
