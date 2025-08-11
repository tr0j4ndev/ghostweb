<template>
  <div class="page-wrapper">
    <div class="custom-header">
      <div class="header-left">
        <button class="btn btn-outline custom-back-button" @click="goHome">
          <img class="btn-icon" :src="backIcon" alt="返回主页" />
          <span>返回主页</span>
        </button>
      </div>
      <div class="header-center">
        <div class="header-title"><span>关卡选择</span></div>
      </div>
      <div class="header-right">
        <div class="header-actions">
          <button class="btn btn-outline refresh-btn" @click="refreshLevels" :disabled="isRefreshing">
            <img class="btn-icon" :src="refreshIcon" alt="刷新" />
            <span>{{ isRefreshing ? '刷新中...' : '刷新' }}</span>
          </button>
        </div>
        <div class="header-coins">
          <img class="coin-icon" :src="glodIcon" alt="金币" />
          <span>{{ totalCoins }}</span>
        </div>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="container">
        <div class="progress-card">
          <div class="progress-title title-with-icon">
            <img class="title-icon-img" :src="progressIcon" alt="解锁进度" />
            <span>解锁进度</span>
          </div>
          <div class="progress-info">
            <div>
              已完成限时关卡:
              <strong>{{ completedTimedLevels }}</strong>/3
            </div>
            <div v-if="!allTimedLevelsCompleted" class="progress-tip">
              完成所有限时基础关卡可解锁特殊挑战与无尽模式！
            </div>
            <div v-else class="progress-complete">
              <img class="celebrate-icon" :src="congratulationIcon" alt="恭喜" />
              <span>恭喜！所有特殊挑战与无尽模式已解锁！</span>
            </div>
          </div>
        </div>

        <!-- 基础关卡（限时） -->
        <div class="level-section">
          <h3 class="section-title">
            <img class="title-icon-img" :src="basicIcon" alt="基础关卡" />
            <span>基础关卡（限时）</span>
          </h3>
          <div class="levels-grid">
            <div
              v-for="level in basicLevels"
              :key="level.id"
              :class="['level-card', level.unlocked ? 'unlocked' : 'locked']"
              @click="selectLevel(level.id)"
            >
              <div v-if="level.completed" class="completed-badge">
                <img class="completed-img" :src="trophyIcon" alt="已通关" />
              </div>
              <div v-if="!level.unlocked" class="lock-overlay">
                <span>🔒</span>
              </div>

              <div class="level-media">
                <img
                  v-if="level.image"
                  :src="level.image"
                  :alt="level.name + ' 配图'"
                  class="level-illustration"
                />
                <div v-else class="level-icon">{{ level.icon }}</div>
              </div>
              <div class="level-name">{{ level.name }}</div>
              <div class="level-desc">{{ level.description }}</div>

              <div v-if="level.bestScore > 0" class="best-score">
                <img class="inline-icon" :src="trophyIcon" alt="最高分" />
                <span>最高分: {{ level.bestScore }}</span>
              </div>

              <button
                v-if="level.unlocked"
                class="btn level-btn"
                @click.stop="selectLevel(level.id)"
              >
                {{ level.completed ? '重新挑战' : '开始挑战' }}
              </button>
              <button v-else class="btn level-btn btn-disabled" disabled>
                🔒 未解锁
              </button>
            </div>
          </div>
        </div>

        <!-- 特殊挑战（限时） -->
        <div class="level-section">
          <h3 class="section-title">
            <img class="title-icon-img" :src="specialIcon" alt="特殊挑战" />
            <span>特殊挑战（限时）</span>
          </h3>
          <div class="levels-grid">
            <div
              v-for="level in specialTimedLevels"
              :key="level.id"
              :class="['level-card', 'special-card', level.unlocked ? 'unlocked' : 'locked']"
            >
              <div v-if="!level.unlocked" class="lock-overlay">
                <span>🔒</span>
              </div>

              <div class="level-media">
                <img
                  v-if="level.image"
                  :src="level.image"
                  :alt="level.name + ' 配图'"
                  class="level-illustration"
                />
                <div v-else class="level-icon">{{ level.icon }}</div>
              </div>
              <div class="level-name">{{ level.name }}</div>
              <div class="level-desc">{{ getShapeDescription(level.shape, level.mode) }}</div>

              <!-- 每条轨道的最高分展示 + 启动按钮 -->
              <div class="shape-select">
                <div class="shape-grid">
                  <div
                    v-for="s in shapes"
                    :key="s.id"
                    class="shape-cell"
                  >
                    <button
                      class="shape-btn"
                      :disabled="!level.unlocked"
                      @click="startSpecialTimed(level, s.id)"
                      :title="`使用 ${s.name} 轨道开始`"
                    >
                      <img :src="s.image" :alt="s.name" class="shape-icon" />
                      <span class="shape-name">{{ s.name }}</span>
                    </button>
                    <div class="shape-score">
                      <img class="inline-icon" :src="trophyIcon" alt="最高分" />
                      <span>
                        最高分：
                        {{
                          (level.bestScoresByShape && level.bestScoresByShape[s.id]) 
                            ? level.bestScoresByShape[s.id] 
                            : 0
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无尽模式 -->
        <div class="level-section">
          <h3 class="section-title">
            <img class="title-icon-img" :src="infiniteImg" alt="无尽模式" />
            <span>无尽模式</span>
          </h3>
          <div class="levels-grid">
            <div
              :class="['level-card', 'special-card', endlessUnlocked ? 'unlocked' : 'locked']"
              @click="endlessUnlocked && goEndlessSetup()"
            >
              <div v-if="!endlessUnlocked" class="lock-overlay">
                <span>🔒</span>
              </div>
              <div class="level-media">
                <img :src="infiniteImg" alt="无尽模式" class="level-illustration" />
              </div>
              <div class="level-name">无尽模式</div>
              <div class="level-desc">经典无尽 / 干扰无尽 / 多目标无尽</div>
              <button
                :class="['btn', 'level-btn', endlessUnlocked ? 'btn-green' : 'btn-disabled']"
                :disabled="!endlessUnlocked"
                @click.stop="goEndlessSetup"
              >
                {{ endlessUnlocked ? '进入无尽设置' : '🔒 完成基础关卡解锁' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 帮助 -->
        <div class="help-card">
          <div class="help-title title-with-icon">
            <img class="title-icon-img" :src="hintIcon" alt="游戏提示" />
            <span>游戏提示</span>
          </div>
          <div class="help-content">
            <div>• 在限时模式中达到 <strong>500分</strong> 即可解锁下一关卡</div>
            <div>• 完成所有基础关卡可解锁特殊挑战与无尽模式</div>
            <div>• 特殊挑战（限时）支持选择轨道并记录分轨道最高分</div>
            <div>• 点击右上角刷新按钮可更新解锁状态</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

import circleImg from '../assets/circle.png'
import squareImg from '../assets/square.png'
import triangleImg from '../assets/triangle.png'
import interferenceImg from '../assets/interference.png'
import multipleImg from '../assets/multiple.png'
import infiniteImg from '../assets/infinite.png'

import backIcon from '../assets/back.png'
import refreshIcon from '../assets/refresh.png'
import basicIcon from '../assets/basic.png'
import specialIcon from '../assets/special.png'
import progressIcon from '../assets/progress.png'
import trophyIcon from '../assets/trophy.png'
import hintIcon from '../assets/hint.png'
import glodIcon from '../assets/glod.png'
import congratulationIcon from '../assets/congratulation.png'

const router = useRouter()
const gameStore = useGameStore()

const totalCoins = ref(0)
const levels = ref([])
const isRefreshing = ref(false)

const shapes = [
  { id: 'circle', name: '圆形', image: circleImg },
  { id: 'square', name: '方形', image: squareImg },
  { id: 'triangle', name: '三角', image: triangleImg }
]

// 分组
const basicLevels = computed(() => levels.value.filter(l => l.mode === 'timed' && l.id <= 3))
const specialTimedLevels = computed(() => levels.value.filter(l => ['interference', 'multi-target'].includes(l.mode) && l.id !== 99))
const endlessUnlocked = computed(() => {
  const endless = levels.value.find(l => l.id === 99 || l.mode === 'endless')
  return endless?.unlocked
})

const completedTimedLevels = computed(() => {
  const TIMED_MODE_SCORE_THRESHOLD = 500
  return basicLevels.value.filter(l => l.completed && l.bestScore >= TIMED_MODE_SCORE_THRESHOLD).length
})
const allTimedLevelsCompleted = computed(() => completedTimedLevels.value === 3)

const getShapeIcon = (shape, mode) => {
  if (mode === 'endless') return '♾️'
  if (mode === 'interference') return '✨'
  if (mode === 'multi-target') return '🎯'
  const icons = { circle: '⭕', square: '⬜', triangle: '🔺' }
  return icons[shape] || '⭕'
}

const getShapeDescription = (shape, mode) => {
  if (mode === 'interference') return '在干扰中保持专注，考验抗干扰能力'
  if (mode === 'multi-target') return '同时追踪多个目标，提升注意力分配'
  const descriptions = {
    circle: '经典圆形轨道，适合新手',
    square: '方形轨道，考验转弯技巧',
    triangle: '三角轨道，挑战急转弯'
  }
  return descriptions[shape] || '经典轨道'
}

const getSpecialLevelImage = (level) => {
  if (level.mode === 'interference') return interferenceImg
  if (level.mode === 'multi-target') return multipleImg
  if (level.id === 99 || level.mode === 'endless') return infiniteImg
  return null
}

const getLevelImage = (level) => {
  if (level.mode === 'timed') {
    if (level.id === 1 && level.shape === 'circle') return circleImg
    if (level.id === 2 && level.shape === 'square') return squareImg
    if (level.id === 3 && level.shape === 'triangle') return triangleImg
  }
  return null
}

const loadLevelsData = () => {
  const gameData = gameStore.gameData

  // 确保旧存档的最佳分轨道对象存在（双保险）
  gameData.levels.forEach(l => {
    if (['interference', 'multi-target'].includes(l.mode) && !l.bestScoresByShape) {
      l.bestScoresByShape = { circle: 0, square: 0, triangle: 0 }
    }
  })

  const levelsWithIcons = gameData.levels.map(level => ({
    ...level,
    icon: getShapeIcon(level.shape, level.mode),
    description: getShapeDescription(level.shape, level.mode),
    image: getLevelImage(level) || getSpecialLevelImage(level)
  }))

  totalCoins.value = gameData.totalCoins
  levels.value = levelsWithIcons
}

const refreshLevels = async () => {
  isRefreshing.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  gameStore.loadGameData()
  loadLevelsData()
  isRefreshing.value = false

  const notification = document.createElement('div')
  notification.textContent = '✅ 关卡状态已更新！'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 600;
  `
  document.body.appendChild(notification)
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 2000)
}

const selectLevel = (levelId) => {
  const level = levels.value.find(l => l.id === levelId)
  if (!level || !level.unlocked) return
  router.push(`/game?levelId=${levelId}&gameMode=${level.mode}`)
}

const startSpecialTimed = (level, shapeId) => {
  if (!level?.unlocked) return
  router.push(`/game?levelId=${level.id}&gameMode=${level.mode}&shape=${shapeId}`)
}

const goEndlessSetup = () => { router.push('/endless-setup') }
const goHome = () => { router.push('/') }

onMounted(() => {
  gameStore.loadGameData()
  loadLevelsData()
})
</script>

<style scoped>
.header-actions { display: flex; align-items: center; gap: 12px; }
.btn-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; vertical-align: -3px; }
.title-with-icon { display: inline-flex; align-items: center; gap: 8px; }
.title-icon-img { width: 22px; height: 22px; object-fit: contain; vertical-align: middle; }
.coin-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; vertical-align: -3px; }

.refresh-btn {
  padding: 8px 12px;
  font-size: 14px;
  min-width: 110px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* 进度卡片 */
.progress-card {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}
.progress-title { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
.progress-info div { margin: 4px 0; }
.progress-tip { color: #e0e7ff; font-size: 14px; }
.progress-complete { color: #fbbf24; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.celebrate-icon { width: 18px; height: 18px; object-fit: contain; }

/* 区块与网格 */
.level-section { margin-bottom: 32px; }
.section-title {
  font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 16px;
  padding-left: 8px; border-left: 4px solid #8b5cf6; display: inline-flex; align-items: center; gap: 8px;
}
.levels-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px; margin: 16px 0;
}

.level-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: flex-start;
  min-height: 260px;
}
.level-card.unlocked { border-color: #8b5cf6; }
.level-card.unlocked:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2); border-color: #7c3aed; }
.level-card.special-card.unlocked { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b; }
.level-card.special-card.unlocked:hover { box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3); }
.level-card.locked { opacity: 0.6; }

.completed-badge {
  position: absolute; top: -10px; right: -10px; background: #f59e0b; color: white;
  border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.completed-img { width: 24px; height: 24px; object-fit: contain; }

.lock-overlay { position: absolute; inset: 0; background: rgba(229, 231, 235, 0.9); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; }

.level-media { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; min-height: 96px; }
.level-illustration { width: 96px; height: 96px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08)); }
.level-icon { font-size: 48px; margin-bottom: 12px; }

.level-name { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #374151; }
.level-desc { font-size: 14px; color: #6b7280; margin-bottom: 12px; }

.best-score {
  color: #f59e0b; font-size: 14px; font-weight: 600; margin-bottom: 12px;
  display: flex; align-items: center; justify-content: center; gap: 6px; text-align: center; width: 100%;
}

.inline-icon { width: 16px; height: 16px; object-fit: contain; vertical-align: -2px; }

/* 形状选择与分轨道成绩 */
.shape-select {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  padding: 12px;
  border: 1px dashed #f59e0b;
}
.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.shape-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.shape-btn {
  width: 100%;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 10px; border-radius: 10px;
  border: 2px solid #f59e0b; background: #fff7ed; color: #92400e; font-weight: 700; font-size: 12px; cursor: pointer;
  transition: all 0.2s;
}
.shape-btn:hover { background: #ffedd5; transform: translateY(-1px); }
.shape-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.shape-icon { width: 22px; height: 22px; object-fit: contain; }
.shape-name { font-size: 12px; }

.shape-score {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 12px; color: #7c2d12; font-weight: 600;
  background: #fff; border: 1px solid #fde68a; border-radius: 999px; padding: 4px 8px;
}

/* 帮助卡片 */
.help-card { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin-top: 24px; }
.help-title { font-size: 16px; font-weight: bold; color: #0369a1; margin-bottom: 12px; }
.help-content { color: #0369a1; font-size: 14px; line-height: 1.6; }
.help-content strong { color: #dc2626; font-weight: 600; }

/* 头部布局与标题装饰 */
.custom-back-button { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; min-width: max-content; }
.custom-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; position: relative; }
.header-left, .header-center, .header-right { flex: 1; display: flex; align-items: center; }
.header-left { justify-content: flex-start; }
.header-center { justify-content: center; }
.header-right { justify-content: flex-end; }
.header-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
  "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif;
  font-weight: 800; font-size: clamp(20px, 5vw, 30px); line-height: 1.2; letter-spacing: 0.06em; color: #111827;
  white-space: nowrap; position: relative; text-align: center;
}
.header-title::after {
  content: ""; display: block; width: 44px; height: 3px; border-radius: 999px; margin: 6px auto 0;
  background: linear-gradient(90deg, #8b5cf6 0%, #f59e0b 100%); opacity: 0.85;
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

/* 响应式 */
@media (max-width: 768px) {
  .custom-header { flex-direction: column; gap: 15px; padding: 15px; }
  .header-left, .header-center, .header-right { width: 100%; justify-content: center; }
  .levels-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .header-title { font-size: clamp(15px, 6vw, 20px); letter-spacing: 0.04em; }
  .header-title::after { width: 36px; height: 2.5px; margin-top: 4px; }
}
</style>
