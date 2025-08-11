<template>
  <div class="page-wrapper">
    <div class="custom-header">
      <div style="width: 50px;"></div>
      <div class="header-title">灵动轨迹</div>
      <div class="header-coins">
        <img class="coin-icon" :src="glodIcon" alt="金币" />
        <span>{{ currentCoins }}</span>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="container">
        <div class="home-content">
          <div class="hero-section">
            <div class="subtitle">专注力训练养成游戏</div>

            <div class="canvas-wrapper">
              <canvas
                ref="previewCanvas"
                class="preview-canvas"
                width="350"
                height="350"
              ></canvas>
            </div>

            <div class="button-group">
              <button class="btn btn-green main-btn" @click="startQuickGame">
                <img class="btn-icon btn-icon-lg" :src="startIcon" alt="快速开始" />
                <span>快速开始</span>
              </button>

              <div class="secondary-buttons">
                <button class="btn btn-outline secondary-btn" @click="goToLevels">
                  <img class="btn-icon" :src="levelIcon" alt="关卡选择" />
                  <span>关卡选择</span>
                </button>

                <button class="btn btn-outline secondary-btn" @click="goToShop">
                  <img class="btn-icon" :src="shopIcon" alt="幽灵商店" />
                  <span>幽灵商店</span>
                </button>

                <button class="btn btn-outline secondary-btn reports-btn" @click="goToReports">
                  <img class="btn-icon" :src="reportIcon" alt="训练报告" />
                  <span>训练报告</span>
                </button>
              </div>
            </div>

            <div class="save-section">
              <div class="current-save-info">
                <div class="save-name">当前存档: {{ currentSaveName }}</div>
                <button class="btn btn-outline save-btn" @click="goToSaveManager">
                  <img class="btn-icon" :src="saveIcon" alt="存档管理" />
                  <span>存档管理</span>
                </button>
              </div>
            </div>
          </div>

          <div class="info-section">
            <div class="info-card">
              <div class="info-title">
                <img class="title-icon-img" :src="hintIcon" alt="游戏玩法" />
                <span>游戏玩法</span>
              </div>
              <div class="info-content">
                <div class="info-item">
                  <img class="info-icon-img" :src="targetIcon" alt="控制小幽灵主动去吃苹果" />
                  <span>控制小幽灵主动去吃苹果</span>
                </div>
                <div class="info-item">
                  <img class="info-icon-img" :src="traceIcon" alt="使用鼠标或触摸精确控制" />
                  <span>使用鼠标或触摸精确控制</span>
                </div>
                <div class="info-item">
                  <img class="info-icon-img" :src="glodIcon" alt="获得金币解锁新装扮" />
                  <span>获得金币解锁新装扮</span>
                </div>
                <div class="info-item">
                  <img class="info-icon-img" :src="mapIcon" alt="挑战不同形状的轨道" />
                  <span>挑战不同形状的轨道</span>
                </div>
                <div class="info-item">
                  <img class="info-icon-img" :src="selfAdaptionIcon" alt="游戏会自动调节难度" />
                  <span>游戏会自动调节难度</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import ghostImg from '../assets/ghost.png'
import ghostTigerImg from '../assets/ghost_tiger.png'
import ghostScarfImg from '../assets/ghost_scarf.png'
import ghostWitchImg from '../assets/ghost_witch.png'
import ghostMarshmallowImg from '../assets/ghost_mashmallow.png'
import ghostEvilImg from '../assets/ghost_evil.png'
import ghostPekingImg from '../assets/ghost_peking.png'
import appleImg from '../assets/apple.png'
import bananaImg from '../assets/banana.png'
import grapeImg from '../assets/grape.png'
import orangeImg from '../assets/orange.png'
import strawberryImg from '../assets/strawberry.png'
import cherryImg from '../assets/cherry.png'

// 新增：图标 PNG
import startIcon from '../assets/start.png'
import levelIcon from '../assets/level.png'
import shopIcon from '../assets/store.png'
import saveIcon from '../assets/save.png'
import hintIcon from '../assets/hint.png'
import targetIcon from '../assets/target.png'
import glodIcon from '../assets/glod.png'
import mapIcon from '../assets/map.png'
import selfAdaptionIcon from '../assets/self-adaption.png'
import traceIcon from '../assets/trace.png'
import reportIcon from '../assets/report.png' // 虽未明确要求，但首页存在“训练报告”，使用现有资源

const router = useRouter()
const gameStore = useGameStore()
const previewCanvas = ref(null)
const totalCoins = ref(0)
const ghostImage = ref(null)

let animationId = null

const fruitImages = ref({})
const fruitImageMap = {
  'apple': appleImg,
  'banana': bananaImg,
  'grape': grapeImg,
  'orange': orangeImg,
  'strawberry': strawberryImg,
  'cherry': cherryImg
}

const currentSaveName = computed(() => {
  // 强制重新获取最新数据
  const saves = gameStore.getAllSaves()
  const currentId = gameStore.getCurrentSaveId()
  const currentSave = saves.find(s => s.id === currentId)
  return currentSave ? currentSave.name : '默认存档'
})

// 添加一个响应式的金币数据
const currentCoins = computed(() => {
  return gameStore.totalCoins
})

onMounted(() => {
  // 重新加载游戏数据，确保显示当前存档的信息
  gameStore.loadGameData()
  totalCoins.value = gameStore.totalCoins
  
  // 加载水果图片
  Object.entries(fruitImageMap).forEach(([fruitId, src]) => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      fruitImages.value[fruitId] = img
      // 当所有图片加载完成后再初始化动画
      if (Object.keys(fruitImages.value).length === Object.keys(fruitImageMap).length) {
        initPreviewAnimation()
      }
    }
  })
  
  // 如果没有水果图片，也要初始化动画
  if (Object.keys(fruitImageMap).length === 0) {
    initPreviewAnimation()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const initPreviewAnimation = () => {
  const canvas = previewCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  const centerX = 175
  const centerY = 175
  const circleRadius = 140
  const ballRadius = 14
  let time = 0

  // 根据当前装扮加载对应的幽灵图片
  const loadCurrentGhostImage = () => {
    const currentOutfitData = gameStore.gameData.outfits.find(o => o.id === gameStore.gameData.currentOutfit)
    const imageSrc = currentOutfitData && currentOutfitData.image ? 
      getImageSrc(currentOutfitData.image) : ghostImg
    
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      ghostImage.value = img
      if (!animationId) { // 只有在动画还没开始时才启动
        animate()
      }
    }
  }

  // 获取图片源的辅助函数
  const getImageSrc = (imageName) => {
    const imageMap = {
      'ghost.png': ghostImg,
      'ghost_tiger.png': ghostTigerImg,
      'ghost_scarf.png': ghostScarfImg,
      'ghost_witch.png': ghostWitchImg,
      'ghost_mashmallow.png': ghostMarshmallowImg,
      'ghost_evil.png': ghostEvilImg,
      'ghost_peking.png': ghostPekingImg
    }
    return imageMap[imageName] || ghostImg
  }

  const drawGhost = (x, y) => {
    if (!ghostImage.value) return
    
    const imgSize = ballRadius * 4.5
    const drawX = x - imgSize / 2
    const drawY = y - imgSize / 2
    
    ctx.drawImage(ghostImage.value, drawX, drawY, imgSize, imgSize)
  }

  const animate = () => {
    time += 0.02

    // 清空画布
    ctx.clearRect(0, 0, 350, 350)

    // 绘制背景渐变
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, circleRadius + 50)
    gradient.addColorStop(0, '#f0f9ff')
    gradient.addColorStop(1, '#e0f2fe')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 350, 350)

    // 绘制圆圈
    ctx.beginPath()
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4
    ctx.stroke()

    // 绘制水果（使用当前选择的水果图片）
    const appleAngle = time
    const appleX = centerX + Math.cos(appleAngle) * circleRadius
    const appleY = centerY + Math.sin(appleAngle) * circleRadius

    const currentFruitType = gameStore.currentFruit
    const currentFruitImage = fruitImages.value[currentFruitType]
    
    if (currentFruitImage) {
      const imgSize = ballRadius * 3.0
      const drawX = appleX - imgSize / 2
      const drawY = appleY - imgSize / 2
      ctx.drawImage(currentFruitImage, drawX, drawY, imgSize, imgSize)
    } else {
      // 如果图片未加载，绘制默认苹果
      ctx.beginPath()
      ctx.arc(appleX, appleY + 1, ballRadius - 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()

      // 苹果叶子
      ctx.beginPath()
      ctx.arc(appleX + 4, appleY - 6, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#22c55e'
      ctx.fill()
    }

    // 绘制幽灵
    const ghostAngle = time + Math.PI
    const ghostX = centerX + Math.cos(ghostAngle) * circleRadius
    const ghostY = centerY + Math.sin(ghostAngle) * circleRadius

    drawGhost(ghostX, ghostY)

    animationId = requestAnimationFrame(animate)
  }

  // 加载当前装扮的幽灵图片
  loadCurrentGhostImage()
}

const startQuickGame = () => {
  router.push('/game?levelId=1&autoStart=true')
}

const goToLevels = () => {
  router.push('/levels')
}

const goToShop = () => {
  router.push('/shop')
}

const goToReports = () => {
  router.push('/reports')
}

const goToSaveManager = () => {
  router.push('/save-manager')
}
</script>

<style scoped>
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.hero-section {
  text-align: center;
  padding: 20px;

}

.save-section {
  margin-top: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.current-save-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  border: 2px solid rgba(139, 92, 246, 0.2);
  max-width: 400px;
  width: 100%;
}

.save-name {
  font-size: 16px;
  font-weight: 600;
  color: #7c3aed;
  flex: 1;
  text-align: center;
}

.canvas-wrapper {
  margin: 30px 0;
  display: flex;
  justify-content: center;
}

.preview-canvas {
  width: 350px;
  height: 350px;
  border: 3px solid #c7d2fe;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

/* 头部金币图标 */
.coin-icon {
  width: 18px;
  height: 18px;
  vertical-align: -3px;
  margin-right: 6px;
}

/* 按钮组与图标 */
.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.main-btn {
  font-size: 20px;
  padding: 16px 40px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  transform: scale(1);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.main-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
}

.secondary-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.secondary-btn {
  font-size: 16px;
  padding: 12px 24px;
  min-width: 150px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.btn-icon-lg {
  width: 24px;
  height: 24px;
}

.reports-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-color: #f59e0b;
}

.reports-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-color: #d97706;
}

/* 信息卡片与图标 */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.info-card {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bae6fd;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
}

.info-title {
  font-size: 20px;
  font-weight: bold;
  color: #0369a1;
  margin-bottom: 16px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #0369a1;
  font-size: 16px;
  padding: 8px 0;
}

.info-icon-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* 存档按钮图标 */
.save-btn {
  font-size: 14px;
  padding: 8px 16px;
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-canvas {
    width: 300px;
    height: 300px;
  }
  
  .secondary-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .secondary-btn {
    width: 200px;
  }
  
  .info-item {
    font-size: 15px;
  }
  
  .current-save-info {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .save-name {
    font-size: 15px;
  }

  .save-btn {
    width: 150px;
  }

  .btn-icon-lg {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .preview-canvas {
    width: 280px;
    height: 280px;
  }
  
  .main-btn {
    font-size: 18px;
    padding: 14px 32px;
    min-width: 180px;
  }
  
  .secondary-btn {
    font-size: 15px;
    padding: 10px 20px;
    min-width: 140px;
  }
  
  .info-card {
    padding: 20px;
  }

  .title-icon-img {
    width: 24px;
    height: 24px;
  }
  
  .info-icon-img {
    width: 20px;
    height: 20px;
  }

  .save-btn {
    width: 140px;
    font-size: 13px;
    padding: 8px 12px;
  }
}


.header-coins {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.coin-icon {
  width: 26px;
  height: 26px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.header-coins:hover .coin-icon {
  transform: scale(1.1) rotate(10deg);  /* 悬停动画 */
}

.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.header-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif;
  text-align: center;
  padding-left:55px;
  font-weight: 800;
  font-size: clamp(26px, 5vw, 40px);
  line-height: 1.2;
  letter-spacing: 0.06em;
  color: #111827;
  white-space: nowrap; /* 标题不换行 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

/* 极简强调线，低饱和度，保持简约 */
.header-title::after {
  content: "";
  display: block;
  width: 44px;
  height: 3px;
  border-radius: 999px;
  margin: 6px auto 0;
  background: linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%);
  opacity: 0.85;
}

@media (max-width: 480px) {
  .header-title {
    font-size: clamp(22px, 6vw, 30px);
    letter-spacing: 0.04em;
  }
  .header-title::after {
    width: 36px;
    height: 2.5px;
    margin-top: 4px;
  }
}
</style>
