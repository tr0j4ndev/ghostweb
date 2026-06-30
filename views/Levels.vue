<template>
  <div class="page-wrapper">
    <div class="container levels">
      <!-- ===== Progress banner ===== -->
      <section class="progress-banner">
        <div class="progress-banner-text">
          <h2 class="duo-section-title">
            <img class="section-icon" :src="progressIcon" alt="进度" />
            解锁进度
          </h2>
          <p class="progress-line">
            已完成限时关卡 <strong>{{ completedTimedLevels }}</strong> / 3
          </p>
          <p v-if="!allTimedLevelsCompleted" class="progress-tip">完成所有基础关卡解锁特殊挑战与无尽模式</p>
          <p v-else class="progress-done">
            <img class="inline-icon" :src="congratulationIcon" alt="恭喜" />
            全部解锁，去挑战吧！
          </p>
        </div>
        <!-- progress ring -->
        <div class="banner-ring">
          <svg viewBox="0 0 100 100" class="banner-ring-svg">
            <circle class="br-track" cx="50" cy="50" r="42" />
            <circle class="br-progress" cx="50" cy="50" r="42"
              :stroke-dasharray="brCirc" :stroke-dashoffset="brOffset" />
          </svg>
          <span class="banner-ring-num">{{ Math.round((completedTimedLevels / 3) * 100) }}%</span>
        </div>
      </section>

      <!-- ===== Winding skill path ===== -->
      <section class="path" :style="{ '--rows': pathNodes.length }">
        <!-- Smooth serpentine road -->
        <svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path class="road-base" :d="roadD" vector-effect="non-scaling-stroke" />
          <path class="road-line" :d="roadD" vector-effect="non-scaling-stroke" />
        </svg>

        <div
          v-for="(node, idx) in pathNodes"
          :key="node.id"
          class="path-node"
          :class="{
            'is-locked': !node.unlocked,
            'is-current': node.current,
            'is-done': node.completed,
            'side-left': nodeSide(idx) === 'left',
            'side-right': nodeSide(idx) === 'right',
          }"
          :style="{ left: nodeX(idx) + '%', top: nodeTop(idx) + '%' }"
        >
          <button
            class="node-bubble"
            :disabled="!node.unlocked"
            @click="onNodeClick(node)"
            :aria-label="node.label"
          >
            <img class="node-img" :src="node.image" alt="" />
            <span v-if="!node.unlocked" class="node-lock">
              <img :src="lockIcon" alt="锁定" />
            </span>
            <img v-else-if="node.completed" class="node-crown" :src="trophyIcon" alt="已通关" />
            <span v-else-if="node.current" class="node-star">★</span>
          </button>
          <div class="node-meta">
            <div class="node-title">{{ node.label }}</div>
            <div class="node-sub">{{ node.sub }}</div>
            <div v-if="node.bestScore > 0" class="node-score">
              <img class="inline-icon" :src="trophyIcon" alt="" /> 最高 {{ node.bestScore }}
            </div>
          </div>

          <!-- Special level shape selector popover -->
          <div v-if="node.kind === 'special' && node.unlocked" class="node-shapes">
            <button
              v-for="s in shapes"
              :key="s.id"
              class="shape-chip"
              @click.stop="startSpecialTimed(node.raw, s.id)"
              :title="`使用${s.name}开始`"
            >
              <img :src="s.image" :alt="s.name" />
              <span>{{ s.name }}</span>
              <small>{{ node.raw.bestScoresByShape?.[s.id] || 0 }}</small>
            </button>
          </div>
        </div>
      </section>

      <!-- ===== Endless mode card ===== -->
      <section class="endless-card" :class="{ 'is-locked': !endlessUnlocked }">
        <div class="endless-left">
          <img class="endless-img" :src="infiniteImg" alt="无尽模式" />
          <div>
            <div class="endless-title">无尽模式</div>
            <div class="endless-desc">经典 / 干扰 / 多目标，无限挑战</div>
          </div>
        </div>
        <button
          class="btn btn-green endless-btn"
          :disabled="!endlessUnlocked"
          @click="goEndlessSetup"
        >
          {{ endlessUnlocked ? '进入设置' : '🔒 未解锁' }}
        </button>
      </section>

      <!-- ===== Help ===== -->
      <section class="help">
        <h2 class="duo-section-title">
          <img class="section-icon" :src="hintIcon" alt="提示" />
          游戏提示
        </h2>
        <ul class="help-list">
          <li>限时模式达到 <strong>500分</strong> 即可解锁下一关</li>
          <li>完成所有基础关卡解锁特殊挑战与无尽模式</li>
          <li>特殊挑战可选择轨道并记录分轨道最高分</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

import circleImg from '../assets/circle.svg'
import squareImg from '../assets/square.svg'
import triangleImg from '../assets/triangle.svg'
import interferenceImg from '../assets/interference.svg'
import multipleImg from '../assets/multiple.svg'
import infiniteImg from '../assets/infinite.svg'

import progressIcon from '../assets/progress.svg'
import trophyIcon from '../assets/trophy.svg'
import hintIcon from '../assets/hint.svg'
import congratulationIcon from '../assets/congratulation.svg'
import lockIcon from '../assets/lock.svg'

const router = useRouter()
const gameStore = useGameStore()
const levels = ref([])
const isRefreshing = ref(false)

const shapes = [
  { id: 'circle', name: '圆形', image: circleImg },
  { id: 'square', name: '方形', image: squareImg },
  { id: 'triangle', name: '三角', image: triangleImg },
]

const getShapeDescription = (shape, mode) => {
  if (mode === 'interference') return '干扰中保持专注'
  if (mode === 'multi-target') return '追踪多个目标'
  return { circle: '经典圆形轨道', square: '方形轨道', triangle: '三角轨道' }[shape] || '经典轨道'
}

const basicLevels = computed(() => levels.value.filter((l) => l.mode === 'timed' && l.id <= 3))
const specialTimedLevels = computed(() =>
  levels.value.filter((l) => ['interference', 'multi-target'].includes(l.mode) && l.id !== 99),
)
const endlessUnlocked = computed(() => {
  const endless = levels.value.find((l) => l.id === 99 || l.mode === 'endless')
  return endless?.unlocked
})

const completedTimedLevels = computed(() => {
  const TH = 500
  return basicLevels.value.filter((l) => l.completed && l.bestScore >= TH).length
})
const allTimedLevelsCompleted = computed(() => completedTimedLevels.value === 3)

// Build the winding path nodes: basic → special → endless placeholder
const pathNodes = computed(() => {
  const nodes = []
  const firstLockedNotDone = levels.value.find((l) => !l.completed && l.unlocked && l.mode === 'timed')
  basicLevels.value.forEach((l) => {
    nodes.push({
      id: `b-${l.id}`,
      kind: 'basic',
      raw: l,
      label: l.name,
      sub: getShapeDescription(l.shape, l.mode),
      image: { circle: circleImg, square: squareImg, triangle: triangleImg }[l.shape] || circleImg,
      unlocked: l.unlocked,
      completed: l.completed,
      current: l.unlocked && !l.completed && l === firstLockedNotDone,
      bestScore: l.bestScore || 0,
    })
  })
  specialTimedLevels.value.forEach((l) => {
    nodes.push({
      id: `s-${l.id}`,
      kind: 'special',
      raw: l,
      label: l.name,
      sub: getShapeDescription(l.shape, l.mode),
      image: l.mode === 'interference' ? interferenceImg : multipleImg,
      unlocked: l.unlocked,
      completed: false,
      current: false,
      bestScore: l.bestScore || 0,
    })
  })
  return nodes
})

// Winding serpentine road geometry (percent coords, x in 0-100, y in 0-100)
const SWAY = 26 // horizontal sway from center
const nodeX = (idx) => {
  const pattern = [0, 1, -1, 1, -1, 1, -1] // serpentine: center, right, left, right...
  return 50 + (pattern[idx % pattern.length] || 0) * SWAY
}
const nodeTop = (idx) => {
  const n = pathNodes.value.length
  return ((idx + 0.5) / n) * 100
}
const nodeSide = (idx) => {
  const x = nodeX(idx)
  if (x > 55) return 'right'
  if (x < 45) return 'left'
  return 'center'
}

// Smooth cubic-bezier path through all node centers
const roadD = computed(() => {
  const nodes = pathNodes.value
  const n = nodes.length
  if (n === 0) return ''
  const pts = nodes.map((_, i) => ({ x: nodeX(i), y: nodeTop(i) }))
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const midY = (prev.y + cur.y) / 2
    d += ` C ${prev.x.toFixed(2)} ${midY.toFixed(2)}, ${cur.x.toFixed(2)} ${midY.toFixed(2)}, ${cur.x.toFixed(2)} ${cur.y.toFixed(2)}`
  }
  return d
})

const brCirc = 2 * Math.PI * 42
const brOffset = computed(() => brCirc * (1 - completedTimedLevels.value / 3))

const loadLevelsData = () => {
  const gameData = gameStore.gameData
  gameData.levels.forEach((l) => {
    if (['interference', 'multi-target'].includes(l.mode) && !l.bestScoresByShape) {
      l.bestScoresByShape = { circle: 0, square: 0, triangle: 0 }
    }
  })
  levels.value = gameData.levels.map((l) => ({ ...l }))
}

const onNodeClick = (node) => {
  if (!node.unlocked) return
  if (node.kind === 'special') return // shape chips handle it
  router.push(`/game?levelId=${node.raw.id}&gameMode=${node.raw.mode}`)
}

const startSpecialTimed = (level, shapeId) => {
  if (!level?.unlocked) return
  router.push(`/game?levelId=${level.id}&gameMode=${level.mode}&shape=${shapeId}`)
}

const goEndlessSetup = () => router.push('/endless-setup')

onMounted(() => {
  gameStore.loadGameData()
  loadLevelsData()
})
</script>

<style scoped>
.levels { display: flex; flex-direction: column; gap: 22px; }

.section-icon { width: 24px; height: 24px; object-fit: contain; }
.inline-icon { width: 16px; height: 16px; object-fit: contain; vertical-align: -2px; }

/* ===== Progress banner ===== */
.progress-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: var(--duo-green); color: #fff;
  border-radius: 22px; border-bottom: 6px solid var(--duo-green-shadow);
  padding: 22px 24px;
}
.progress-banner .duo-section-title { color: #fff; }
.progress-line { font-size: 16px; font-weight: 700; margin-top: 8px; }
.progress-line strong { font-size: 20px; }
.progress-tip { font-size: 13px; color: #eafbe0; margin-top: 4px; font-weight: 600; }
.progress-done { font-size: 14px; color: #ffe066; font-weight: 800; margin-top: 4px; display: inline-flex; align-items: center; gap: 6px; }

.banner-ring { position: relative; width: 84px; height: 84px; flex-shrink: 0; }
.banner-ring-svg { width: 84px; height: 84px; transform: rotate(-90deg); }
.br-track { fill: none; stroke: rgba(255,255,255,0.3); stroke-width: 9; }
.br-progress { fill: none; stroke: #fff; stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
.banner-ring-num {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-family: 'Fredoka','Nunito',sans-serif; font-size: 20px; font-weight: 700;
}

/* ===== Winding skill path ===== */
.path {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 8px auto 0;
  /* height driven by row count; each row ~150px */
  height: calc(var(--rows, 5) * 150px);
  min-height: 420px;
}

/* Smooth serpentine road drawn as SVG, stretches to fill */
.road {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  z-index: 0;
}
.road-base {
  fill: none; stroke: #e5e5e5; stroke-width: 22; stroke-linecap: round;
}
.road-line {
  fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 2 10;
}

.path-node {
  position: absolute; z-index: 1;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  width: 150px;
}

.node-bubble {
  position: relative; flex-shrink: 0;
  width: 82px; height: 82px; border-radius: 50%;
  border: 4px solid var(--duo-border);
  border-bottom: 6px solid var(--duo-border);
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: filter 0.1s, transform 0.08s, border-color 0.15s;
}
.node-bubble:hover { filter: brightness(1.04); }
.node-bubble:active { transform: translateY(2px); }
.node-bubble:disabled { cursor: not-allowed; }
.node-img { width: 54px; height: 54px; object-fit: contain; }

.path-node.is-current .node-bubble {
  border-color: var(--duo-green);
  border-bottom-color: var(--duo-green-shadow);
  background: #e9f7d6;
  animation: bob 1.6s ease-in-out infinite;
}
@keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

.path-node.is-done .node-bubble {
  border-color: #ffe066; border-bottom-color: var(--duo-yellow-shadow); background: #fff5cc;
}

.path-node.is-locked .node-bubble { opacity: 0.65; background: var(--duo-card); }
.node-lock { position: absolute; display: flex; align-items: center; justify-content: center; }
.node-lock img { width: 26px; height: 26px; object-fit: contain; }
.node-crown { position: absolute; top: -10px; right: -6px; width: 28px; height: 28px; object-fit: contain; }
.node-star {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--duo-yellow); color: #fff; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--duo-yellow-shadow);
}

.node-meta { text-align: center; margin-top: 10px; }
.node-title { font-weight: 800; font-size: 15px; color: var(--duo-ink); }
.node-sub { font-size: 12px; color: var(--duo-muted); font-weight: 600; }
.node-score { font-size: 12px; color: var(--duo-yellow-shadow); font-weight: 800; margin-top: 2px; display: inline-flex; align-items: center; gap: 4px; }

/* Special shape popover */
.node-shapes { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
.shape-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 10px; border-radius: 999px;
  border: 2px solid var(--duo-yellow-shadow); background: #fff8d6;
  color: #6b5400; font-weight: 800; font-size: 12px; cursor: pointer;
  transition: filter 0.1s, transform 0.08s;
}
.shape-chip:hover { filter: brightness(1.04); }
.shape-chip:active { transform: translateY(1px); }
.shape-chip img { width: 18px; height: 18px; object-fit: contain; }
.shape-chip small { font-size: 10px; opacity: 0.8; }

@media (max-width: 480px) {
  .path { max-width: 320px; height: calc(var(--rows, 5) * 138px); }
  .node-bubble { width: 70px; height: 70px; }
  .node-img { width: 46px; height: 46px; }
  .path-node { width: 130px; }
}

/* ===== Endless card ===== */
.endless-card {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  background: linear-gradient(135deg, #e8f7ff 0%, #d6f0ff 100%);
  border: 2px solid #9adcff; border-bottom: 5px solid var(--duo-blue-shadow);
  border-radius: 22px; padding: 18px 20px;
}
.endless-card.is-locked { opacity: 0.6; background: var(--duo-card); border-color: var(--duo-border); border-bottom-color: var(--duo-border); }
.endless-left { display: flex; align-items: center; gap: 14px; }
.endless-img { width: 54px; height: 54px; object-fit: contain; }
.endless-title { font-family: 'Fredoka','Nunito',sans-serif; font-size: 18px; font-weight: 700; color: var(--duo-ink); }
.endless-desc { font-size: 13px; color: var(--duo-muted); font-weight: 600; }
.endless-btn { margin: 0; font-size: 14px; padding: 12px 18px; }
.endless-btn:disabled { background: #e5e5e5; border-bottom-color: #c8c8c8; color: #afafaf; }

/* ===== Help ===== */
.help {
  background: var(--duo-card); border: 2px solid var(--duo-border); border-radius: 20px;
  padding: 20px; box-shadow: 0 4px 0 var(--duo-border);
}
.help-list { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; list-style: none; }
.help-list li { font-size: 14px; font-weight: 600; color: var(--duo-ink); padding-left: 18px; position: relative; }
.help-list li::before { content: '•'; position: absolute; left: 4px; color: var(--duo-green); font-weight: 800; }
.help-list strong { color: var(--duo-red); }
</style>
