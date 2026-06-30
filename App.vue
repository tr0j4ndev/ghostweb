<template>
  <div id="app">
    <!-- ===== Top stats bar (Duolingo-style) ===== -->
    <header v-if="!isGameRoute" class="duo-topbar">
      <div class="topbar-inner">
        <!-- Streak -->
        <div class="topbar-stat" :title="`连续训练 ${streakDays} 天`">
          <img class="topbar-icon" :src="fireIcon" alt="连续天数" />
          <span class="topbar-value">{{ streakDays }}</span>
        </div>
        <!-- Coins -->
        <div class="topbar-stat topbar-coins" :title="`金币 ${totalCoins}`">
          <img class="topbar-icon" :src="glodIcon" alt="金币" />
          <span class="topbar-value">{{ totalCoins }}</span>
        </div>
        <!-- Mascot avatar (current outfit) -->
        <div class="topbar-avatar" :title="currentOutfitName">
          <img :src="currentOutfitImage" :alt="currentOutfitName" />
        </div>
      </div>
    </header>

    <!-- ===== Page content ===== -->
    <main class="duo-main" :class="{ 'duo-main--game': isGameRoute }">
      <router-view />
    </main>

    <!-- ===== Bottom tab navigation (Duolingo-style) ===== -->
    <nav v-if="!isGameRoute" class="duo-nav">
      <router-link
        v-for="tab in navTabs"
        :key="tab.path"
        :to="tab.path"
        class="duo-nav-item"
        :class="{ 'duo-nav-item--active': isTabActive(tab) }"
      >
        <img class="duo-nav-icon" :src="tab.icon" :alt="tab.label" />
        <span class="duo-nav-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from './stores/gameStore'

import fireIcon from './assets/fire.svg'
import glodIcon from './assets/glod.png'
import startIcon from './assets/start.svg'
import levelIcon from './assets/level.svg'
import storeIcon from './assets/store.svg'
import reportIcon from './assets/report.svg'
import saveIcon from './assets/save.svg'

import ghostImg from './assets/ghost.png'
import ghostTigerImg from './assets/ghost_tiger.png'
import ghostScarfImg from './assets/ghost_scarf.png'
import ghostWitchImg from './assets/ghost_witch.png'
import ghostMarshmallowImg from './assets/ghost_mashmallow.png'
import ghostEvilImg from './assets/ghost_evil.png'
import ghostPekingImg from './assets/ghost_peking.png'

const route = useRoute()
const gameStore = useGameStore()

const outfitImageMap = {
  'ghost.png': ghostImg,
  'ghost_tiger.png': ghostTigerImg,
  'ghost_scarf.png': ghostScarfImg,
  'ghost_witch.png': ghostWitchImg,
  'ghost_mashmallow.png': ghostMarshmallowImg,
  'ghost_evil.png': ghostEvilImg,
  'ghost_peking.png': ghostPekingImg,
}

const isGameRoute = computed(() => route.name === 'Game')

const totalCoins = computed(() => gameStore.totalCoins)
const streakDays = computed(() => gameStore.statistics?.consecutiveDays || 0)

const currentOutfitData = computed(
  () => gameStore.gameData.outfits.find((o) => o.id === gameStore.currentOutfit) || gameStore.gameData.outfits[0],
)
const currentOutfitName = computed(() => currentOutfitData.value?.name || '小幽灵')
const currentOutfitImage = computed(
  () => outfitImageMap[currentOutfitData.value?.image] || ghostImg,
)

const navTabs = [
  { path: '/', label: '首页', icon: startIcon, exact: true },
  { path: '/levels', label: '关卡', icon: levelIcon },
  { path: '/shop', label: '商店', icon: storeIcon },
  { path: '/reports', label: '报告', icon: reportIcon },
  { path: '/save-manager', label: '存档', icon: saveIcon },
]

const isTabActive = (tab) => {
  if (tab.exact) return route.path === tab.path
  return route.path.startsWith(tab.path)
}
</script>

<style>
/* ===== Duolingo-inspired design tokens ===== */
:root {
  --duo-green: #58cc02;
  --duo-green-hover: #61e002;
  --duo-green-shadow: #58a700;
  --duo-blue: #1cb0f6;
  --duo-blue-shadow: #1899d6;
  --duo-yellow: #ffc800;
  --duo-yellow-shadow: #e6a700;
  --duo-red: #ff4b4b;
  --duo-red-shadow: #ea2b2b;
  --duo-purple: #ce82ff;
  --duo-ink: #3c3c3c;
  --duo-muted: #777;
  --duo-bg: #fff;
  --duo-card: #f7f7f7;
  --duo-border: #e5e5e5;
  --duo-nav-h: 72px;
  --duo-topbar-h: 60px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  background: var(--duo-bg);
  color: var(--duo-ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== Top stats bar ===== */
.duo-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 2px solid var(--duo-border);
  height: var(--duo-topbar-h);
  display: flex;
  align-items: center;
}
.topbar-inner {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.topbar-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 18px;
  color: var(--duo-ink);
}
.topbar-coins {
  color: var(--duo-yellow-shadow);
}
.topbar-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.topbar-avatar {
  margin-left: auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e9f7d6;
  border: 2px solid var(--duo-green);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.topbar-avatar img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

/* ===== Main content area ===== */
.duo-main {
  flex: 1;
  width: 100%;
  padding-bottom: calc(var(--duo-nav-h) + 12px);
}
.duo-main--game {
  padding-bottom: 0;
}

/* ===== Bottom tab navigation ===== */
.duo-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  height: var(--duo-nav-h);
  background: #fff;
  border-top: 2px solid var(--duo-border);
  display: flex;
  max-width: 960px;
  margin: 0 auto;
}
.duo-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: var(--duo-muted);
  font-weight: 800;
  font-size: 11px;
  transition: color 0.15s, background 0.15s;
  position: relative;
}
.duo-nav-item:hover {
  background: var(--duo-card);
}
.duo-nav-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  opacity: 0.55;
  transition: opacity 0.15s, transform 0.15s;
}
.duo-nav-item--active {
  color: var(--duo-green-shadow);
}
.duo-nav-item--active .duo-nav-icon {
  opacity: 1;
  transform: translateY(-2px);
}
.duo-nav-item--active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: var(--duo-green);
}

/* ===== Layout primitives kept for compatibility ===== */
.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.main-scroll-area {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}
.container {
  box-sizing: border-box;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 18px 20px 24px;
}

/* ===== Cards ===== */
.card {
  background: #fff;
  border: 2px solid var(--duo-border);
  border-radius: 18px;
  box-shadow: 0 4px 0 var(--duo-border);
  padding: 20px;
  margin: 10px auto;
  box-sizing: border-box;
  width: 100%;
  max-width: 420px;
}

/* ===== Duolingo signature 3D press buttons ===== */
.btn {
  background: var(--duo-green);
  color: #fff;
  border: none;
  border-bottom: 4px solid var(--duo-green-shadow);
  border-radius: 16px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
  letter-spacing: 0.02em;
  margin: 8px;
  transition: filter 0.1s, transform 0.08s, border-bottom-width 0.08s;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
}
.btn:hover { filter: brightness(1.05); }
.btn:active { border-bottom-width: 2px; transform: translateY(2px); }
.btn:focus-visible { outline: 3px solid var(--duo-blue); outline-offset: 2px; }

.btn-outline {
  background: transparent;
  color: var(--duo-green-shadow);
  border: 2px solid var(--duo-border);
  border-bottom: 4px solid var(--duo-border);
}
.btn-outline:hover { background: var(--duo-card); filter: none; }
.btn-outline:active { border-bottom-width: 2px; transform: translateY(2px); }

.btn-green { background: var(--duo-green); border-bottom-color: var(--duo-green-shadow); }
.btn-green:hover { filter: brightness(1.05); }

.badge {
  background: var(--duo-card);
  color: var(--duo-ink);
  padding: 6px 12px;
  border-radius: 12px;
  border: 2px solid var(--duo-border);
  font-size: 13px;
  font-weight: 800;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.badge-primary {
  background: var(--duo-green);
  color: #fff;
  border-color: var(--duo-green-shadow);
}

/* ===== Helpers ===== */
.flex { display: flex; }
.flex-column { flex-direction: column; }
.align-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-small { gap: 8px; }
.gap-medium { gap: 16px; }
.text-center { text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%; }
.title { font-family: 'Fredoka', 'Nunito', sans-serif; font-size: 32px; font-weight: 700; color: var(--duo-ink); margin-bottom: 8px; }
.subtitle { font-size: 16px; color: var(--duo-muted); margin-bottom: 16px; }
.coins { color: var(--duo-yellow-shadow); font-weight: 800; font-size: 16px; }

/* Section heading used across screens */
.duo-section-title {
  font-family: 'Fredoka', 'Nunito', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--duo-ink);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 480px) {
  .topbar-inner { gap: 12px; padding: 0 14px; }
  .topbar-stat { font-size: 16px; }
  .duo-nav-label { font-size: 10px; }
}
</style>
