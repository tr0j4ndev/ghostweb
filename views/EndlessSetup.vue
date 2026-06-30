<template>
  <div class="page-wrapper">
    <div class="container endless">
      <h1 class="page-title">无尽模式</h1>
      <p class="page-sub">选择玩法与轨道，立即开始你的无尽挑战</p>

      <!-- current selection pill -->
      <div class="mode-pill">当前玩法：<strong>{{ getModeShortName(selectedMode) }}</strong></div>

      <!-- ===== Mode picker ===== -->
      <section class="block">
        <h2 class="duo-section-title">选择玩法</h2>
        <div class="modes">
          <button
            v-for="m in modes"
            :key="m.id"
            :class="['mode', selectedMode === m.id ? 'active' : '']"
            @click="selectMode(m.id)"
            :aria-pressed="selectedMode === m.id"
          >
            <img class="mode-icon" :src="m.icon" :alt="m.name" />
            <div class="mode-body">
              <div class="mode-name">{{ m.name }}<span v-if="selectedMode === m.id" class="check">✓</span></div>
              <div class="mode-desc">{{ m.desc }}</div>
            </div>
          </button>
        </div>
      </section>

      <!-- ===== Track picker ===== -->
      <section class="block">
        <h2 class="duo-section-title">选择轨道</h2>
        <p class="block-sub">点击轨道，以「{{ getModeShortName(selectedMode) }}」开始</p>
        <div class="tracks">
          <button
            v-for="s in shapes"
            :key="s.id"
            class="track"
            @click="startWithShape(s.id)"
          >
            <img class="track-img" :src="s.image" :alt="s.name" />
            <div class="track-name">{{ s.name }}</div>
            <div class="track-hint">点击开始</div>
          </button>
        </div>
        <div class="tip">小提示：圆形更流畅，方形拐弯多，三角更具挑战</div>
      </section>

      <!-- ===== Rules ===== -->
      <section class="rules">
        <h2 class="duo-section-title">玩法说明</h2>
        <ul class="rules-list">
          <li><span class="dot"></span>经典无尽：持续吃水果获取分数与金币</li>
          <li><span class="dot"></span>干扰无尽：干扰物靠近触发眩晕，注意躲避</li>
          <li><span class="dot"></span>多目标无尽：识别金色真目标，避开绿色干扰</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import circleImg from '../assets/circle.svg'
import squareImg from '../assets/square.svg'
import triangleImg from '../assets/triangle.svg'
import infiniteImg from '../assets/infinite.svg'
import interferenceImg from '../assets/interference.svg'
import multipleImg from '../assets/multiple.svg'

const router = useRouter()
const modes = ref([
  { id: 'endless', name: '经典无尽', desc: '无限时长，持续挑战自我', icon: infiniteImg },
  { id: 'endless-interference', name: '干扰无尽', desc: '干扰随时出现，考验抗干扰', icon: interferenceImg },
  { id: 'endless-multi-target', name: '多目标无尽', desc: '真假目标混战，提升注意力', icon: multipleImg },
])
const selectedMode = ref('endless')
const shapes = ref([
  { id: 'circle', name: '圆形', image: circleImg },
  { id: 'square', name: '方形', image: squareImg },
  { id: 'triangle', name: '三角', image: triangleImg },
])

const selectMode = (id) => { selectedMode.value = id }
const getModeShortName = (id) => ({ 'endless': '经典无尽', 'endless-interference': '干扰无尽', 'endless-multi-target': '多目标无尽' }[id] || '无尽')
const startWithShape = (shapeId) => router.push(`/game?levelId=99&gameMode=${selectedMode.value}&shape=${shapeId}`)
</script>

<style scoped>
.endless { display: flex; flex-direction: column; gap: 20px; }
.page-title { font-family: 'Fredoka','Nunito',sans-serif; font-size: 30px; font-weight: 700; color: var(--duo-ink); }
.page-sub { font-size: 15px; color: var(--duo-muted); font-weight: 600; margin-top: -12px; }

.mode-pill {
  align-self: flex-start;
  background: #e9f7d6; color: var(--duo-green-shadow);
  border: 2px solid var(--duo-green); border-radius: 999px;
  padding: 8px 16px; font-weight: 800; font-size: 14px;
}

.block { display: flex; flex-direction: column; gap: 10px; }
.block-sub { font-size: 13px; color: var(--duo-muted); font-weight: 600; margin-top: -6px; }

/* Modes */
.modes { display: flex; flex-direction: column; gap: 10px; }
.mode {
  display: flex; align-items: center; gap: 14px; text-align: left;
  background: #fff; border: 2px solid var(--duo-border); border-bottom: 5px solid var(--duo-border);
  border-radius: 18px; padding: 14px; cursor: pointer;
  transition: filter 0.1s, transform 0.08s, border-color 0.15s, border-bottom-width 0.08s;
}
.mode:hover { filter: brightness(1.03); }
.mode:active { border-bottom-width: 2px; transform: translateY(3px); }
.mode.active { background: #e9f7d6; border-color: var(--duo-green); border-bottom-color: var(--duo-green-shadow); }
.mode-icon { width: 44px; height: 44px; object-fit: contain; flex-shrink: 0; }
.mode-name { font-weight: 800; font-size: 16px; color: var(--duo-ink); display: inline-flex; align-items: center; gap: 6px; }
.check { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: var(--duo-green); color: #fff; font-size: 12px; }
.mode-desc { font-size: 13px; color: var(--duo-muted); font-weight: 600; margin-top: 2px; }

/* Tracks */
.tracks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.track {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: #fff; border: 2px solid var(--duo-border); border-bottom: 5px solid var(--duo-border);
  border-radius: 18px; padding: 16px 10px; cursor: pointer;
  transition: filter 0.1s, transform 0.08s, border-color 0.15s, border-bottom-width 0.08s;
}
.track:hover { border-color: var(--duo-blue); border-bottom-color: var(--duo-blue-shadow); background: #e8f7ff; filter: none; }
.track:active { border-bottom-width: 2px; transform: translateY(3px); }
.track-img { width: 76px; height: 76px; object-fit: contain; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.08)); }
.track-name { font-weight: 800; font-size: 15px; color: var(--duo-ink); }
.track-hint { font-size: 11px; color: var(--duo-muted); font-weight: 600; }

.tip { font-size: 13px; color: #6b5400; font-weight: 600; background: #fff8d6; border: 2px solid var(--duo-yellow); border-radius: 12px; padding: 10px 12px; margin-top: 4px; }

/* Rules */
.rules { background: var(--duo-card); border: 2px solid var(--duo-border); border-radius: 20px; padding: 20px; box-shadow: 0 4px 0 var(--duo-border); }
.rules-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.rules-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: var(--duo-ink); }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--duo-green); flex-shrink: 0; }

@media (max-width: 520px) {
  .tracks { grid-template-columns: 1fr; }
}
</style>
