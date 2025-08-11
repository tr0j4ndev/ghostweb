<template>
  <div class="page-wrapper">
    <!-- 顶部 -->
    <div class="custom-header">
      <button class="btn btn-outline custom-back-button" @click="goHome">
        <img class="btn-icon" :src="backIcon" alt="返回主页" />
        <span>返回主页</span>
      </button>
      <div class="header-title">
        <span>无尽模式</span>
      </div>
      <div style="width: 50px;"></div>
    </div>

    <div class="main-scroll-area">
      <div class="container">
        <!-- 概览条 -->
        <div class="summary-bar">
          <div class="summary-left">
            <img class="summary-icon" :src="infiniteImg" alt="无尽模式" />
            <div class="summary-texts">
              <div class="summary-title">无尽模式设置</div>
              <div class="summary-subtitle">选择玩法与轨道，立即开始你的无尽挑战</div>
            </div>
          </div>
          <div class="summary-right">
            <div class="summary-pill">
              当前：<strong>{{ getModeShortName(selectedMode) }}</strong>
            </div>
          </div>
        </div>

        <!-- 双栏布局 -->
        <div class="endless-layout">
          <!-- 左：选择玩法 -->
          <div class="card modes-card">
            <div class="section-header">
              <div class="section-title">选择玩法</div>
              <div class="section-subtitle">根据偏好选择无尽变体</div>
            </div>

            <div class="modes-grid">
              <button
                v-for="m in modes"
                :key="m.id"
                :class="['mode-card', selectedMode === m.id ? 'active' : '']"
                @click="selectMode(m.id)"
                :aria-pressed="selectedMode === m.id"
              >
                <div class="mode-icon-wrap">
                  <img :src="m.icon" :alt="m.name" class="mode-icon" />
                </div>
                <div class="mode-info">
                  <div class="mode-name">
                    {{ m.name }}
                    <span v-if="selectedMode === m.id" class="mode-checked">✓</span>
                  </div>
                  <div class="mode-desc">{{ m.desc }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 右：选择轨道 -->
          <div class="card shapes-card">
            <div class="section-header">
              <div class="section-title">选择轨道</div>
              <div class="section-subtitle">点击任意轨道，立即以「{{ getModeShortName(selectedMode) }}」开始</div>
            </div>

            <div class="shapes-grid">
              <button
                v-for="shape in shapes"
                :key="shape.id"
                class="shape-card"
                @click="startWithShape(shape.id)"
                :title="`点击以 ${getModeShortName(selectedMode)} · ${shape.name} 开始`"
              >
                <div class="shape-image-wrap">
                  <img :src="shape.image" :alt="shape.name" class="shape-image" />
                </div>
                <div class="shape-name">{{ shape.name }}</div>
                <div class="shape-hint">点击开始</div>
              </button>
            </div>

            <div class="inline-tip">
              小提示：圆形更流畅，方形拐弯更多，三角更具挑战性
            </div>
          </div>
        </div>

        <!-- 说明 -->
        <div class="tips-card">
          <div class="tips-title">玩法说明</div>
          <ul class="tips-list">
            <li>
              <span class="tip-dot">•</span>
              经典无尽：持续吃水果获取分数与金币
            </li>
            <li>
              <span class="tip-dot">•</span>
              干扰无尽：随机干扰物靠近时会触发眩晕，注意躲避
            </li>
            <li>
              <span class="tip-dot">•</span>
              多目标无尽：识别金色真目标，避开绿色干扰目标
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import circleImg from '../assets/circle.png'
import squareImg from '../assets/square.png'
import triangleImg from '../assets/triangle.png'
import backIcon from '../assets/back.png'

import infiniteImg from '../assets/infinite.png'
import interferenceImg from '../assets/interference.png'
import multipleImg from '../assets/multiple.png'

const router = useRouter()

const modes = ref([
  { id: 'endless', name: '经典无尽', desc: '无限时长，持续挑战自我', icon: infiniteImg },
  { id: 'endless-interference', name: '干扰无尽', desc: '干扰随时出现，考验抗干扰能力', icon: interferenceImg },
  { id: 'endless-multi-target', name: '多目标无尽', desc: '真假目标混战，提升注意力分配', icon: multipleImg }
])

const selectedMode = ref('endless')

const shapes = ref([
  { id: 'circle', name: '圆形', image: circleImg },
  { id: 'square', name: '方形', image: squareImg },
  { id: 'triangle', name: '三角', image: triangleImg }
])

const selectMode = (modeId) => {
  selectedMode.value = modeId
}

const getModeShortName = (modeId) => {
  if (modeId === 'endless') return '经典无尽'
  if (modeId === 'endless-interference') return '干扰无尽'
  if (modeId === 'endless-multi-target') return '多目标无尽'
  return '无尽'
}

const startWithShape = (shapeId) => {
  router.push(`/game?levelId=99&gameMode=${selectedMode.value}&shape=${shapeId}`)
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* Summary */
.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  margin: 4px 0 16px;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08);
}
.summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.summary-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.summary-texts {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}
.summary-subtitle {
  font-size: 13px;
  color: #6b7280;
}
.summary-right {
  display: flex;
  align-items: center;
}
.summary-pill {
  background: #f3e8ff;
  color: #7c3aed;
  border: 2px solid rgba(139,92,246,0.3);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
}

/* Layout */
.endless-layout {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 980px) {
  .endless-layout {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  padding: 16px;
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.06);
}
.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #8b5cf6;
  letter-spacing: 0.02em;
}
.section-subtitle {
  font-size: 13px;
  color: #6b7280;
}

/* Modes */
.modes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.mode-card {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  text-align: left;
  background: #faf5ff;
  border: 2px solid #e9d5ff;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mode-card:hover {
  background: #f3e8ff;
  transform: translateY(-1px);
}
.mode-card.active {
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  border-color: #8b5cf6;
  box-shadow: 0 6px 18px rgba(139, 92, 246, 0.18);
}
.mode-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.mode-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.mode-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mode-name {
  font-size: 15px;
  font-weight: 800;
  color: #374151;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.mode-checked {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 12px;
  line-height: 1;
  transform: translateY(-1px);
}
.mode-desc {
  font-size: 12px;
  color: #6b7280;
}

/* Shapes */
.shapes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 520px) {
  .shapes-grid {
    grid-template-columns: 1fr;
  }
}
.shape-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}
.shape-card:hover {
  border-color: #f59e0b;
  background: #fff7ed;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.18);
}
.shape-image-wrap {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shape-image {
  width: 84px;
  height: 84px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08));
}
.shape-name {
  font-size: 14px;
  font-weight: 800;
  color: #374151;
}
.shape-hint {
  font-size: 11px;
  color: #6b7280;
}
.inline-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 10px;
  padding: 8px 10px;
}

/* Tips */
.tips-card {
  margin-top: 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bae6fd;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 28px rgba(59, 130, 246, 0.08);
}
.tips-title {
  font-size: 16px;
  font-weight: 800;
  color: #0369a1;
  margin-bottom: 8px;
}
.tips-list {
  display: grid;
  gap: 6px;
  color: #0369a1;
  font-size: 13px;
}
.tip-dot {
  display: inline-block;
  width: 14px;
  text-align: center;
  color: #0ea5e9;
}

/* 通用头部（复用站点风格） */
.btn-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; vertical-align: -3px; }
.title-icon-img { width: 22px; height: 22px; object-fit: contain; vertical-align: -4px; margin-right: 8px; }

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  position: relative;
}
.header-left, .header-center, .header-right { flex: 1; display: flex; align-items: center; }
.header-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif;
  font-weight: 800;
  font-size: clamp(20px, 5vw, 30px);
  line-height: 1.2;
  letter-spacing: 0.06em;
  color: #111827;
  white-space: nowrap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  text-align: center;
}
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

@media (max-width: 768px) {
  .custom-header { flex-direction: column; gap: 15px; padding: 15px; }
  .header-left, .header-center, .header-right { width: 100%; justify-content: center; }
}
@media (max-width: 480px) {
  .header-title { font-size: clamp(15px, 6vw, 20px); letter-spacing: 0.04em; }
  .header-title::after { width: 36px; height: 2.5px; margin-top: 4px; }
}
</style>
