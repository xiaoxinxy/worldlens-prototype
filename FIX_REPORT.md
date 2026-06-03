# WorldLens V3 Fix Report

## 1. 修改文件

- `src/components/EarthScene.vue`
- `src/utils/geoLookup.js`
- `src/views/EarthView.vue`
- `src/views/AtlasGallery.vue`
- `src/views/PlaceDetail.vue`
- `src/components/SearchPanel.vue`
- `src/components/PlacePreviewCard.vue`
- `src/components/PlaceListCard.vue`
- `src/components/CulturalSection.vue`
- `src/data/placeImages.js`
- `src/data/placeMedia.js`
- `src/data/countryCatalog.js`
- `src/assets/styles/base.css`
- `server/src/services/placeService.js`
- `FIX_REPORT.md`

## 2. 修复问题

### 文化档案馆

- 删除旧的图片墙 / 图集逻辑。
- 不再展示 `images` 总数，不再混排所有 gallery 图片。
- 新页面改为“国家文化档案索引”：
  - 大洲分类
  - 国家列表
  - 国家封面图
  - 国家名称
  - 所属大洲
  - 一句简介
  - 关键词
  - 查看档案按钮

### 全球国家识别

- 地球点击现在优先命中地球主体 mesh，再由经纬度进入 `countries.geojson` 全量 Point-in-Polygon 判断。
- 国家识别优先级保持为：
  - 国家
  - 海域
  - 大洲
- 删除国家热点 marker 对点击识别的抢占，避免阿富汗、伊朗、巴基斯坦、哈萨克斯坦等国家被附近热门地点误判。
- 全量审计结果：
  - `countries.geojson` feature 数：242
  - 对每个国家/地区 feature 自动寻找内部点并执行 `findFeatureAt`
  - 失败数：0

### 地球国家文字

- 删除默认国家 Sprite 标签层。
- 地球默认不再显示满屏国家名称。
- 保留 hover 当前区域的小标签。

### 详情页图片

- 详情页 Hero 使用 `coverImage` 作为真实背景图。
- Hero 高度改为 `100vh`，`background-size: cover`，`background-position: center`。
- 地理、历史、饮食、节日、建筑、生活模块改为 `imageUrl + title + description`。
- 不再把模块视觉写成渐变色块。
- 如果模块图片缺失，回退到当前国家 coverImage。

### 图片映射

- 新增 `src/data/placeImages.js`。
- 重点国家使用明确图片映射：
  - 中国、日本、印度、法国、英国、美国、意大利、德国、俄罗斯、巴西、澳大利亚、埃及、土耳其、西班牙、韩国
- 普通国家不再使用国旗作为主图。
- 普通国家使用稳定的大洲级风景 / 城市图片作为 cover fallback。

### 中文化

- 搜索、收藏、查看详情、探索附近、最近探索、清空等用户可见英文已中文化。
- `WorldLens` 作为品牌名保留。

## 3. 验收测试

### 国家识别坐标测试

- 点击阿富汗区域：命中 `阿富汗 / AFG / 国家`
- 点击伊朗区域：命中 `伊朗 / IRN / 国家`
- 点击巴基斯坦区域：命中 `巴基斯坦 / PAK / 国家`
- 点击哈萨克斯坦区域：命中 `哈萨克斯坦 / KAZ / 国家`
- 点击中国区域：命中 `中国 / CHN / 国家`
- 点击印度区域：命中 `印度 / IND / 国家`
- 点击埃及区域：命中 `埃及 / EGY / 国家`
- 马里 / 尼日尔附近：
  - 马里坐标命中 `马里 / MLI / 国家`
  - 尼日尔坐标命中 `尼日尔 / NER / 国家`
  - 未 fallback 到“非洲”

### 全量国家审计

- 总 feature：242
- 每个 feature 取内部点测试
- 国家层识别失败：0

### 浏览器验证

- 首页地球 canvas 正常加载。
- 默认没有满屏国家文字。
- 文化档案馆标题为“国家文化档案索引”。
- 文化档案馆国家卡片数：257。
- 文化档案馆不再存在 `.atlas-masonry`。
- 文化档案馆不再显示 `images` 统计。
- 中国详情页 Hero 使用 `/images/places/china-cover.jpg`。
- 中国详情页 Hero 高度大于当前视口高度。
- 中国详情页 6 个文化模块均为真实图片背景。
- 日本详情页 Hero 使用 `/images/places/japan-cover.jpg`。
- 搜索页国家卡片使用真实图片，不再是渐变占位。

### 构建

- `npm run build` 通过。
- 浏览器控制台未发现 error。

## 4. 本轮追加修复

- `scripts/build-world-geo.mjs` 改为读取 Natural Earth marine polygons，并把大西洋、印度洋、太平洋、北冰洋、南大洋、地中海、红海、黑海、加勒比海、南海、波罗的海、阿拉伯海合并生成真实海洋边界。
- `public/geo/oceans.geojson` 已重新生成，不再是 6 到 12 个点的手写几何：
  - 太平洋：3384 个坐标点
  - 大西洋：3541 个坐标点
  - 印度洋：1150 个坐标点
  - 地中海：645 个坐标点
  - 加勒比海：933 个坐标点
- `src/components/EarthScene.vue` 修复 hover 标签抢占：鼠标命中地球表面时只显示 `findFeatureAt` 的真实地理结果，不再被附近大洲 / 大洋 marker 覆盖。
- `src/components/EarthScene.vue` 暂停默认文化热点 marker，避免右侧卡片显示国家但地球模型标签显示附近大洲或海洋。
- `src/views/AtlasGallery.vue` 改为三级结构：
  - 文化档案馆首页：大洲 / 大洋
  - 分类页：具体大洲或具体大洋
  - 列表页：对应国家或相关海域档案
- `src/data/regions.js` 补齐红海、黑海、南海、波罗的海、阿拉伯海等主要海域档案入口。
- `src/assets/styles/base.css` 增加文化档案馆分类卡样式。

### 本轮验证

- `node scripts/build-world-geo.mjs` 通过，生成 12 个 Natural Earth 海洋 / 海域 feature。
- `npm run build` 通过。
- 坐标识别复测：
  - 阿富汗、伊朗、巴基斯坦、哈萨克斯坦、尼日尔仍优先命中国家。
  - 大西洋、印度洋、太平洋、地中海、加勒比海能命中对应大洋 / 海域。
- 浏览器验证：
  - `/gallery` 只显示“大洲 / 大洋”两个入口，不再直接铺满国家卡。
  - `/gallery?section=continents` 显示 7 个大洲入口。
  - `/gallery?section=continents&group=asia` 显示亚洲国家列表。
  - `/gallery?section=oceans` 显示 12 个大洋 / 海域入口。
  - `/gallery?section=oceans&group=atlantic-ocean` 显示大西洋及相关海域。

## 5. 未完成

- 普通国家目前使用大洲级稳定图片兜底，不再使用国旗；后续可以逐国补充更精确的城市、地标或自然景观图。

## 6. 运行方式

前端：

```bash
npm install
npm run dev
```

后端：

```bash
cd server
npm install
npm run dev
```

默认地址：

- 前端：`http://localhost:5173/`
- 后端：可选，设置 `VITE_API_BASE=http://localhost:4174/api` 后启用
