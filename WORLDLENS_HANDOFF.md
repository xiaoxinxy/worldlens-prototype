# WorldLens 项目交接文档

本文档用于在新对话中继续开发 WorldLens。当前阶段项目已经从早期 3D 地球演示，推进到“全球文化、地理、文明探索平台”的产品雏形。

## 1. 当前项目架构

### 技术栈

- 前端：Vue 3 + Vite
- 3D：Three.js + OrbitControls
- 状态管理：Pinia
- 路由：Vue Router
- 后端雏形：Node.js + Express
- 数据存储：前端本地数据 + public GeoJSON + 后端 JSON 文件模拟数据库

### 根目录结构

```text
worldlens-prototype/
├─ public/
│  ├─ geo/
│  │  ├─ countries.geojson
│  │  ├─ continents.geojson
│  │  ├─ oceans.geojson
│  │  └─ country-meta.json
│  ├─ images/
│  │  └─ places/
│  └─ textures/
├─ server/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ db/
│  │  ├─ routes/
│  │  └─ services/
│  └─ data/db/
├─ src/
│  ├─ api/
│  ├─ assets/styles/
│  ├─ components/
│  ├─ components/routes/
│  ├─ data/
│  ├─ router/
│  ├─ stores/
│  ├─ utils/
│  └─ views/
├─ CULTURAL_ROUTES_REPORT.md
├─ FIX_REPORT.md
├─ README.md
└─ WORLDLENS_HANDOFF.md
```

### 前端入口

- `src/main.js`
  - 创建 Vue app
  - 注册 Pinia
  - 注册 router
  - 加载全局样式
- `src/App.vue`
  - 顶部导航 `AppHeader`
  - 页面路由出口

### 路由

文件：`src/router/index.js`

当前主要路由：

- `/`
  - 地球首页
  - 组件：`src/views/EarthView.vue`
- `/?mode=routes`
  - 文化路线模式
  - 仍然使用 `EarthView.vue`
- `/gallery`
  - 文化档案馆
  - 组件：`src/views/AtlasGallery.vue`
- `/place/:slug`
  - 国家、大洲、大洋、海域、极地详情页
  - 组件：`src/views/PlaceDetail.vue`
- `/favorites`
  - 收藏页
  - 组件：`src/views/FavoriteView.vue`
- `/about`
  - 关于页
  - 组件：`src/views/AboutView.vue`
- `/search`
  - 当前重定向到 `/gallery`

## 2. 已完成功能

### 3D 地球

- 使用真实地球白天地表贴图
- 使用夜景灯光贴图
- 使用云层贴图
- 使用法线贴图和镜面贴图
- 有大气层蓝色辉光
- 有 Fresnel 风格边缘发光
- 支持 OrbitControls 旋转和滚轮缩放
- 支持国家、大洲、大洋、海域、极地轮廓图层
- 支持点击地球后识别地点并高亮边界
- 支持搜索地点后地球转向对应坐标
- 支持“聚焦此处”镜头推进
- 修复过“单击地球自动放大”和“聚焦后拖不走”的问题

### 国家识别

- 使用 `countries.geojson` 全量国家边界做 point-in-polygon 判断
- 国家识别优先级最高
- 点击国家后右侧显示国家信息
- 点击国家后地球表面高亮国家轮廓
- 中国相关区域做了合并高亮逻辑：大陆、台湾、香港、澳门统一归到中国高亮组

### 大洲 / 大洋 / 海域

- 使用 `continents.geojson` 和 `oceans.geojson`
- 国家未命中后再判断海洋
- 海洋未命中后再判断大洲
- 大洲、大洋、主要海域有对应详情页和档案馆入口
- 大洋/海域边界已经从早期矩形框改为 GeoJSON polygon 轮廓

### 文化档案馆

- 当前不是随机图片墙
- 入口 `/gallery`
- 支持：
  - 按大洲分类
  - 按大洋分类
  - 进入某个大洲后查看该大洲国家列表
  - 进入某个大洋后查看相关海域列表
  - 搜索国家、大洲、大洋、文化关键词
- 点击卡片进入对应详情页

### 国家详情页

- 重点国家使用更完整的详情页
- 普通小国使用简版详情页
- 重点国家有：
  - 全屏 Hero
  - 收藏按钮
  - 回到地球定位
  - 探索附近
  - 维基百科链接
  - 特色故事区
  - 图像记忆
  - 相关地点推荐
- 普通国家有：
  - coverImage
  - 简介
  - 基础事实
  - 维基百科链接

### 搜索

- 首页右侧搜索面板支持搜索地点
- 文化档案馆支持搜索
- 搜索结果走统一的地点数据
- 搜索结果点击后进入详情页或地球定位

### 收藏

- 使用 Pinia store：`src/stores/favorite.js`
- API 封装：`src/api/favoriteApi.js`
- 当前主要通过 localStorage / 后端 JSON fallback 保存收藏 ID
- 顶部导航显示收藏数量
- 收藏页展示收藏地点

### 浏览记录

- 使用 Pinia store：`src/stores/history.js`
- API 封装：`src/api/historyApi.js`
- 点击地点或进入详情后会写入最近探索
- 首页右侧有最近探索列表

### 后端雏形

- 路径：`server/`
- 技术：Express
- 端口默认：`4174`
- 已有接口：
  - `GET /api/health`
  - `GET /api/places`
  - `GET /api/places/:id`
  - `GET /api/search?q=...`
  - `GET /api/favorites`
  - `POST /api/favorites`
  - `DELETE /api/favorites/:id`
  - `GET /api/history`
  - `POST /api/history`
  - `DELETE /api/history`
  - `auth` 路由存在，但仍是雏形
- 数据库暂时是 JSON 文件：
  - `server/data/db/favorites.json`
  - `server/data/db/history.json`

### 文化路线

本轮新增。

- 顶部导航新增“文化路线”
- 进入方式：`/?mode=routes`
- 不新增普通页面，而是在地球上叠加路线模式
- 数据文件：`src/data/culturalRoutes.js`
- 组件：
  - `src/components/routes/RoutePanel.vue`
  - `src/components/routes/RoutePlayer.vue`
  - `src/components/routes/RouteNodeCard.vue`
- 第一批路线：
  - 丝绸之路
  - 佛教传播路线
  - 大航海时代
  - 香料贸易路线
  - 地中海文明圈
- 功能：
  - 选择路线后，地球显示路线节点
  - 节点之间显示动态弧线
  - 节点有发光点
  - 点击节点显示介绍卡片
  - 右侧面板显示路线介绍、时期、经过国家、关键词
  - 支持开始旅程、暂停、继续、上一步、下一步
  - 自动旅程会按节点顺序聚焦

## 3. 已完成页面

### 地球首页

文件：`src/views/EarthView.vue`

职责：

- 承载 `EarthScene`
- 负责加载地点数据
- 管理选中地点
- 管理 activeFeature
- 管理搜索选择
- 管理右侧地点预览卡片
- 管理最近探索
- 管理文化路线模式

主要子组件：

- `src/components/EarthScene.vue`
- `src/components/SearchPanel.vue`
- `src/components/PlacePreviewCard.vue`
- `src/components/routes/RoutePanel.vue`

### 文化档案馆

文件：`src/views/AtlasGallery.vue`

职责：

- 以大洲 / 大洋作为入口
- 进入大洲后展示国家列表
- 进入大洋后展示相关海域 / 大洋列表
- 支持搜索
- 卡片使用地点 coverImage

当前逻辑：

- 从 `getPlaces()` 获取统一地点列表
- 根据 `section` query 判断当前是大洲分类还是大洋分类
- 根据 `group` query 判断进入了哪个大洲 / 大洋
- 搜索时使用 `filterPlaces`

### 详情页

文件：`src/views/PlaceDetail.vue`

职责：

- 根据 `/place/:slug` 加载地点
- 显示 Hero
- 判断是否重点地点
- 重点地点显示完整内容
- 非重点国家显示简版内容
- 详情页记录浏览历史
- 详情页提供收藏、回到地球定位、探索附近、维基百科

重点国家判断：

- `detailLevel === 'full'`
- 或 `geoFeatureId` 在重点国家集合里

当前重点国家集合大致包括：

- 中国
- 美国
- 日本
- 英国
- 法国
- 德国
- 俄罗斯
- 意大利
- 西班牙
- 印度
- 韩国
- 澳大利亚
- 巴西
- 埃及
- 土耳其
- 南非

### 收藏页

文件：`src/views/FavoriteView.vue`

职责：

- 读取收藏 ID
- 从地点数据中匹配收藏地点
- 展示收藏列表
- 支持移除 / 清空收藏

### 关于页

文件：`src/views/AboutView.vue`

职责：

- 展示 WorldLens 的定位、路线和说明
- 不是核心开发重点

## 4. 当前地球系统实现方式

核心文件：`src/components/EarthScene.vue`

### Three.js 结构

主要对象：

- `scene`
- `camera`
- `renderer`
- `controls`
- `earthGroup`
- `earth`
- `nightLights`
- `clouds`
- `atmosphere`
- `markerGroup`
- `boundaryGroups`
- `activeBoundary`
- `routeGroup`

### 地球层级

当前地球使用多层球体：

1. `earth`
   - 基础白天地表贴图
   - `MeshPhongMaterial`
   - 使用 normalMap / specularMap
2. `nightLights`
   - 夜景城市灯光
   - AdditiveBlending
   - 半透明叠加
3. `clouds`
   - 云层球
   - 慢速旋转
4. `atmosphere`
   - ShaderMaterial
   - BackSide
   - Fresnel 风格蓝色辉光

### 贴图位置

```text
public/textures/
├─ earth-day-4k.jpg
├─ earth-night-4k.jpg
├─ earth-clouds-4k.jpg
├─ earth-normal.jpg
├─ earth-specular.jpg
└─ space-horizon.jpg
```

### 相机与控制

- 使用 `OrbitControls`
- 左键：旋转
- 中键：DOLLY
- 右键：PAN
- 缩放主要通过滚轮
- `enablePan` 当前为 `false`
- 有 `minDistance` 和 `maxDistance`
- 点击地点不会默认缩放
- “聚焦此处”或路线播放会触发 `focusCommand`
- 用户拖拽、滚轮、PointerDown 会解除聚焦状态

### 坐标转换

文件：`src/utils/earthMath.js`

- `latLngToVector3(lat, lng, radius)`
  - 经纬度转 Three.js 球面坐标
- `vector3ToLatLng(vector)`
  - Three.js 球面向量转经纬度

### 点击流程

在 `EarthScene.vue` 中：

1. `pointerdown` 记录起点
2. `pointerup` 判断移动距离
3. 如果移动超过 `CLICK_THRESHOLD`，认为是拖拽，不触发点击
4. 如果是点击，调用 `handleClickSelection`
5. 路线模式下优先判断是否点中路线节点
6. 如果没有点中路线节点，再 raycast 地球主体
7. 将命中点转换为 lat/lng
8. 调用 `findFeatureAt(lat, lng, geoLayers)`
9. emit `globe-click`
10. `EarthView` 生成 selected feature 并更新右侧卡片

## 5. 国家识别实现方式

核心文件：

- `src/utils/geoLookup.js`
- `public/geo/countries.geojson`
- `public/geo/country-meta.json`
- `src/views/EarthView.vue`

### GeoJSON 加载

`loadGeoLayers()` 会并行加载：

```text
/geo/countries.geojson
/geo/continents.geojson
/geo/oceans.geojson
```

### Point In Polygon

项目没有引入 turf.js，而是手写了轻量 point-in-polygon：

- `pointInRing(point, ring)`
- `pointInPolygon(point, polygon)`
- `pointInGeometry(lat, lng, geometry)`

支持：

- Polygon
- MultiPolygon

### 识别优先级

`findFeatureAt(lat, lng, layers)` 的顺序是：

1. 国家：`layers.countries`
2. 大洋 / 海域：`layers.oceans`
3. 大洲 / 极地：`layers.continents`

这符合用户要求：国家永远优先于大洲和海洋。

### 中国合并逻辑

文件：`src/utils/geoLookup.js`

```js
const CHINA_RELATED_IDS = ['CHN', 'TWN', 'HKG', 'MAC']
```

当命中：

- CHN
- TWN
- HKG
- MAC

会统一归并到：

- id: `CHN`
- name: 中国
- highlightFeatureIds: `['CHN', 'TWN', 'HKG', 'MAC']`

### 国家高亮

`EarthScene.vue` 中通过：

- `highlightFeatureIds(featureIds, primaryId)`
- `buildFeatureLines(feature, material, radius)`
- `featureRings(feature)`
- `ringToLines(...)`

将 GeoJSON polygon 边界转成 Three.js `Line`，贴在地球曲面半径稍外侧。

## 6. 大洲 / 大洋实现方式

### 大洲

数据：

```text
public/geo/continents.geojson
```

用途：

- 大洲边界线图层
- 国家未命中时 fallback 识别
- 文化档案馆的大洲分类入口
- 大洲详情页

当前大洲数据不是矩形框，而是 GeoJSON polygon。

### 大洋 / 海域

数据：

```text
public/geo/oceans.geojson
```

包含：

- 太平洋
- 大西洋
- 印度洋
- 北冰洋
- 南大洋
- 地中海
- 红海
- 黑海
- 加勒比海
- 南海
- 波罗的海
- 阿拉伯海

用途：

- 海洋点击识别
- 海洋边界高亮
- 文化档案馆的大洋分类入口
- 大洋 / 海域详情页

### 图层开关

`EarthScene.vue` 里有 `layer-switcher`：

- 国家边界
- 大洲轮廓
- 大洋区域
- 文化热点

这些按钮切换 `layersVisible`。

## 7. 文化档案馆实现方式

文件：`src/views/AtlasGallery.vue`

### 当前目标

文化档案馆不是图集瀑布流，而是：

```text
大洲 / 大洋分类
↓
大洲国家列表 / 大洋相关海域列表
↓
点击进入对应详情页
```

### 状态来源

- `places`：通过 `getPlaces()` 获取
- `keyword`：来自 query `q`
- `section`：来自 query `section`
- `group`：来自 query `group`

### 页面状态

1. 无搜索、无 section
   - 显示根分类：
     - 大洲
     - 大洋
2. section = `continents`
   - 显示大洲列表
3. section = `oceans`
   - 显示大洋列表
4. section + group
   - 显示对应分组下的国家 / 海域列表
5. q 有值
   - 显示搜索结果

### 注意事项

- 当前文件中部分中文字符串在 PowerShell 输出里显示为乱码，可能是终端编码显示问题，也可能是源文件编码问题。后续建议统一审计编码。
- 文化档案馆逻辑已经不再是随机图片墙，但视觉和文案仍可继续打磨。

## 8. 国家详情页实现方式

文件：`src/views/PlaceDetail.vue`

### 数据加载

详情页通过：

```js
getPlace(route.params.slug)
```

从统一数据层加载地点。

### 详情页类型

详情页分两类：

1. 重点地点 / 重点国家
   - `isDetailedPlace === true`
   - 显示完整详情布局
2. 普通国家
   - `isDetailedPlace === false`
   - 显示简版国家档案

### 重点国家内容来源

重点国家特色内容主要来自：

```text
src/data/detailProfiles.js
```

每个重点国家通过 `geoFeatureId` 匹配 profile。

profile 结构大致为：

```js
{
  label,
  summary,
  stories: [
    {
      title,
      kicker,
      imageKey,
      imageUrl?,
      content
    }
  ]
}
```

详情页通过 `detailProfileForPlace(place)` 获取当前国家 profile。

### 图片选择

详情页图片由以下层级决定：

1. `story.imageUrl`
2. `sectionImage(story.imageKey)`
3. `place.sectionImages[key]`
4. `place.gallery` 第一张
5. `place.coverImage`
6. `/textures/space-horizon.jpg`

### 简版国家详情

普通国家由 `countryCatalog.js` 自动生成基础内容：

- name
- nameEn
- continent
- intro
- stats
- wikiUrl
- coverImage
- gallery
- sectionImages

但普通国家通常不做完整文化长文。

### 维基百科链接

详情页有 `wikiHref`：

- 优先使用 `place.wikiUrl`
- 否则基于 `nameEn` 或 `name` 自动生成英文 Wikipedia URL

## 9. 数据文件位置

### 核心地点数据

```text
src/data/places.js
```

用于维护人工整理的重点地点、国家、大洋、极地等基础数据。

### 全量国家目录生成

```text
src/data/countryCatalog.js
```

职责：

- 读取 countries.geojson 与 country-meta
- 合并人工整理国家
- 为 190+ 国家生成基础 place
- 设置 `detailLevel`
- 设置基本 stats、intro、wikiUrl、coverImage、gallery、sectionImages

### 大洲 / 大洋 / 极地数据

```text
src/data/regions.js
```

用于补充非国家类地点：

- 大洲
- 大洋
- 海域
- 极地

### 图片映射

```text
src/data/placeImages.js
```

职责：

- 地点封面图
- gallery 图
- section image 图
- 重点国家图片映射
- 大洋 / 海域图片映射
- fallback 图片池

### 图片增强层

```text
src/data/placeMedia.js
```

职责：

- 给 place 补齐 coverImage
- 补齐 sectionImages
- 补齐 gallery
- 过滤 flag 图片
- 处理部分 slug 到 geoFeatureId 的映射

### 重点国家详情 Profile

```text
src/data/detailProfiles.js
```

职责：

- 为重点国家提供特色化详情页内容
- 避免所有国家都是同一个模板

### 文化路线数据

```text
src/data/culturalRoutes.js
```

包含 5 条文明传播路线。

### 自动生成 / 备用图片数据

```text
src/data/generatedWikiImages.js
```

用于部分国家或主要国家图片补充。

### GeoJSON

```text
public/geo/countries.geojson
public/geo/continents.geojson
public/geo/oceans.geojson
public/geo/country-meta.json
```

### API 封装

```text
src/api/placeApi.js
src/api/favoriteApi.js
src/api/historyApi.js
```

## 10. 图片资源位置

### 本地图片

```text
public/images/places/
```

当前已有本地图片包括：

- china-cover.jpg
- china-gallery-1.jpg 到 china-gallery-4.jpg
- japan-cover.jpg
- india-cover.jpg
- france-cover.jpg
- italy-cover.jpg
- united-kingdom-cover.jpg
- usa-cover.jpg
- brazil-cover.jpg
- australia-cover.jpg
- egypt-cover.jpg
- south-africa-cover.jpg
- pacific-ocean-cover.jpg
- atlantic-ocean-cover.jpg
- indian-ocean-cover.jpg
- antarctica-cover.jpg
- arctic-region-cover.jpg
- 以及对应 gallery 图

### 远程图片

大量图片仍然来自：

- Wikimedia Commons
- Unsplash

远程 URL 主要在：

```text
src/data/placeImages.js
src/data/generatedWikiImages.js
src/data/culturalRoutes.js
```

### 地球贴图

```text
public/textures/
├─ earth-day-4k.jpg
├─ earth-night-4k.jpg
├─ earth-clouds-4k.jpg
├─ earth-normal.jpg
├─ earth-specular.jpg
└─ space-horizon.jpg
```

## 11. 当前存在的问题

### 1. 源码中文编码需要审计

在 PowerShell 中读取部分文件时，中文显示为乱码，例如：

- `src/router/index.js`
- `src/views/AtlasGallery.vue`
- `src/views/PlaceDetail.vue`
- `src/data/countryCatalog.js`
- `src/data/detailProfiles.js`

实际浏览器中部分文字显示正常，但不能完全排除文件编码或字符串已经被污染的问题。

推荐后续做一次专门的编码修复：

- 统一保存为 UTF-8
- 检查所有用户可见中文
- 把乱码字符串恢复成正常中文
- 避免直接在 PowerShell 默认编码下批量读写中文文件

### 2. 图片质量仍不完全稳定

虽然已经做了大量图片映射，但仍有风险：

- 部分普通国家 coverImage 仍来自 fallback 池，可能与国家不够准确
- 部分远程图片可能失效
- 少数 Wikimedia 图片体积较大，加载慢
- Unsplash URL 稳定性通常可以，但不是强资产管理

推荐后续：

- 给重点国家全部下载本地图片
- 给大洲 / 大洋 / 海域下载本地代表图
- 给普通国家至少建立更准确的国家级 cover 映射

### 3. 大量国家内容仍是自动生成

当前目标是覆盖 190+ 国家，因此 B 级国家大多是自动生成简介。

问题：

- 文案比较模板化
- 文化深度有限
- 中文内容可能混有英文元数据

推荐后续逐步做国家内容分层：

- A 级国家：完整特色档案
- B 级国家：较丰富简介 + 代表图片
- C 级国家：基础事实 + 维基链接

### 4. 后端仍是雏形

目前后端主要是：

- Express
- JSON 文件模拟数据
- 没有用户系统
- 没有真实鉴权
- 没有 MySQL / PostgreSQL
- 没有数据迁移

收藏和历史虽然有接口，但仍不是真正多用户系统。

### 5. 地球性能需要长期关注

当前地球使用：

- 8K / 13K 贴图
- 180 段球体
- 国家边界线
- 大洲 / 大洋边界线
- 文化路线图层

在中高配置机器可接受，但移动端或低配设备可能压力较大。

后续可优化：

- 根据设备降低贴图分辨率
- GeoJSON 简化分级
- 边界线按缩放等级显示
- 路线图层懒加载

### 6. 文化路线刚完成第一版

当前文化路线已经可用，但仍是 MVP：

- 路线节点数据较少
- 节点介绍较短
- 路线没有和国家详情深度联动
- 节点图片仍使用远程 URL
- 自动播放节奏可以继续打磨

### 7. 测试体系缺失

当前主要靠手动测试和 `npm run build`。

缺少：

- 单元测试
- GeoJSON 点击识别测试
- 端到端测试
- 图片有效性检查
- 数据完整性校验脚本

## 12. 后续开发路线

### 阶段 1：稳定当前产品雏形

目标：避免继续堆功能，先把基础体验做稳。

建议任务：

- 全站中文编码审计
- 修复所有乱码字符串
- 检查文化档案馆分类是否准确
- 检查 190+ 国家是否都有可访问详情页
- 检查所有重点国家图片是否准确
- 检查所有大洲 / 大洋 / 海域详情页图片是否准确
- 补充数据完整性脚本

### 阶段 2：增强文化路线

目标：把 WorldLens 从“国家百科”升级为“文明路线探索平台”。

建议任务：

- 增加路线节点详情
- 路线节点与国家详情互通
- 路线播放时增加时间轴
- 增加路线地图图例
- 支持路线比较
- 支持用户收藏路线
- 支持路线节点收藏
- 支持路线故事章节

### 阶段 3：内容系统升级

目标：让内容更像 National Geographic / Atlas Obscura。

建议任务：

- 建立 `content/` 目录或数据库表
- 重点国家做独立内容 profile
- 大洲做独立专题
- 大洋做独立专题
- 文化主题做独立专题：
  - 宗教传播
  - 建筑风格
  - 饮食路线
  - 音乐迁徙
  - 贸易网络
- 引入内容来源与版权字段

### 阶段 4：后端与用户系统

目标：从本地原型进入真正产品架构。

建议任务：

- 接入 MySQL 或 PostgreSQL
- 建立用户表
- 登录 / 注册
- JWT 或 Session 鉴权
- 收藏国家
- 收藏路线
- 浏览历史
- 用户笔记
- 用户自定义探索清单

### 阶段 5：高级地球体验

目标：靠地球本身形成产品核心差异。

建议任务：

- 城市级标签
- 国家首都点位
- 按缩放级别显示不同细节
- 国家边界线 LOD
- 路线弧线材质升级
- 选中国家后显示半透明区域填充
- 海洋点击后显示洋流 / 航线层
- 历史时期滑杆

## 13. 推荐下一阶段开发内容

建议下一轮不要立刻加 AI，也不要继续大规模改 UI。优先顺序如下。

### 推荐 1：做一次“数据与编码清理”

原因：

- 当前项目功能越来越多，数据层已经复杂
- 部分文件中文在终端输出出现乱码
- 如果继续开发，乱码和数据不一致会越来越难修

具体任务：

- 检查所有 `.vue`、`.js`、`.md` 文件编码
- 修复用户可见乱码
- 统一中文类型值：
  - 国家
  - 大洲
  - 大洋
  - 海域
  - 极地
- 避免逻辑中依赖乱码字符串
- 给 `type` 增加稳定英文枚举，例如：
  - `country`
  - `continent`
  - `ocean`
  - `sea`
  - `polar`
- 中文只作为显示字段

### 推荐 2：给数据建立校验脚本

新增脚本例如：

```text
scripts/validate-data.mjs
```

校验：

- 每个 place 都有 id
- 每个 place 都有 slug
- 每个 place 都有 name
- 每个 place 都有 type
- 每个 place 都有 lat/lng
- 每个 country 都有 geoFeatureId
- 每个 detail page slug 可访问
- 每个 coverImage 非空
- 重点国家 sectionImages 完整
- 图片 URL 不使用 flag
- culturalRoutes 每个 node 有 lat/lng/wikiUrl

### 推荐 3：深化文化路线

文化路线是当前最有价值的新方向。

下一轮可以优先做：

- 路线时间轴
- 节点详情展开
- 路线与国家详情互链
- 路线播放时地球上显示当前节点名称
- 路线结束后展示总结卡片

### 推荐 4：后端真正落库

等前端数据和编码稳定后，再做：

- MySQL / PostgreSQL schema
- places 表
- routes 表
- route_nodes 表
- users 表
- favorites 表
- history 表

不要现在立刻大规模迁移，否则容易和当前数据清理冲突。

## 运行方式

### 前端

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:5173/
```

文化路线模式：

```text
http://localhost:5173/?mode=routes
```

构建：

```bash
npm run build
```

### 后端

```bash
cd server
npm install
npm run dev
```

后端健康检查：

```text
http://localhost:4174/api/health
```

### 环境变量

前端默认使用本地静态数据；需要连接后端时设置：

```text
VITE_API_BASE=http://localhost:4174/api
```

## 最近一次验证

最近一次新增文化路线后执行过：

```bash
npm run build
```

结果：构建通过。

Vite 有 chunk size 警告，但不影响运行。

## 交接提醒

新对话继续开发时，建议先读取：

1. `WORLDLENS_HANDOFF.md`
2. `CULTURAL_ROUTES_REPORT.md`
3. `src/views/EarthView.vue`
4. `src/components/EarthScene.vue`
5. `src/utils/geoLookup.js`
6. `src/data/placeImages.js`
7. `src/data/detailProfiles.js`
8. `src/data/culturalRoutes.js`

如果下一轮继续开发，最推荐从“数据与编码清理”开始，而不是继续堆新功能。
