<template>
  <div class="page-wrapper">
    <div class="container home">
      <!-- ===== Hero: greeting + mascot + streak ring ===== -->
      <section class="hero">
        <div class="hero-greeting">
          <p class="hero-hi">{{ greeting }}</p>
          <h1 class="hero-title">灵动轨迹</h1>
          <p class="hero-sub">专注力训练养成游戏</p>
        </div>

        <!-- Streak / daily goal ring -->
        <div class="hero-ring">
          <svg viewBox="0 0 120 120" class="ring-svg">
            <circle class="ring-track" cx="60" cy="60" r="52" />
            <circle
              class="ring-progress"
              cx="60" cy="60" r="52"
              :stroke-dasharray="ringCircumference"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="ring-center">
            <img class="ring-flame" :src="fireIcon" alt="连续天数" />
            <span class="ring-count">{{ streakDays }}</span>
            <span class="ring-label">天连击</span>
          </div>
        </div>
      </section>

      <!-- ===== Mascot preview canvas ===== -->
      <section class="preview">
        <canvas ref="previewCanvas" class="preview-canvas" width="340" height="340"></canvas>
        <div class="preview-caption">小幽灵正等着你，快开始训练吧！</div>
      </section>

      <!-- ===== Primary CTA ===== -->
      <button class="btn btn-green hero-cta" @click="startQuickGame">
        <img class="cta-icon" :src="startIcon" alt="开始" />
        <span>快速开始</span>
      </button>

      <!-- ===== Nav cards ===== -->
      <section class="nav-cards">
        <button class="nav-card nav-card--green" @click="goToLevels">
          <img class="nav-card-icon" :src="levelIcon" alt="关卡" />
          <span class="nav-card-title">关卡选择</span>
          <span class="nav-card-sub">挑战不同轨道</span>
        </button>
        <button class="nav-card nav-card--blue" @click="goToShop">
          <img class="nav-card-icon" :src="shopIcon" alt="商店" />
          <span class="nav-card-title">幽灵商店</span>
          <span class="nav-card-sub">装扮与水果</span>
        </button>
        <button class="nav-card nav-card--yellow" @click="goToReports">
          <img class="nav-card-icon" :src="reportIcon" alt="报告" />
          <span class="nav-card-title">训练报告</span>
          <span class="nav-card-sub">查看进步</span>
        </button>
        <button class="nav-card nav-card--purple" @click="goToSaveManager">
          <img class="nav-card-icon" :src="saveIcon" alt="存档" />
          <span class="nav-card-title">存档管理</span>
          <span class="nav-card-sub">{{ currentSaveName }}</span>
        </button>
      </section>

      <!-- ===== How to play ===== -->
      <section class="howto">
        <h2 class="duo-section-title">
          <img class="section-icon" :src="hintIcon" alt="玩法" />
          游戏玩法
        </h2>
        <div class="howto-list">
          <div class="howto-item" v-for="tip in tips" :key="tip.text">
            <img class="howto-icon" :src="tip.icon" alt="" />
            <span>{{ tip.text }}</span>
          </div>
        </div>
      </section>
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

import startIcon from '../assets/start.svg'
import levelIcon from '../assets/level.svg'
import shopIcon from '../assets/store.svg'
import saveIcon from '../assets/save.svg'
import reportIcon from '../assets/report.svg'
import fireIcon from '../assets/fire.svg'
import hintIcon from '../assets/hint.svg'
import targetIcon from '../assets/target.svg'
import glodIcon from '../assets/glod.png'
import mapIcon from '../assets/map.svg'
import selfAdaptionIcon from '../assets/self-adaption.svg'
import traceIcon from '../assets/trace.svg'

const router = useRouter()
const gameStore = useGameStore()
const previewCanvas = ref(null)
const ghostImage = ref(null)
let animationId = null

const fruitImageMap = {
  apple: appleImg, banana: bananaImg, grape: grapeImg,
  orange: orangeImg, strawberry: strawberryImg, cherry: cherryImg,
}
const fruitImages = ref({})

const tips = [
  { icon: targetIcon, text: '控制小幽灵主动去吃苹果' },
  { icon: traceIcon, text: '使用鼠标或触摸精确控制' },
  { icon: glodIcon, text: '获得金币解锁新装扮' },
  { icon: mapIcon, text: '挑战不同形状的轨道' },
  { icon: selfAdaptionIcon, text: '游戏会自动调节难度' },
]

const currentSaveName = computed(() => {
  const saves = gameStore.getAllSaves()
  const currentId = gameStore.getCurrentSaveId()
  const currentSave = saves.find((s) => s.id === currentId)
  return currentSave ? currentSave.name : '默认存档'
})

const streakDays = computed(() => gameStore.statistics?.consecutiveDays || 0)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，还在练习真努力！'
  if (h < 12) return '早上好！'
  if (h < 18) return '下午好！'
  return '晚上好！'
})

// Streak ring: cap visual at 7-day weekly goal
const ringCircumference = 2 * Math.PI * 52
const ringOffset = computed(() => {
  const goal = 7
  const ratio = Math.min(streakDays.value / goal, 1)
  return ringCircumference * (1 - ratio)
})

onMounted(() => {
  gameStore.loadGameData()
  Object.entries(fruitImageMap).forEach(([fruitId, src]) => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      fruitImages.value[fruitId] = img
      if (Object.keys(fruitImages.value).length === Object.keys(fruitImageMap).length) initPreviewAnimation()
    }
  })
  if (Object.keys(fruitImageMap).length === 0) initPreviewAnimation()
})

onUnmounted(() => { if (animationId) cancelAnimationFrame(animationId) })

const imageMap = {
  'ghost.png': ghostImg, 'ghost_tiger.png': ghostTigerImg, 'ghost_scarf.png': ghostScarfImg,
  'ghost_witch.png': ghostWitchImg, 'ghost_mashmallow.png': ghostMarshmallowImg,
  'ghost_evil.png': ghostEvilImg, 'ghost_peking.png': ghostPekingImg,
}

const initPreviewAnimation = () => {
  const canvas = previewCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const cx = 170, cy = 170, r = 132, ballR = 14
  let t = 0

  const currentOutfitData = gameStore.gameData.outfits.find((o) => o.id === gameStore.gameData.currentOutfit)
  const img = new Image()
  img.src = imageMap[currentOutfitData?.image] || ghostImg
  img.onload = () => { ghostImage.value = img; if (!animationId) animate() }

  const animate = () => {
    t += 0.02
    ctx.clearRect(0, 0, 340, 340)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 50)
    grad.addColorStop(0, '#f0f9ff'); grad.addColorStop(1, '#e0f2fe')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 340, 340)

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = '#1cb0f6'; ctx.lineWidth = 4; ctx.stroke()

    const aAngle = t
    const ax = cx + Math.cos(aAngle) * r, ay = cy + Math.sin(aAngle) * r
    const fruitImg = fruitImages.value[gameStore.currentFruit]
    if (fruitImg) {
      const sz = ballR * 3
      ctx.drawImage(fruitImg, ax - sz / 2, ay - sz / 2, sz, sz)
    } else {
      ctx.beginPath(); ctx.arc(ax, ay, ballR - 2, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill()
    }

    const gAngle = t + Math.PI
    const gx = cx + Math.cos(gAngle) * r, gy = cy + Math.sin(gAngle) * r
    if (ghostImage.value) {
      const sz = ballR * 4.5
      ctx.drawImage(ghostImage.value, gx - sz / 2, gy - sz / 2, sz, sz)
    }
    animationId = requestAnimationFrame(animate)
  }
}

const startQuickGame = () => router.push('/game?levelId=1&autoStart=true')
const goToLevels = () => router.push('/levels')
const goToShop = () => router.push('/shop')
const goToReports = () => router.push('/reports')
const goToSaveManager = () => router.push('/save-manager')
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 24px; }

/* Hero */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-greeting { flex: 1; min-width: 180px; }
.hero-hi { font-size: 15px; font-weight: 800; color: var(--duo-green-shadow); margin-bottom: 2px; }
.hero-title {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: clamp(30px, 7vw, 44px);
  font-weight: 700;
  color: var(--duo-ink);
  line-height: 1.1;
  letter-spacing: 0.01em;
}
.hero-sub { font-size: 15px; color: var(--duo-muted); margin-top: 4px; font-weight: 600; }

/* Streak ring */
.hero-ring { position: relative; width: 116px; height: 116px; flex-shrink: 0; }
.ring-svg { width: 116px; height: 116px; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: var(--duo-border); stroke-width: 10; }
.ring-progress {
  fill: none; stroke: var(--duo-green); stroke-width: 10; stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}
.ring-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  line-height: 1;
}
.ring-flame { width: 22px; height: 22px; object-fit: contain; margin-bottom: 2px; }
.ring-count { font-family: 'Fredoka','Nunito',sans-serif; font-size: 26px; font-weight: 700; color: var(--duo-green-shadow); }
.ring-label { font-size: 10px; font-weight: 800; color: var(--duo-muted); }

/* Preview */
.preview { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.preview-canvas {
  width: 340px; height: 340px; max-width: 100%;
  border: 3px solid #b5e879; border-radius: 24px;
  box-shadow: 0 6px 0 var(--duo-border);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}
.preview-caption { font-size: 14px; color: var(--duo-muted); font-weight: 600; }

/* CTA */
.hero-cta {
  align-self: center;
  font-size: 20px;
  padding: 18px 48px;
  min-width: 240px;
  border-bottom: 6px solid var(--duo-green-shadow);
  gap: 10px;
}
.hero-cta:active { border-bottom-width: 3px; transform: translateY(3px); }
.cta-icon { width: 24px; height: 24px; object-fit: contain; }

/* Nav cards */
.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}
.nav-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 20px 12px;
  border-radius: 20px;
  border: 2px solid var(--duo-border);
  border-bottom: 5px solid var(--duo-border);
  background: #fff;
  cursor: pointer;
  transition: filter 0.1s, transform 0.08s, border-bottom-width 0.08s;
  text-align: center;
}
.nav-card:hover { filter: brightness(1.03); }
.nav-card:active { border-bottom-width: 2px; transform: translateY(3px); }
.nav-card--green { border-color: #b5e879; border-bottom-color: var(--duo-green-shadow); background: #e9f7d6; }
.nav-card--blue { border-color: #9adcff; border-bottom-color: var(--duo-blue-shadow); background: #e8f7ff; }
.nav-card--yellow { border-color: #ffe066; border-bottom-color: var(--duo-yellow-shadow); background: #fff5cc; }
.nav-card--purple { border-color: #e6b8ff; border-bottom-color: #a85ed8; background: #f5e6ff; }
.nav-card-icon { width: 38px; height: 38px; object-fit: contain; }
.nav-card-title { font-weight: 800; font-size: 15px; color: var(--duo-ink); }
.nav-card-sub { font-size: 12px; color: var(--duo-muted); font-weight: 600; }

/* How to play */
.howto { margin-top: 4px; }
.section-icon { width: 24px; height: 24px; object-fit: contain; }
.howto-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.howto-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 16px;
  background: var(--duo-card); border: 2px solid var(--duo-border);
  font-weight: 700; font-size: 15px; color: var(--duo-ink);
}
.howto-icon { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }

@media (max-width: 480px) {
  .hero { justify-content: center; text-align: center; }
  .hero-greeting { min-width: 0; }
  .preview-canvas { width: 290px; height: 290px; }
  .nav-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
