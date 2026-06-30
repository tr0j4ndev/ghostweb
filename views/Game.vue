<template>
  <div class="game-shell">
    <!-- ===== Slim top bar ===== -->
    <header class="g-top">
      <div class="g-top-inner">
        <button class="g-back" @click="goBack" aria-label="返回">
          <img class="g-back-icon" :src="backIcon" alt="返回" />
        </button>
        <div class="g-progress">
          <div class="g-progress-fill" :style="{ width: lessonProgress + '%' }"></div>
          <span class="g-progress-label">{{ Math.round(lessonProgress) }}%</span>
        </div>
        <div class="g-indicator">
          <img v-if="!isEndless" class="g-ind-icon" :src="timeIcon" alt="时间" />
          <span v-else class="g-ind-badge">Lv{{ gameLevel }}</span>
          <span v-if="!isEndless">{{ gameTimeText }}</span>
        </div>
      </div>
    </header>

    <!-- ===== Centered stage ===== -->
    <main class="g-stage">
     <div class="g-stage-inner">
      <div class="g-level-tag">
        <span class="g-level-dot"></span>{{ currentLevel.name }}
      </div>

      <!-- Canvas hero -->
      <div class="g-canvas-wrap">
        <canvas
          ref="gameCanvas" class="g-canvas" width="400" height="400"
          @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
          @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
        ></canvas>

        <div v-if="showEncouragement" class="g-float success">{{ encouragement }}</div>
        <div v-if="showMissText" class="g-float miss">{{ missText }}</div>

        <transition name="fade">
          <div v-if="!isPlaying && score === 0 && !autoStart" class="g-overlay">
            <div class="g-overlay-card">
              <img class="g-overlay-ghost" :src="ghostImg" alt="" />
              <div class="g-overlay-title">准备好了吗？</div>
              <div class="g-overlay-sub">{{ currentLevel.name }}</div>
              <button class="btn btn-green g-start" @click="startGame">
                <img class="btn-icon" :src="startIcon" alt="开始" /> 开始
              </button>
            </div>
          </div>
        </transition>

        <div v-if="isDizzy" class="g-dizzy">
          <div class="g-dizzy-badge">😵 眩晕中</div>
        </div>
      </div>

      <!-- Lightweight stat strip -->
      <div class="g-stats">
        <div class="g-stat s-score"><img :src="trophyIcon" alt="" /><b>{{ score }}</b><span>得分</span></div>
        <div class="g-stat s-combo"><img :src="fireIcon" alt="" /><b>{{ combo }}</b><span>连击</span></div>
        <div class="g-stat s-miss"><img :src="missIcon" alt="" /><b>{{ missedApples }}</b><span>错过</span></div>
        <div class="g-stat s-coin"><img :src="glodIcon" alt="" /><b>+{{ coinsEarned }}</b><span>金币</span></div>
      </div>

      <!-- Mode tip -->
      <div v-if="currentLevelMode === 'interference'" class="g-mode interference">
        <img :src="interferenceIcon" alt="" /> 避开干扰物，专注追踪
      </div>
      <div v-if="currentLevelMode === 'multi-target'" class="g-mode multi">
        <img :src="multipleIcon" alt="" />
        <span>追踪金色目标，避开绿色干扰</span>
        <em>假苹果 {{ currentFakeApples }}/{{ maxFakeApples }}</em>
      </div>

      <!-- Controls -->
      <div class="g-controls">
        <button v-if="isPlaying || score > 0" class="btn g-ctrl pause" @click="togglePause">
          <img v-if="isPlaying" class="btn-icon" :src="suspendIcon" alt="暂停" />
          <span>{{ isPlaying ? '暂停' : '继续' }}</span>
        </button>
        <button v-if="isPlaying || score > 0" class="btn g-ctrl finish" @click="endGame">
          <img class="btn-icon" :src="finishIcon" alt="结束" /><span>结束</span>
        </button>
        <div v-if="autoStart && !isPlaying && score === 0" class="g-autostart">游戏即将开始...</div>
      </div>

      <!-- Footer meta -->
      <div class="g-foot">
        <img class="g-foot-ghost" :src="ghostImg" alt="" />
        <span class="g-foot-name">{{ currentOutfitName }}</span>
        <span class="g-foot-sep"></span>
        <span class="g-foot-rate">成功率 {{ successRate }}%</span>
        <span class="g-foot-sep"></span>
        <span class="g-foot-lv">Lv {{ gameLevel }}</span>
      </div>
     </div>
    </main>

    <!-- ===== End-game modal ===== -->
    <transition name="modal">
      <div v-if="showEndModal" class="end-overlay" @click.self="closeEndModal">
        <div class="end-card" :class="{ 'end-card--win': endModalData.isComplete }">
          <img class="end-icon" :src="endModalData.isComplete ? congratulationIcon : (endModalData.timeUp ? timeIcon : targetIcon)" alt="" />
          <h2 class="end-title">{{ endModalData.title }}</h2>
          <p v-if="endModalData.message" class="end-message">{{ endModalData.message }}</p>

          <div class="end-stats">
            <div class="end-stat">
              <img :src="trophyIcon" alt="" />
              <b>{{ endModalData.score }}</b>
              <span>得分</span>
            </div>
            <div class="end-stat">
              <img :src="glodIcon" alt="" />
              <b>+{{ endModalData.coins }}</b>
              <span>金币</span>
            </div>
            <div class="end-stat">
              <img :src="fireIcon" alt="" />
              <b>{{ endModalData.combo }}</b>
              <span>最高连击</span>
            </div>
            <div class="end-stat">
              <img :src="accuracyIcon" alt="" />
              <b>{{ endModalData.accuracy }}%</b>
              <span>成功率</span>
            </div>
          </div>

          <div class="end-actions">
            <button class="btn end-btn end-btn--back" @click="closeEndModal">返回</button>
            <button class="btn btn-green end-btn end-btn--retry" @click="retryGame">
              <img class="btn-icon" :src="startIcon" alt="重来" /> 再来一局
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import ghostImg from '../assets/ghost.png'
import ghostTigerImg from '../assets/ghost_tiger.png'
import ghostScarfImg from '../assets/ghost_scarf.png'
import ghostWitchImg from '../assets/ghost_witch.png'
import ghostMarshmallowImg from '../assets/ghost_mashmallow.png'
import ghostEvilImg from '../assets/ghost_evil.png'
import ghostPekingImg from '../assets/ghost_peking.png'
import ghostDizzyImg from '../assets/ghost_dizzy.png'

import backIcon from '../assets/back.png'
import startIcon from '../assets/start.svg'
import timeIcon from '../assets/time.svg'
import suspendIcon from '../assets/suspend.svg'
import finishIcon from '../assets/finish.svg'
import glodIcon from '../assets/glod.png'
import trophyIcon from '../assets/trophy.svg'
import fireIcon from '../assets/fire.svg'
import interferenceIcon from '../assets/interference.svg'
import multipleIcon from '../assets/multiple.svg'
import missIcon from '../assets/miss.svg'
import congratulationIcon from '../assets/congratulation.svg'
import targetIcon from '../assets/target.svg'
import accuracyIcon from '../assets/accuracy.svg'

import appleImg from '../assets/apple.png'
import bananaImg from '../assets/banana.png'
import grapeImg from '../assets/grape.png'
import orangeImg from '../assets/orange.png'
import strawberryImg from '../assets/strawberry.png'
import cherryImg from '../assets/cherry.png'
import badAppleImg from '../assets/badapple.png'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()

// image
const ghostImage = ref(null);
const ghostDizzyImage = ref(null);
const ghostImages = ref({})
const imageMap = {
  'ghost.png': ghostImg,
  'ghost_tiger.png': ghostTigerImg,
  'ghost_scarf.png': ghostScarfImg,
  'ghost_witch.png': ghostWitchImg,
  'ghost_mashmallow.png': ghostMarshmallowImg,
  'ghost_evil.png': ghostEvilImg,
  'ghost_peking.png': ghostPekingImg
}

const fruitImages = ref({})
const fruitImageMap = {
  apple: appleImg, banana: bananaImg, grape: grapeImg,
  orange: orangeImg, strawberry: strawberryImg, cherry: cherryImg
}
const badAppleImage = ref(null)

// 游戏状态
const score = ref(0)
const coinsEarned = ref(0)
const isPlaying = ref(false)
const gameTime = ref(0)
const level = ref(1)
const combo = ref(0)
const gameTimeText = ref('00:00')
const autoStart = ref(false)

// 新的等级系统
const gameLevel = ref(1)
const consecutiveSuccesses = ref(0)
const consecutiveFailures = ref(0)

// 游戏模式相关
const gameMode = ref('timed')
const timeLimit = ref(0)
const displayTime = ref(0)

// 当前关卡
const currentLevel = ref({})
const currentOutfitName = ref('经典幽灵')
const currentLevelMode = ref('timed')

// 鼓励/提示
const showEncouragement = ref(false)
const encouragement = ref('')
const successRate = ref(0)
const missedApples = ref(0)
const totalMisses = ref(0)
const showMissText = ref(false)
const missText = ref('')

// 干扰物/眩晕
const interferenceObjects = ref([])
const isDizzy = ref(false)
const dizzyTimer = ref(null)
const interferenceSpawnTimer = ref(null)

// 多目标
const apples = ref([])
const targetAppleId = ref(null)
const maxFakeApples = ref(0)
const currentFakeApples = ref(0)
const fakeAppleSpawnTimer = ref(null)

// 结束弹窗
const showEndModal = ref(false)
const endModalData = ref({ title: '', score: 0, coins: 0, level: 1, combo: 0, accuracy: 0, message: '', isComplete: false, timeUp: false })

// 画布
const gameCanvas = ref(null)

// 参数
const centerX = 200, centerY = 200, trackSize = 160
const ballRadius = 16, joystickRadius = 40, knobRadius = 16

// 对象
let apple = null
let ghost = { angle: Math.PI, targetAngle: Math.PI }
let joystick = { centerX: 0, centerY: 0, knobX: 0, knobY: 0, isActive: false, isDragging: false }

// 难度与表现
let difficulty = { appleSpeed: 0.02, avoidDistance: 80, ghostSpeed: 0.03 }
let performance = { successRate: 0, consecutiveMisses: 0, totalAttempts: 0, successfulHits: 0 }

// 动画计时
let animationId = null
let gameTimer = null
let lastHitTime = 0

let ctx = null

// Endless 判定（包括特殊无尽）
const isEndless = computed(() => gameMode.value.startsWith('endless'))

const lessonProgress = computed(() => {
  if (isEndless.value) {
    return Math.min((gameLevel.value - 1) / 7, 1) * 100
  }
  if (!timeLimit.value) return 0
  return Math.min((gameTime.value / timeLimit.value) * 100, 100)
})

const getCurrentFruitName = () => {
  const fruitId = gameStore.currentFruit
  const fruit = gameStore.gameData.fruits.find(f => f.id === fruitId)
  return fruit?.name || '水果'
}
const getEncouragement = () => {
  const fruitName = getCurrentFruitName()
  const pool = ['太棒了！', `小幽灵吃到${fruitName}了！`, '继续加油！', '你真厉害！', '完美！', '超级棒！', '真是太好了！', '小幽灵很开心！']
  return pool[Math.floor(Math.random() * pool.length)]
}

const loadGameData = (levelId) => {
  const gameData = gameStore.gameData
  const lvl = gameData.levels.find(l => l.id === levelId) || gameData.levels[0]
  const outfit = gameData.outfits.find(o => o.id === gameData.currentOutfit) || gameData.outfits[0]
  currentLevel.value = lvl
  currentOutfitName.value = outfit.name

  // 当前装扮图
  const currentOutfitData = gameData.outfits.find(o => o.id === gameStore.currentOutfit)
  const img = new Image()
  img.src = currentOutfitData?.image ? imageMap[currentOutfitData.image] : ghostImg
  img.onload = () => { ghostImage.value = img }

  // 眩晕图
  const dizzyImg = new Image()
  dizzyImg.src = ghostDizzyImg
  dizzyImg.onload = () => { ghostDizzyImage.value = dizzyImg }
}

const initCanvas = () => {
  const canvasEl = gameCanvas.value
  if (!canvasEl) return
  const dpr = window.devicePixelRatio || 1
  canvasEl.width = 400 * dpr
  canvasEl.height = 400 * dpr
  ctx = canvasEl.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

// 根据等级调整难度
const adjustDifficultyByLevel = () => {
  const baseSpeed = 0.02, baseAvoidDistance = 80, baseGhostSpeed = 0.03
  const levelMultiplier = 1 + (gameLevel.value - 1) * 0.1
  difficulty.appleSpeed = Math.min(baseSpeed * levelMultiplier, 0.08)

  const shape = currentLevel.value?.shape || 'circle'
  const shapeFactor = shape === 'circle' ? 1.0 : shape === 'square' ? 1.15 : shape === 'triangle' ? 1.25 : 1.0

    // Increase avoidance more aggressively for high levels (≥6), so reversal happens further away
    const scaledAvoid = baseAvoidDistance * levelMultiplier * shapeFactor
    const highLevelBoost = gameLevel.value >= 6 ? (1 + (gameLevel.value - 5) * 0.25) : 1 // L6:1.25, L7:1.5, L8:1.75
    const cap = gameLevel.value >= 6 ? 260 : 180
    difficulty.avoidDistance = Math.min(scaledAvoid * highLevelBoost, cap)

    // Ghost max speed cap unchanged
    difficulty.ghostSpeed = Math.min(baseGhostSpeed * levelMultiplier, 0.1)

  const baseLifeTime = 8000
  const newLifeTime = Math.max(baseLifeTime - (gameLevel.value - 1) * 300, 3000)
  if (apple) apple.maxLifeTime = newLifeTime
  apples.value.forEach(a => { a.maxLifeTime = newLifeTime })
}

const handleLevelUp = () => {
  if (gameLevel.value < 8) {
    gameLevel.value += 1
    adjustDifficultyByLevel()
    showEncouragement.value = true
    encouragement.value = `等级提升！当前等级: ${gameLevel.value}`
    setTimeout(() => { showEncouragement.value = false }, 2000)

    if (currentLevelMode.value === 'multi-target') {
      let newMaxFakeApples = 1
      if (gameLevel.value >= 7) newMaxFakeApples = 3
      else if (gameLevel.value >= 4) newMaxFakeApples = 2
      if (newMaxFakeApples > maxFakeApples.value) {
        maxFakeApples.value = newMaxFakeApples
        while (currentFakeApples.value < maxFakeApples.value) spawnFakeApple()
      }
    }
  }
}
const handleLevelDown = () => {
  if (gameLevel.value > 1) {
    gameLevel.value -= 1
    adjustDifficultyByLevel()
    showEncouragement.value = true
    encouragement.value = `等级下降，难度降低！当前等级: ${gameLevel.value}`
    setTimeout(() => { showEncouragement.value = false }, 2000)

    if (currentLevelMode.value === 'multi-target') {
      const newMaxFakeApples = Math.min(Math.floor((gameLevel.value - 1) / 2) + 1, 3)
      if (newMaxFakeApples < maxFakeApples.value) {
        maxFakeApples.value = newMaxFakeApples
        const fakeApples = apples.value.filter(a => !a.isTarget)
        const excessCount = fakeApples.length - maxFakeApples.value
        if (excessCount > 0) {
          for (let i = 0; i < excessCount; i++) {
            const appleToRemove = fakeApples[i]
            apples.value = apples.value.filter(a => a.id !== appleToRemove.id)
          }
          currentFakeApples.value = maxFakeApples.value
        }
      }
    }
  }
}

const getPositionOnTrack = (angle) => {
  const shape = currentLevel.value.shape
  const PI2 = Math.PI * 2
  let normAngle = angle % PI2
  if (normAngle < 0) normAngle += PI2

  switch (shape) {
    case 'circle':
      return { x: centerX + Math.cos(normAngle) * trackSize, y: centerY + Math.sin(normAngle) * trackSize }
    case 'square': {
      const size = trackSize * 0.8
      const anglePerSide = PI2 / 4
      const side = Math.floor(normAngle / anglePerSide) % 4
      const t = (normAngle % anglePerSide) / anglePerSide

      // Traverse clockwise: right edge (top->bottom), bottom (right->left), left (bottom->top), top (left->right)
      switch (side) {
        case 0: // right edge
          return { x: centerX + size, y: centerY - size + t * (2 * size) }
        case 1: // bottom edge
          return { x: centerX + size - t * (2 * size), y: centerY + size }
        case 2: // left edge
          return { x: centerX - size, y: centerY + size - t * (2 * size) }
        default: // top edge
          return { x: centerX - size + t * (2 * size), y: centerY - size }
      }
    }
    case 'triangle': {
      const triSize = trackSize * 2.0
      const triHeight = (triSize * Math.sqrt(3)) / 2
      const V1 = { x: centerX, y: centerY - triHeight / 2 }
      const V2 = { x: centerX + triSize / 2, y: centerY + triHeight / 2 }
      const V3 = { x: centerX - triSize / 2, y: centerY + triHeight / 2 }
      const sideAngle = PI2 / 3
      let currentX, currentY
      if (normAngle >= 0 && normAngle < sideAngle) {
        const t = normAngle / sideAngle
        currentX = V1.x + t * (V2.x - V1.x)
        currentY = V1.y + t * (V2.y - V1.y)
      } else if (normAngle >= sideAngle && normAngle < 2 * sideAngle) {
        const t = (normAngle - sideAngle) / sideAngle
        currentX = V2.x + t * (V3.x - V2.x)
        currentY = V2.y + t * (V3.y - V2.y)
      } else {
        const t = (normAngle - 2 * sideAngle) / sideAngle
        currentX = V3.x + t * (V1.x - V3.x)
        currentY = V3.y + t * (V1.y - V3.y)
      }
      return { x: currentX, y: currentY }
    }
    default:
      return { x: centerX + Math.cos(normAngle) * trackSize, y: centerY + Math.sin(normAngle) * trackSize }
  }
}

const drawTrack = () => {
  const shape = currentLevel.value.shape
  ctx.strokeStyle = '#1cb0f6'
  ctx.lineWidth = 4
  ctx.beginPath()
  switch (shape) {
    case 'circle': ctx.arc(centerX, centerY, trackSize, 0, Math.PI * 2); break
    case 'square': {
      const size = trackSize * 0.8
      ctx.rect(centerX - size, centerY - size, size * 2, size * 2); break
    }
    case 'triangle': {
      const triSize = trackSize * 2.0
      const triHeight = (triSize * Math.sqrt(3)) / 2
      ctx.moveTo(centerX, centerY - triHeight / 2)
      ctx.lineTo(centerX + triSize / 2, centerY + triHeight / 2)
      ctx.lineTo(centerX - triSize / 2, centerY + triHeight / 2)
      ctx.closePath(); break
    }
    default: ctx.arc(centerX, centerY, trackSize, 0, Math.PI * 2); break
  }
  ctx.stroke()
}

const drawApple = (x, y, appleType = 'normal') => {
  let imageSrc = null
  let alpha = 1.0
  if (appleType === 'target') {
    imageSrc = fruitImages.value[gameStore.currentFruit] || null
  } else if (appleType === 'distractor') {
    imageSrc = badAppleImage.value || null
  } else if (typeof appleType === 'object' && appleType?.kind === 'interference') {
    imageSrc = appleType.fruitImage || null
    alpha = 0.5
  } else {
    imageSrc = fruitImages.value[gameStore.currentFruit] || null
  }

  if (imageSrc) {
    ctx.save()
    ctx.globalAlpha = alpha
    const imgSize = ballRadius * 3.0
    ctx.drawImage(imageSrc, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize)
    ctx.restore()
    return
  }
  ctx.beginPath(); ctx.arc(x, y, ballRadius - 2, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill()
}

const drawInterferenceObject = (x, y, obj) => drawApple(x, y, { kind: 'interference', fruitImage: obj.fruitImage })

const drawGhost = (x, y) => {
  const currentGhostImage = isDizzy.value ? ghostDizzyImage.value : ghostImage.value
  if (!currentGhostImage) return
  const imgSize = ballRadius * 4.5
  ctx.drawImage(currentGhostImage, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize)
}

const drawJoystick = () => {
  if (!joystick.isActive) return
  ctx.beginPath()
  ctx.arc(joystick.centerX, joystick.centerY, joystickRadius, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(28, 176, 246, 0.3)'
  ctx.fill()
  ctx.strokeStyle = '#1cb0f6'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(joystick.knobX, joystick.knobY, knobRadius, 0, Math.PI * 2)
  ctx.fillStyle = '#1cb0f6'
  ctx.fill()
}

const draw = () => {
  if (!ctx) {
    const canvasEl = gameCanvas.value
    if (!canvasEl) return
    ctx = canvasEl.getContext('2d')
    if (!ctx) return
  }

  ctx.clearRect(0, 0, 400, 400)
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, trackSize + 40)
  gradient.addColorStop(0, '#f0f9ff'); gradient.addColorStop(1, '#e0f2fe')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 400, 400)

  drawTrack()

  switch (currentLevelMode.value) {
    case 'timed':
    case 'endless':
      if (apple) { const pos = getPositionOnTrack(apple.angle); drawApple(pos.x, pos.y) }
      break
    case 'interference':
      if (apple) { const pos = getPositionOnTrack(apple.angle); drawApple(pos.x, pos.y) }
      interferenceObjects.value.forEach(obj => drawInterferenceObject(obj.x, obj.y, obj))
      break
    case 'multi-target':
      apples.value.forEach(a => { const pos = getPositionOnTrack(a.angle); drawApple(pos.x, pos.y, a.isTarget ? 'target' : 'distractor') })
      break
  }

  const ghostPos = getPositionOnTrack(ghost.angle)
  drawGhost(ghostPos.x, ghostPos.y)
  drawJoystick()
}

// 生成物体
const createSingleApple = () => {
  const PI2 = Math.PI * 2
  const maxLevelEffect = Math.min(gameLevel.value - 1, 7)
  let appleAngle, attempts = 0
  const maxAttempts = 20, minDistance = Math.PI / 3

  do {
    appleAngle = Math.random() * PI2
    const angleDiff = Math.abs(appleAngle - ghost.angle)
    const normalizedDiff = Math.min(angleDiff, PI2 - angleDiff)
    if (normalizedDiff >= minDistance) break
    attempts++
  } while (attempts < maxAttempts)

  if (attempts >= maxAttempts) appleAngle = (ghost.angle + Math.PI) % PI2

  return {
    angle: appleAngle,
    speed: difficulty.appleSpeed,
    direction: Math.random() > 0.5 ? 1 : -1,
    lastAvoidTime: 0,
    lifeTime: 0,
    maxLifeTime: 8000 - maxLevelEffect * 300,
    isEscaping: false,
    // 新增：抖动与自撞保护相关字段
    avoidLockUntil: 0,
    lastEscapeDirection: 0,
    avoidEngaged: false,
    lastDistance: Infinity,
    _originalSpeed: difficulty.appleSpeed,
  }
}

const createMultiApple = (isTarget = false, angle = null) => {
  const PI2 = Math.PI * 2
  const maxLevelEffect = Math.min(gameLevel.value - 1, 7)
  let appleAngle

  if (angle !== null) {
    appleAngle = angle
  } else {
    let attempts = 0
    const maxAttempts = 30
    const minDistanceFromGhost = Math.PI / 4
    const minDistanceFromApples = Math.PI / 6

    do {
      appleAngle = Math.random() * PI2
      let validPosition = true

      const ghostAngleDiff = Math.abs(appleAngle - ghost.angle)
      const normalizedGhostDiff = Math.min(ghostAngleDiff, PI2 - ghostAngleDiff)
      if (normalizedGhostDiff < minDistanceFromGhost) validPosition = false

      if (validPosition) {
        for (const existingApple of apples.value) {
          const appleAngleDiff = Math.abs(appleAngle - existingApple.angle)
          const normalizedAppleDiff = Math.min(appleAngleDiff, PI2 - appleAngleDiff)
          if (normalizedAppleDiff < minDistanceFromApples) { validPosition = false; break }
        }
      }
      if (validPosition) break
      attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      const existingAngles = [ghost.angle, ...apples.value.map(a => a.angle)]
      const sectors = 8
      const sectorSize = PI2 / sectors
      let bestSector = 0, minConflicts = Infinity
      for (let sector = 0; sector < sectors; sector++) {
        const sectorCenter = sector * sectorSize + sectorSize / 2
        let conflicts = 0
        for (const existingAngle of existingAngles) {
          const angleDiff = Math.abs(sectorCenter - existingAngle)
          const normalizedDiff = Math.min(angleDiff, PI2 - angleDiff)
          if (normalizedDiff < sectorSize) conflicts++
        }
        if (conflicts < minConflicts) { minConflicts = conflicts; bestSector = sector }
      }
      appleAngle = bestSector * sectorSize + sectorSize / 2 + (Math.random() - 0.5) * sectorSize * 0.5
    }
  }

  return {
    id: Date.now() + Math.random(),
    angle: appleAngle,
    speed: difficulty.appleSpeed * (isTarget ? 1 : 0.9),
    direction: Math.random() > 0.5 ? 1 : -1,
    lastAvoidTime: 0,
    lifeTime: 0,
    maxLifeTime: 8000 - maxLevelEffect * 300,
    isEscaping: false,
    isTarget,
    isDistractor: !isTarget,
    // 新增：抖动与自撞保护相关字段
    avoidLockUntil: 0,
    lastEscapeDirection: 0,
    avoidEngaged: false,
    lastDistance: Infinity,
    _originalSpeed: difficulty.appleSpeed * (isTarget ? 1 : 0.9),
  }
}

const createInterferenceObject = () => {
  const angle = Math.random() * Math.PI * 2
  const radius = trackSize * (0.7 + Math.random() * 0.6)
  const pos = { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }
  const speed = 0.5 + Math.random() * 1.5
  const targetRadius = Math.random() > 0.5 ? 0 : trackSize * 1.5
  const targetX = centerX + Math.cos(angle) * targetRadius
  const targetY = centerY + Math.sin(angle) * targetRadius
  const distance = Math.sqrt((targetX - pos.x) ** 2 + (targetY - pos.y) ** 2)

  const currentFruitType = gameStore.currentFruit
  const candidateTypes = Object.keys(fruitImageMap).filter((f) => f !== currentFruitType)
  const randomFruit = candidateTypes[Math.floor(Math.random() * candidateTypes.length)]

  let fruitImage = fruitImages.value[randomFruit]
  if (!fruitImage) {
    const img = new Image()
    img.src = fruitImageMap[randomFruit]
    fruitImage = img
  }
  return {
    id: Date.now() + Math.random(),
    x: pos.x, y: pos.y,
    type: 'misc',
    speed,
    directionX: distance > 0 ? (targetX - pos.x) / distance : 0,
    directionY: distance > 0 ? (targetY - pos.y) / distance : 0,
    lifeTime: 0,
    maxLifeTime: 5000 + Math.random() * 3000,
    isInterference: true,
    fruitImage
  }
}

const respawnSingleApple = () => { apple = createSingleApple() }
const spawnInterferenceObject = () => {
  if (!isPlaying.value) return
  const newObject = createInterferenceObject()
  interferenceObjects.value.push(newObject)
  const spawnInterval = Math.max(1500, 4000 - gameLevel.value * 200)
  interferenceSpawnTimer.value = setTimeout(() => spawnInterferenceObject(), spawnInterval)
}

const spawnFakeApple = () => {
  if (currentFakeApples.value >= maxFakeApples.value) return
  const newFakeApple = createMultiApple(false)
  apples.value.push(newFakeApple)
  currentFakeApples.value += 1
}
const ensureTargetAppleExists = () => {
  if (currentLevelMode.value !== 'multi-target') return
  const targetApples = apples.value.filter(a => a.isTarget)
  if (targetApples.length === 0) {
    const newTargetApple = createMultiApple(true)
    apples.value.push(newTargetApple)
    targetAppleId.value = newTargetApple.id
  }
}
const startFakeAppleSpawning = () => {
  if (currentLevelMode.value !== 'multi-target' || !isPlaying.value) return
  const spawnFakeAppleWithDelay = () => {
    if (!isPlaying.value || currentLevelMode.value !== 'multi-target') return
    if (currentFakeApples.value < maxFakeApples.value) spawnFakeApple()
    const nextSpawnDelay = 3000 + Math.random() * 3000
    fakeAppleSpawnTimer.value = setTimeout(spawnFakeAppleWithDelay, nextSpawnDelay)
  }
  fakeAppleSpawnTimer.value = setTimeout(spawnFakeAppleWithDelay, 2000)
}

// 碰撞检测
const checkCollisions = () => {
  const ghostPos = getPositionOnTrack(ghost.angle)
  const currentTime = Date.now()
  const PI2 = Math.PI * 2

  switch (currentLevelMode.value) {
    case 'timed':
    case 'endless':
      if (apple) {
        const applePos = getPositionOnTrack(apple.angle)
        const distance = Math.hypot(applePos.x - ghostPos.x, applePos.y - ghostPos.y)
        if (apple.lifeTime >= apple.maxLifeTime) handleAppleMiss()
        if (distance < ballRadius * 2.2) handleCollision()
        handleAppleAvoidance(apple, applePos, ghostPos, currentTime)
      }
      break
    case 'interference':
      if (apple) {
        const applePos = getPositionOnTrack(apple.angle)
        const distance = Math.hypot(applePos.x - ghostPos.x, applePos.y - ghostPos.y)
        if (apple.lifeTime >= apple.maxLifeTime) handleAppleMiss()
        if (distance < ballRadius * 2.2) handleCollision()
        handleAppleAvoidance(apple, applePos, ghostPos, currentTime)
      }
      interferenceObjects.value = interferenceObjects.value.filter(obj => {
        const distance = Math.hypot(obj.x - ghostPos.x, obj.y - ghostPos.y)
        if (distance < ballRadius * 1.8) {
          handleInterferenceCollision(obj.id)
          return false
        }
        return true
      })
      break
    case 'multi-target': {
      const applesToRemove = []
      let needNewTargetApple = false

      for (let i = 0; i < apples.value.length; i++) {
        const a = apples.value[i]
        const applePos = getPositionOnTrack(a.angle)
        const distance = Math.hypot(applePos.x - ghostPos.x, applePos.y - ghostPos.y)

        if (a.lifeTime >= a.maxLifeTime) {
          applesToRemove.push(a.id)
          if (a.isTarget) { handleMultiAppleMiss(a.id); needNewTargetApple = true }
          else { currentFakeApples.value = Math.max(0, currentFakeApples.value - 1) }
          continue
        }
        if (distance < ballRadius * 2.2) {
          applesToRemove.push(a.id)
          if (a.isTarget) { handleTargetAppleCollision(a.id); needNewTargetApple = true }
          else { handleDistractorAppleCollision(a.id) }
          continue
        }
        handleAppleAvoidance(a, applePos, ghostPos, currentTime)
      }

      if (applesToRemove.length > 0) {
        apples.value = apples.value.filter(a => !applesToRemove.includes(a.id))
      }
      if (needNewTargetApple) {
        const newTargetApple = createMultiApple(true)
        apples.value.push(newTargetApple)
        targetAppleId.value = newTargetApple.id
      }
      ensureTargetAppleExists()
      break
    }
  }
}

const handleAppleAvoidance = (appleObj, applePos, ghostPos, currentTime) => {
    const PI2 = Math.PI * 2

    // Approximate ghost angular speed to scale dynamic avoidance
    const ghostAngularDelta = Math.abs(ghost.angle - ghost.targetAngle)
    const ghostSpeed = Math.min(ghostAngularDelta * difficulty.ghostSpeed, 0.1)

    // Level-based scaling: higher level => earlier reversal (farther distance)
    const levelOver5 = Math.max(0, gameLevel.value - 5)
    const levelScale = 1 + levelOver5 * 0.25 // L6:1.25, L7:1.5, L8:1.75

    // Base distances with scaling and hysteresis
    const baseAvoidAdj = difficulty.avoidDistance * levelScale
    const criticalDistance = baseAvoidAdj * 0.7
    const engageDistance = baseAvoidAdj * 0.95 + 8 * levelOver5 // slight padding at high levels
    const releaseDistance = baseAvoidAdj * 1.3
    const movingAvoidDistance = baseAvoidAdj * (1 + ghostSpeed * 3)
    const avoidDistance = ghostSpeed > 0.01 ? movingAvoidDistance : baseAvoidAdj

    // Cooldown and anti-jitter direction lock window (slightly longer for L≥7)
    const coolDown = Math.max(300, 1000 - gameLevel.value * 50)
    const lockWindow = 260 + 20 * Math.max(0, gameLevel.value - 6) // L7+: +20ms per level

    // Hard separation threshold scales with level — more protective at high levels
    const hardSeparation = ballRadius * (2.6 + 0.35 * levelOver5)

    const distance = Math.hypot(applePos.x - ghostPos.x, applePos.y - ghostPos.y)
    const lastDistance = appleObj.lastDistance ?? Infinity
    const approaching = distance < lastDistance - 0.2 // approaching if shrinking (with small tolerance)

    // Compute tangential escape direction (consistent, avoids shape-dependent flips)
    const ghostAngle = Math.atan2(ghostPos.y - applePos.y, ghostPos.x - applePos.x)
    const appleTangentAngle = appleObj.angle + (appleObj.direction > 0 ? Math.PI / 2 : -Math.PI / 2)
    let normalizedDiff = ghostAngle - appleTangentAngle
    while (normalizedDiff > Math.PI) normalizedDiff -= PI2
    while (normalizedDiff < -Math.PI) normalizedDiff += PI2
    const escapeDirection = normalizedDiff > 0 ? -1 : 1

    const now = currentTime
    const lockActive = now < (appleObj.avoidLockUntil || 0)

    // 1) Hard separation: if dangerously close, force a tangential push immediately
    if (distance < hardSeparation) {
      const step = Math.max(appleObj.speed, difficulty.appleSpeed) * (2.2 * levelScale)
      appleObj.angle = (appleObj.angle + step * escapeDirection + PI2) % PI2
      appleObj.direction = escapeDirection
      appleObj.lastEscapeDirection = escapeDirection
      appleObj.lastAvoidTime = now
      appleObj.avoidLockUntil = now + lockWindow
      appleObj.avoidEngaged = true
      appleObj.isEscaping = true
    }

    // 2) While in lock window, keep last direction to prevent flips/jitter
    if (lockActive) {
      if (appleObj.lastEscapeDirection) {
        appleObj.direction = appleObj.lastEscapeDirection
      }
      appleObj.lastDistance = distance
      return
    }

    // 3) Hysteresis + predictive engage: engage earlier at high levels even before entering critical zone
    const engagePadding = 12 * levelOver5
    if (!appleObj.avoidEngaged) {
      const shouldEngage =
        distance < engageDistance ||
        distance < criticalDistance ||
        ((distance < avoidDistance && approaching) && (now - appleObj.lastAvoidTime > coolDown)) ||
        (approaching && distance < engageDistance + engagePadding) // predictive cushion for high levels

      if (shouldEngage) {
        appleObj.avoidEngaged = true
        appleObj.direction = escapeDirection
        appleObj.lastEscapeDirection = escapeDirection
        appleObj.lastAvoidTime = now
        appleObj.avoidLockUntil = now + lockWindow

        const originalSpeed = appleObj._originalSpeed || difficulty.appleSpeed
        const speedBoost = Math.min(1.9, 1.35 + ghostSpeed * 5) * (1 + 0.07 * levelOver5) // a bit stronger at high levels
        appleObj.speed = originalSpeed * speedBoost
        appleObj.isEscaping = true

        const escapeDuration = Math.max(300, 900 - gameLevel.value * 60)
        setTimeout(() => {
          if (!appleObj) return
          appleObj.speed = originalSpeed
          appleObj.isEscaping = false
        }, escapeDuration)
      }
    } else {
      // In avoidance: keep memory direction, release when safe
      appleObj.direction = appleObj.lastEscapeDirection || escapeDirection
      if (distance > releaseDistance && now > (appleObj.avoidLockUntil || 0)) {
        appleObj.avoidEngaged = false
      }
    }

    // Update distance memory
    appleObj.lastDistance = distance
  }

const handleCollision = () => {
  const currentTime = Date.now()
  performance.successfulHits++
  performance.totalAttempts++
  performance.consecutiveMisses = 0
  performance.successRate = performance.successfulHits / performance.totalAttempts

  consecutiveSuccesses.value += 1
  consecutiveFailures.value = 0

  const points = 10 * gameLevel.value
  const coins = Math.floor(points / 10)

  score.value += points
  coinsEarned.value += coins
  combo.value += 1
  successRate.value = Math.round(performance.successRate * 100)

  showEncouragement.value = true
  encouragement.value = getEncouragement()
  setTimeout(() => { showEncouragement.value = false }, 1000)

  if (consecutiveSuccesses.value >= 5) { consecutiveSuccesses.value = 0; handleLevelUp() }
  respawnSingleApple()
  lastHitTime = currentTime
}

const handleAppleMiss = () => {
  performance.totalAttempts++
  performance.consecutiveMisses++
  performance.successRate = performance.successfulHits / performance.totalAttempts

  consecutiveSuccesses.value = 0
  consecutiveFailures.value += 1

  missedApples.value += 1
  totalMisses.value += 1
  successRate.value = Math.round(performance.successRate * 100)
  combo.value = 0
  showMissText.value = true
  missText.value = `${getCurrentFruitName()}跑掉了！`
  setTimeout(() => { showMissText.value = false }, 1500)

  if (consecutiveFailures.value >= 3) { consecutiveFailures.value = 0; handleLevelDown() }
  respawnSingleApple()
}

const handleInterferenceCollision = (objectId) => {
  isDizzy.value = true
  difficulty.ghostSpeed *= 0.5
  ghost.targetAngle = ghost.angle

  if (dizzyTimer.value) clearTimeout(dizzyTimer.value)
  dizzyTimer.value = setTimeout(() => {
    isDizzy.value = false
    difficulty.ghostSpeed = difficulty.appleSpeed + 0.01
    dizzyTimer.value = null
  }, 2000)

  interferenceObjects.value = interferenceObjects.value.filter(obj => obj.id !== objectId)
}

const handleTargetAppleCollision = () => {
  const currentTime = Date.now()
  performance.successfulHits++
  performance.totalAttempts++
  performance.consecutiveMisses = 0
  performance.successRate = performance.successfulHits / performance.totalAttempts

  consecutiveSuccesses.value += 1
  consecutiveFailures.value = 0

  const points = 10 * gameLevel.value
  const coins = Math.floor(points / 10)

  score.value += points
  coinsEarned.value += coins
  combo.value += 1
  successRate.value = Math.round(performance.successRate * 100)

  if (consecutiveSuccesses.value >= 5) { consecutiveSuccesses.value = 0; handleLevelUp() }
  else {
    showEncouragement.value = true
    encouragement.value = getEncouragement()
  }
  lastHitTime = currentTime
}

const handleDistractorAppleCollision = () => {
  const penalty = 20
  score.value = Math.max(0, score.value - penalty)
  combo.value = 0
  consecutiveSuccesses.value = 0
  consecutiveFailures.value += 1

  showMissText.value = true
  missText.value = '吃到假苹果了！-20分'
  currentFakeApples.value = Math.max(0, currentFakeApples.value - 1)
  setTimeout(() => { showMissText.value = false }, 1500)

  if (consecutiveFailures.value >= 3) { consecutiveFailures.value = 0; handleLevelDown() }
}

const handleMultiAppleMiss = () => {
  performance.totalAttempts++
  performance.consecutiveMisses++
  performance.successRate = performance.successfulHits / performance.totalAttempts

  consecutiveSuccesses.value = 0
  consecutiveFailures.value += 1

  missedApples.value += 1
  totalMisses.value += 1
  successRate.value = Math.round(performance.successRate * 100)
  combo.value = 0
  showMissText.value = true
  missText.value = `真${getCurrentFruitName()}跑掉了！`
  setTimeout(() => { showMissText.value = false }, 1500)

  if (consecutiveFailures.value >= 3) { consecutiveFailures.value = 0; handleLevelDown() }
}

const updateGhostFromJoystick = () => {
  if (!joystick.isActive || isDizzy.value) return
  const deltaX = joystick.knobX - joystick.centerX
  const deltaY = joystick.knobY - joystick.centerY
  const distance = Math.hypot(deltaX, deltaY)
  if (distance > 5) {
    let inputAngle = Math.atan2(deltaY, deltaX)
    if (currentLevel.value.shape === 'triangle') {
      inputAngle = (inputAngle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)
    }
    ghost.targetAngle = inputAngle
  }
}

const gameLoop = () => {
  if (!isPlaying.value) return
  const PI2 = Math.PI * 2

  let diff = ghost.targetAngle - ghost.angle
  if (diff > Math.PI) diff -= Math.PI * 2
  if (diff < -Math.PI) diff += PI2
  ghost.angle = (ghost.angle + diff * difficulty.ghostSpeed + PI2) % PI2

  switch (currentLevelMode.value) {
    case 'timed':
    case 'endless':
      if (apple) { apple.angle = (apple.angle + apple.speed * apple.direction + PI2) % PI2; apple.lifeTime += 1000 / 60 }
      break
    case 'interference':
      if (apple) { apple.angle = (apple.angle + apple.speed * apple.direction + PI2) % PI2; apple.lifeTime += 1000 / 60 }
      interferenceObjects.value = interferenceObjects.value.map(obj => {
        return { ...obj, x: obj.x + obj.directionX * obj.speed, y: obj.y + obj.directionY * obj.speed, lifeTime: obj.lifeTime + 1000 / 60 }
      }).filter(obj => obj.lifeTime <= obj.maxLifeTime)
      break
    case 'multi-target':
      apples.value = apples.value.map(a => ({ ...a, angle: (a.angle + a.speed * a.direction + PI2) % PI2, lifeTime: a.lifeTime + 1000 / 60 }))
      break
  }

  checkCollisions()
  draw()
  animationId = requestAnimationFrame(gameLoop)
}

const getEventPosition = (e) => {
  const rect = gameCanvas.value.getBoundingClientRect()
  const scaleX = 400 / rect.width
  const scaleY = 400 / rect.height
  let clientX, clientY
  if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY }
  else { clientX = e.clientX; clientY = e.clientY }
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
}

const handleMouseDown = (e) => {
  if (!isPlaying.value) return
  const pos = getEventPosition(e)
  joystick = { centerX: pos.x, centerY: pos.y, knobX: pos.x, knobY: pos.y, isActive: true, isDragging: true }
  updateGhostFromJoystick()
}
const handleMouseMove = (e) => {
  if (!isPlaying.value || !joystick.isDragging || isDizzy.value) return
  const pos = getEventPosition(e)
  const deltaX = pos.x - joystick.centerX
  const deltaY = pos.y - joystick.centerY
  const distance = Math.hypot(deltaX, deltaY)
  let knobX = pos.x, knobY = pos.y
  if (distance > joystickRadius) {
    const angle = Math.atan2(deltaY, deltaX)
    knobX = joystick.centerX + Math.cos(angle) * joystickRadius
    knobY = joystick.centerY + Math.sin(angle) * joystickRadius
  }
  joystick.knobX = knobX; joystick.knobY = knobY
  updateGhostFromJoystick()
}
const handleMouseUp = () => { joystick.isActive = false; joystick.isDragging = false }
const handleTouchStart = (e) => { e.preventDefault(); handleMouseDown(e) }
const handleTouchMove = (e) => { e.preventDefault(); handleMouseMove(e) }
const handleTouchEnd = (e) => { e.preventDefault(); handleMouseUp() }

const startGame = () => {
  isPlaying.value = true
  score.value = 0
  coinsEarned.value = 0
  level.value = 1
  gameLevel.value = 1
  combo.value = 0
  missedApples.value = 0
  isDizzy.value = false
  interferenceObjects.value = []
  apples.value = []
  consecutiveSuccesses.value = 0
  consecutiveFailures.value = 0

  apple = null
  ghost = { angle: Math.PI, targetAngle: Math.PI }
  performance = { successRate: 0, consecutiveMisses: 0, totalAttempts: 0, successfulHits: 0 }
  difficulty = { appleSpeed: 0.02, avoidDistance: 80, ghostSpeed: 0.03 }

  switch (currentLevelMode.value) {
    case 'timed':
    case 'endless': respawnSingleApple(); break
    case 'interference': respawnSingleApple(); spawnInterferenceObject(); setTimeout(() => spawnInterferenceObject(), 2000); setTimeout(() => spawnInterferenceObject(), 4000); break
    case 'multi-target':
      maxFakeApples.value = 1
      currentFakeApples.value = 0
      const target = createMultiApple(true)
      apples.value = [target]
      targetAppleId.value = target.id
      spawnFakeApple()
      startFakeAppleSpawning()
      break
  }

  gameTime.value = 0
  displayTime.value = isEndless.value ? 0 : timeLimit.value

  gameLoop()
  gameTimer = setInterval(() => {
    gameTime.value++
    let newDisplayTime
    if (!isEndless.value) {
      newDisplayTime = timeLimit.value - gameTime.value
      if (newDisplayTime <= 0) { newDisplayTime = 0; endGame(true); return }
    } else newDisplayTime = gameTime.value
    const minutes = Math.floor(newDisplayTime / 60), seconds = newDisplayTime % 60
    displayTime.value = newDisplayTime
    gameTimeText.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
}

const togglePause = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    gameLoop()
    if (!gameTimer) {
      gameTimer = setInterval(() => {
        gameTime.value++
        let newDisplayTime
        if (!isEndless.value) {
          newDisplayTime = timeLimit.value - gameTime.value
          if (newDisplayTime <= 0) { newDisplayTime = 0; endGame(true); return }
        } else newDisplayTime = gameTime.value
        const minutes = Math.floor(newDisplayTime / 60), seconds = newDisplayTime % 60
        displayTime.value = newDisplayTime
        gameTimeText.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }, 1000)
    }
    if (currentLevelMode.value === 'interference' && !interferenceSpawnTimer.value) spawnInterferenceObject()
    if (currentLevelMode.value === 'multi-target' && !fakeAppleSpawnTimer.value) startFakeAppleSpawning()
  } else {
    if (animationId) cancelAnimationFrame(animationId)
    if (gameTimer) { clearInterval(gameTimer); gameTimer = null }
    if (interferenceSpawnTimer.value) { clearTimeout(interferenceSpawnTimer.value); interferenceSpawnTimer.value = null }
    if (fakeAppleSpawnTimer.value) { clearTimeout(fakeAppleSpawnTimer.value); fakeAppleSpawnTimer.value = null }
  }
}

const endGame = (timeUp = false) => {
  const finalGameTime = gameTime.value
  cleanup()

  const sessionData = {
    levelId: currentLevel.value.id,
    levelName: currentLevel.value.name,
    gameMode: gameMode.value,
    score: score.value,
    coinsEarned: coinsEarned.value,
    playTime: finalGameTime,
    applesCaught: performance.successfulHits || 0,
    missedApples: missedApples.value,
    interferenceHits: 0,
    maxCombo: combo.value,
    finalLevel: gameLevel.value,
    averageReactionTime: 0,
    accuracy: successRate.value,
    multiTargetCorrectRate: currentLevelMode.value === 'multi-target' ? successRate.value : 0,
  }

  if (coinsEarned.value > 0) {
    gameStore.addCoins(coinsEarned.value)
  }

  let TIMED_MODE_SCORE_THRESHOLD
  switch (currentLevel.value.id) {
    case 1: TIMED_MODE_SCORE_THRESHOLD = 500; break
    case 2:
    case 3: TIMED_MODE_SCORE_THRESHOLD = 500; break
    default: TIMED_MODE_SCORE_THRESHOLD = 500
  }

  if (score.value > 0 || finalGameTime > 10) {
    gameStore.recordTrainingSession(sessionData)
  }

  const gameData = gameStore.gameData
  let modalTitle = '游戏结束'
  let modalContent = `得分: ${score.value}\n获得金币: ${coinsEarned.value}\n最终等级: ${gameLevel.value}`

  // 保存成绩
  const levelIndex = gameData.levels.findIndex(l => l.id === currentLevel.value.id)
  if (levelIndex >= 0) {
    const currentLevelData = gameData.levels[levelIndex]
    if (!isEndless.value) {
      // 特殊限时：按轨道记录
      if (currentLevelMode.value === 'interference' || currentLevelMode.value === 'multi-target') {
        const shapeKey = (route.query.shape || currentLevel.value.shape || 'circle')
        if (!currentLevelData.bestScoresByShape) currentLevelData.bestScoresByShape = { circle: 0, square: 0, triangle: 0 }
        currentLevelData.bestScoresByShape[shapeKey] = Math.max(currentLevelData.bestScoresByShape[shapeKey] || 0, score.value)
        // 同步总体最高分，兼容其它展示
        currentLevelData.bestScore = Math.max(
          currentLevelData.bestScore || 0,
          currentLevelData.bestScoresByShape.circle || 0,
          currentLevelData.bestScoresByShape.square || 0,
          currentLevelData.bestScoresByShape.triangle || 0,
          score.value
        )
      } else {
        currentLevelData.bestScore = Math.max(currentLevelData.bestScore || 0, score.value)
      }

      // 过关/解锁逻辑仅针对基础限时（1-3）
      if ([1, 2, 3].includes(currentLevel.value.id)) {
        if (score.value >= TIMED_MODE_SCORE_THRESHOLD) {
          currentLevelData.completed = true
          modalTitle = '关卡完成！'
          modalContent += `\n恭喜你达到 ${TIMED_MODE_SCORE_THRESHOLD} 分！`
          const nextTimedLevelIndex = gameData.levels.findIndex(l => l.id === currentLevelData.id + 1 && l.mode === 'timed')
          if (nextTimedLevelIndex !== -1) {
            const nextLevel = gameData.levels[nextTimedLevelIndex]
            if (!nextLevel.unlocked) {
              nextLevel.unlocked = true
              modalContent += `\n下一关 "${nextLevel.name}" 已解锁！`
            }
          }
        } else {
          modalTitle = timeUp ? '时间到！' : '挑战失败！'
          modalContent += `\n未达到 ${TIMED_MODE_SCORE_THRESHOLD} 分，请再接再厉！`
        }
      }
    } else {
      modalTitle = '无尽模式结束'
      modalContent += `\n你的最高分是 ${currentLevelData.bestScore || score.value}。`
    }
    gameStore.saveGameData()
  }

  endModalData.value = {
    title: modalTitle,
    score: score.value,
    coins: coinsEarned.value,
    level: gameLevel.value,
    combo: combo.value,
    accuracy: successRate.value,
    message: modalContent.split('\n').slice(1).join('\n'),
    isComplete: modalTitle === '关卡完成！',
    timeUp: timeUp,
  }
  showEndModal.value = true
}

const cleanup = () => {
  if (animationId) { cancelAnimationFrame(animationId); animationId = null }
  if (gameTimer) { clearInterval(gameTimer); gameTimer = null }
  if (dizzyTimer.value) { clearTimeout(dizzyTimer.value); dizzyTimer.value = null }
  if (interferenceSpawnTimer.value) { clearTimeout(interferenceSpawnTimer.value); interferenceSpawnTimer.value = null }
  if (fakeAppleSpawnTimer.value) { clearTimeout(fakeAppleSpawnTimer.value); fakeAppleSpawnTimer.value = null }
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('mousemove', handleMouseMove)
}

const goBack = () => {
  if (isPlaying.value || score.value > 0) {
    const shouldSave = confirm('返回将结束本次游戏，是否结算并保存本局金币与成绩？')
    if (shouldSave) {
      endGame(false)
      return
    }
  }
  cleanup()
  router.back()
}

const closeEndModal = () => {
  showEndModal.value = false
  cleanup()
  router.back()
}

const retryGame = () => {
  showEndModal.value = false
  startGame()
}

const getShapeDescription = (shape) => {
  const descriptions = { circle: '圆形', square: '方形', triangle: '三角' }
  return descriptions[shape] || '未知图形'
}
const buildEndlessLevelName = (modeId, shapeId) => {
  const shapeText = getShapeDescription(shapeId)
  let modeText = '无尽·经典'
  if (typeof modeId === 'string') {
    if (modeId.includes('interference')) modeText = '无尽·干扰模式'
    else if (modeId.includes('multi')) modeText = '无尽·多目标追踪'
  }
  return `${modeText} (${shapeText})`
}

onMounted(() => {
  // 预加载图像
  Object.entries(imageMap).forEach(([filename, src]) => { const img = new Image(); img.src = src; img.onload = () => { ghostImages.value[filename] = img } })
  Object.entries(fruitImageMap).forEach(([fruitId, src]) => { const img = new Image(); img.src = src; img.onload = () => { fruitImages.value[fruitId] = img } })
  const badImg = new Image(); badImg.src = badAppleImg; badImg.onload = () => { badAppleImage.value = badImg }

  const levelId = parseInt(route.query.levelId) || 1
  autoStart.value = route.query.autoStart === 'true'
  gameMode.value = route.query.gameMode || 'timed'

  // 无尽子模式映射
  if (gameMode.value.startsWith('endless')) {
    if (route.query.shape) {
      const selectedShape = route.query.shape
      currentLevel.value = { ...currentLevel.value, shape: selectedShape, name: buildEndlessLevelName(gameMode.value, selectedShape) }
    }
    if (gameMode.value.includes('interference')) currentLevelMode.value = 'interference'
    else if (gameMode.value.includes('multi')) currentLevelMode.value = 'multi-target'
    else currentLevelMode.value = 'endless'
  } else {
    currentLevelMode.value = gameMode.value
  }

  loadGameData(levelId)

  // 特殊限时尊重形状
  const selectedShapeTimed = route.query.shape
  if (!isEndless.value && selectedShapeTimed && (gameMode.value === 'interference' || gameMode.value === 'multi-target')) {
    currentLevel.value = {
      ...currentLevel.value,
      shape: selectedShapeTimed,
      name: `${currentLevel.value.name} (${getShapeDescription(selectedShapeTimed)})`,
    }
  }

  const currentOutfitData = gameStore.gameData.outfits.find(o => o.id === gameStore.gameData.currentOutfit)
  if (currentOutfitData && ghostImages.value[currentOutfitData.image]) {
    ghostImage.value = ghostImages.value[currentOutfitData.image]
  } else if (ghostImages.value['ghost.png']) {
    ghostImage.value = ghostImages.value['ghost.png']
  }

  initCanvas()

  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('mousemove', handleMouseMove)

  if (!isEndless.value) {
    const initialTimeLimit = currentLevel.value.timeLimit || 60
    timeLimit.value = initialTimeLimit
    displayTime.value = initialTimeLimit
  } else {
    timeLimit.value = 0
    displayTime.value = 0
  }

  if (autoStart.value) setTimeout(() => { startGame() }, 1000)
})

onUnmounted(() => { cleanup() })
</script>

<style scoped>
.game-shell {
  display: flex; flex-direction: column; align-items: center;
  min-height: 100vh; background: #fff;
}

/* ===== Slim top bar ===== */
.g-top {
  position: sticky; top: 0; z-index: 30;
  width: 100%; background: #fff;
  border-bottom: 2px solid #e5e5e5;
}
.g-top-inner {
  width: 100%; max-width: 960px; margin: 0 auto;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px 10px;
}
.g-back {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid #e5e5e5; border-bottom: 4px solid #e5e5e5;
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: filter 0.1s, transform 0.08s, border-bottom-width 0.08s;
}
.g-back:hover { filter: brightness(1.04); }
.g-back:active { border-bottom-width: 2px; transform: translateY(2px); }
.g-back-icon { width: 22px; height: 22px; object-fit: contain; }

.g-progress {
  flex: 1; position: relative; height: 18px; border-radius: 999px;
  background: #e5e5e5; overflow: hidden;
}
.g-progress-fill {
  position: absolute; inset: 0 auto 0 0; border-radius: 999px;
  background: linear-gradient(90deg, #58cc02, #46a302);
  transition: width 0.4s ease;
}
.g-progress-label {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  font-size: 10px; font-weight: 800; color: #fff; mix-blend-mode: difference;
}
.g-indicator {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
  font-weight: 800; font-size: 15px; color: #3c3c3c;
  background: #f7f7f7; border: 2px solid #e5e5e5; border-bottom: 4px solid #e5e5e5;
  padding: 7px 14px; border-radius: 999px;
  min-width: 70px; justify-content: center;
}
.g-ind-icon { width: 18px; height: 18px; object-fit: contain; }
.g-ind-badge {
  font-size: 13px; font-weight: 800; color: #1cb0f6;
}

/* ===== Centered stage ===== */
.g-stage {
  width: 100%; max-width: 960px; margin: 0 auto;
  display: flex; justify-content: center;
  padding: 4px 20px 36px; box-sizing: border-box;
}
.g-stage-inner {
  width: 100%; max-width: 460px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}

.g-level-tag {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'Fredoka','Nunito',sans-serif; font-weight: 700; font-size: 15px;
  color: #3c3c3c;
}
.g-level-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #58cc02;
  box-shadow: 0 0 0 3px rgba(88,204,2,0.2);
}

/* ===== Canvas hero ===== */
.g-canvas-wrap {
  position: relative; padding: 12px; border-radius: 26px;
  background: #fff; border: 1px solid #ebebeb;
  box-shadow: 0 2px 0 #eee, 0 10px 30px rgba(0,0,0,0.07);
}
.g-canvas {
  display: block; width: 100%; aspect-ratio: 1 / 1; border-radius: 18px;
  cursor: crosshair; touch-action: none;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f5ff 100%);
  border: 2px solid #c8efa0;
}

.g-float {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 24px; font-weight: 800; pointer-events: none; z-index: 12;
  background: rgba(255,255,255,0.97); padding: 12px 22px; border-radius: 16px;
  border: 3px solid currentColor; text-align: center; white-space: nowrap;
  animation: pop 0.3s ease;
}
@keyframes pop { from { transform: translate(-50%,-50%) scale(0.7); opacity: 0 } to { transform: translate(-50%,-50%) scale(1); opacity: 1 } }
.g-float.success { color: #58cc02; }
.g-float.miss { color: #ff4b4b; font-size: 20px; }

/* Pre-game overlay */
.g-overlay {
  position: absolute; inset: 12px; border-radius: 18px; z-index: 11;
  background: rgba(240,249,255,0.82); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
}
.g-overlay-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.g-overlay-ghost { width: 64px; height: 64px; object-fit: contain; animation: bob 1.6s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
.g-overlay-title { font-family: 'Fredoka','Nunito',sans-serif; font-size: 20px; font-weight: 700; color: #3c3c3c; }
.g-overlay-sub { font-size: 13px; font-weight: 700; color: #777; margin-bottom: 8px; }
.g-start { padding: 12px 32px; font-size: 17px; }

.g-dizzy {
  position: absolute; inset: 12px; border-radius: 18px; z-index: 10;
  background: rgba(255,75,75,0.16);
  display: flex; align-items: center; justify-content: center; pointer-events: none;
}
.g-dizzy-badge {
  font-size: 20px; font-weight: 800; color: #ff4b4b;
  background: rgba(255,255,255,0.97); padding: 11px 20px; border-radius: 14px;
  border: 3px solid #ff4b4b; animation: shake 0.5s infinite;
}
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

/* ===== Stat strip ===== */
.g-stats { display: flex; gap: 10px; width: 100%; }
.g-stat {
  flex: 1; display: flex; align-items: center; gap: 6px;
  padding: 10px 12px; border-radius: 14px; background: #f7f7f7;
}
.g-stat img { width: 18px; height: 18px; object-fit: contain; flex-shrink: 0; }
.g-stat b { font-size: 17px; font-weight: 800; color: #3c3c3c; line-height: 1; }
.g-stat span { font-size: 11px; font-weight: 700; color: #999; margin-left: auto; }
.g-stat.s-score { background: #e9f7d6; }
.g-stat.s-score b { color: #58a700; }
.g-stat.s-combo { background: #fff3d6; }
.g-stat.s-combo b { color: #b07a00; }
.g-stat.s-miss { background: #ffe0e0; }
.g-stat.s-miss b { color: #ea2b2b; }
.g-stat.s-coin { background: #fff3d6; }
.g-stat.s-coin b { color: #b07a00; }

/* ===== Mode tip ===== */
.g-mode {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 11px 16px; border-radius: 14px; font-size: 13px; font-weight: 800; text-align: center;
}
.g-mode img { width: 22px; height: 22px; object-fit: contain; flex-shrink: 0; }
.g-mode.interference { background: #fff8d6; color: #6b5400; border: 1px solid #ffe07a; }
.g-mode.multi { background: #e9f7d6; color: #58a700; border: 1px solid #b5e879; }
.g-mode em { margin-left: auto; font-style: normal; font-size: 12px; opacity: 0.75; }

/* ===== Controls ===== */
.g-controls { display: flex; gap: 12px; width: 100%; }
.g-ctrl { flex: 1; padding: 14px; font-size: 16px; min-height: 50px; margin: 0; }
.g-ctrl.pause { background: #fff; border: 2px solid #e5e5e5; border-bottom: 4px solid #e5e5e5; color: #3c3c3c; }
.g-ctrl.pause:hover { background: #f7f7f7; }
.g-ctrl.finish { background: #ff4b4b; border-bottom-color: #ea2b2b; color: #fff; }
.g-ctrl.finish:hover { filter: brightness(1.05); }
.g-autostart {
  flex: 1; text-align: center; font-size: 16px; font-weight: 800; color: #58a700;
  padding: 16px; background: #e9f7d6; border-radius: 14px; border: 1px solid #b5e879;
}
.btn-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; }

/* ===== Footer meta ===== */
.g-foot {
  display: flex; align-items: center; gap: 10px; margin-top: 4px;
  font-size: 13px; font-weight: 700; color: #999;
}
.g-foot-ghost { width: 24px; height: 24px; object-fit: contain; }
.g-foot-name { color: #3c3c3c; font-weight: 800; }
.g-foot-sep { width: 4px; height: 4px; border-radius: 50%; background: #ddd; }
.g-foot-rate { color: #58a700; }
.g-foot-lv { color: #1cb0f6; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .g-stat { padding: 8px 10px; }
  .g-stat b { font-size: 15px; }
  .g-stat span { display: none; }
  .g-float { font-size: 18px; padding: 10px 16px; }
}

/* ===== End-game modal ===== */
.end-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.end-card {
  width: 100%; max-width: 380px;
  background: #fff; border-radius: 24px;
  border: 2px solid #e5e5e5; border-bottom: 6px solid #e5e5e5;
  padding: 28px 24px 24px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.end-card--win { border-color: #58cc02; border-bottom-color: #58a700; }
.end-icon { width: 56px; height: 56px; object-fit: contain; margin-bottom: 4px; }
.end-title {
  font-family: 'Fredoka','Nunito',sans-serif; font-size: 24px; font-weight: 700;
  color: #3c3c3c; margin: 0;
}
.end-card--win .end-title { color: #58a700; }
.end-message {
  font-size: 13px; font-weight: 700; color: #777; line-height: 1.6;
  margin: 4px 0 12px; white-space: pre-line;
}
.end-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  width: 100%; margin-bottom: 20px;
}
.end-stat {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 4px; border-radius: 14px; background: #f7f7f7;
}
.end-stat img { width: 22px; height: 22px; object-fit: contain; }
.end-stat b { font-size: 18px; font-weight: 800; color: #3c3c3c; line-height: 1.1; }
.end-stat span { font-size: 11px; font-weight: 700; color: #999; }
.end-actions { display: flex; gap: 12px; width: 100%; }
.end-btn { flex: 1; padding: 14px; font-size: 16px; min-height: 50px; margin: 0; }
.end-btn--back { background: #fff; border: 2px solid #e5e5e5; border-bottom: 4px solid #e5e5e5; color: #777; }
.end-btn--back:hover { background: #f7f7f7; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-active .end-card, .modal-leave-active .end-card { transition: transform 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .end-card, .modal-leave-to .end-card { transform: scale(0.85); }
</style>
