<template>
  <div class="page-wrapper">
    <div class="container shop">
      <!-- ===== Tab switcher ===== -->
      <div class="tab-bar">
        <button :class="['tab', currentTab === 'outfits' ? 'active' : '']" @click="switchTab('outfits')">
          <img class="tab-icon" :src="ghostImg" alt="" />
          <span>幽灵装扮</span>
        </button>
        <button :class="['tab', currentTab === 'fruits' ? 'active' : '']" @click="switchTab('fruits')">
          <img class="tab-icon" :src="appleImg" alt="" />
          <span>水果种类</span>
        </button>
      </div>

      <!-- ===== Outfits ===== -->
      <div v-if="currentTab === 'outfits'" class="grid">
        <div
          v-for="outfit in outfits"
          :key="outfit.id"
          :class="['item', { equipped: currentOutfit === outfit.id }]"
        >
          <div v-if="currentOutfit === outfit.id" class="equipped-pill">✓ 已装备</div>
          <div class="item-stage">
            <img :src="getOutfitImage(outfit)" :alt="outfit.name" class="item-img item-img-ghost" />
          </div>
          <div class="item-name">{{ outfit.name }}</div>
          <div v-if="!outfit.unlocked" class="price-pill">
            <img :src="glodIcon" alt="金币" /> {{ outfit.price }}
          </div>
          <div class="item-action">
            <button v-if="outfit.unlocked && currentOutfit !== outfit.id" class="btn btn-outline mini-btn" @click="equipOutfit(outfit.id)">装备</button>
            <div v-else-if="currentOutfit === outfit.id" class="equipped-status">已装备</div>
            <button
              v-else
              :class="['btn', 'mini-btn', totalCoins >= outfit.price ? 'btn-buy' : 'btn-disabled']"
              @click="purchaseOutfit(outfit.id)"
              :disabled="totalCoins < outfit.price"
            >{{ totalCoins >= outfit.price ? '购买' : '金币不足' }}</button>
          </div>
        </div>
      </div>

      <!-- ===== Fruits ===== -->
      <div v-if="currentTab === 'fruits'" class="grid">
        <div
          v-for="fruit in fruits"
          :key="fruit.id"
          :class="['item', { equipped: currentFruit === fruit.id }]"
        >
          <div v-if="currentFruit === fruit.id" class="equipped-pill">✓ 已装备</div>
          <div class="item-stage">
            <img :src="getFruitImage(fruit.id)" :alt="fruit.name" class="item-img item-img-fruit" />
          </div>
          <div class="item-name">{{ fruit.name }}</div>
          <div v-if="!fruit.unlocked" class="price-pill">
            <img :src="glodIcon" alt="金币" /> {{ fruit.price }}
          </div>
          <div class="item-action">
            <button v-if="fruit.unlocked && currentFruit !== fruit.id" class="btn btn-outline mini-btn" @click="equipFruit(fruit.id)">装备</button>
            <div v-else-if="currentFruit === fruit.id" class="equipped-status">已装备</div>
            <button
              v-else
              :class="['btn', 'mini-btn', totalCoins >= fruit.price ? 'btn-buy' : 'btn-disabled']"
              @click="purchaseFruit(fruit.id)"
              :disabled="totalCoins < fruit.price"
            >{{ totalCoins >= fruit.price ? '购买' : '金币不足' }}</button>
          </div>
        </div>
      </div>

      <!-- ===== Earn coins tips ===== -->
      <section class="earn">
        <h2 class="duo-section-title">
          <img class="section-icon" :src="glodIcon" alt="" />
          如何获得更多金币
        </h2>
        <div class="earn-list">
          <div class="earn-item"><img :src="fruitIcon" alt="" /><span>吃到水果获得金币</span></div>
          <div class="earn-item"><img :src="fireIcon" alt="" /><span>连击与高等级奖励更多</span></div>
          <div class="earn-item"><img :src="trophyIcon" alt="" /><span>完成关卡挑战获额外金币</span></div>
          <div class="earn-item"><img :src="endlessIcon" alt="" /><span>无尽模式是赚币好方法</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

import glodIcon from '../assets/glod.png'
import trophyIcon from '../assets/trophy.svg'
import fruitIcon from '../assets/fruit.svg'
import fireIcon from '../assets/fire.svg'
import endlessIcon from '../assets/endless.svg'

const fruitImageMap = { apple: appleImg, banana: bananaImg, grape: grapeImg, orange: orangeImg, strawberry: strawberryImg, cherry: cherryImg }
const imageMap = {
  'ghost.png': ghostImg, 'ghost_tiger.png': ghostTigerImg, 'ghost_scarf.png': ghostScarfImg,
  'ghost_witch.png': ghostWitchImg, 'ghost_mashmallow.png': ghostMarshmallowImg,
  'ghost_evil.png': ghostEvilImg, 'ghost_peking.png': ghostPekingImg,
}

const gameStore = useGameStore()
const totalCoins = ref(0)
const currentOutfit = ref('default')
const outfits = ref([])
const currentFruit = ref('apple')
const fruits = ref([])
const currentTab = ref('outfits')

const loadShopData = () => {
  const d = gameStore.gameData
  totalCoins.value = d.totalCoins
  currentOutfit.value = d.currentOutfit
  outfits.value = d.outfits
  currentFruit.value = d.currentFruit
  fruits.value = d.fruits
}
const switchTab = (t) => { currentTab.value = t }
const getFruitImage = (id) => fruitImageMap[id] || appleImg
const getOutfitImage = (o) => imageMap[o.image] || ghostImg

const purchaseOutfit = (id) => {
  const o = outfits.value.find((x) => x.id === id)
  if (!o || o.unlocked || totalCoins.value < o.price) return
  gameStore.spendCoins(o.price)
  gameStore.unlockOutfit(id)
  loadShopData()
  toast('购买成功！', 'success')
}
const equipOutfit = (id) => { gameStore.setCurrentOutfit(id); loadShopData(); toast('装备成功！', 'success') }
const purchaseFruit = (id) => {
  const f = fruits.value.find((x) => x.id === id)
  if (!f || f.unlocked || totalCoins.value < f.price) return
  gameStore.spendCoins(f.price)
  gameStore.unlockFruit(id)
  loadShopData()
  toast('购买成功！', 'success')
}
const equipFruit = (id) => { gameStore.setCurrentFruit(id); loadShopData(); toast('装备成功！', 'success') }

const toast = (msg, type = 'info') => {
  const n = document.createElement('div')
  n.textContent = msg
  n.style.cssText = `position:fixed;top:72px;right:20px;background:${type === 'success' ? '#58cc02' : '#1cb0f6'};color:#fff;padding:12px 20px;border-radius:16px;border-bottom:4px solid ${type === 'success' ? '#58a700' : '#1899d6'};z-index:1000;font-weight:800;`
  document.body.appendChild(n)
  setTimeout(() => document.body.contains(n) && document.body.removeChild(n), 2000)
}

onMounted(loadShopData)
</script>

<style scoped>
.shop { display: flex; flex-direction: column; gap: 22px; }

/* Tabs */
.tab-bar { display: flex; gap: 10px; background: #fff; border: 2px solid var(--duo-border); border-radius: 16px; padding: 6px; box-shadow: 0 4px 0 var(--duo-border); }
.tab {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 12px; border-radius: 12px; border: none; background: transparent;
  font-weight: 800; font-size: 15px; color: var(--duo-muted); cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tab.active { background: var(--duo-green); color: #fff; }
.tab:hover:not(.active) { background: var(--duo-card); color: var(--duo-green-shadow); }
.tab-icon { width: 26px; height: 26px; object-fit: contain; }

/* Grid */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

.item {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: #fff; border: 2px solid var(--duo-border); border-bottom: 5px solid var(--duo-border);
  border-radius: 22px; padding: 20px 16px;
  transition: filter 0.1s, transform 0.08s, border-color 0.15s, border-bottom-width 0.08s;
}
.item:hover { filter: brightness(1.03); }
.item.equipped { border-color: var(--duo-green); border-bottom-color: var(--duo-green-shadow); background: #e9f7d6; }

.equipped-pill {
  position: absolute; top: -10px; right: 12px;
  background: var(--duo-green); color: #fff; border: 2px solid var(--duo-green-shadow);
  border-radius: 999px; padding: 4px 12px; font-size: 12px; font-weight: 800;
}

.item-stage { height: 130px; display: flex; align-items: center; justify-content: center; }
.item-img-ghost { width: 120px; height: 120px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1)); }
.item-img-fruit { width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1)); }
.item-name { font-weight: 800; font-size: 16px; color: var(--duo-ink); text-align: center; }
.price-pill {
  display: inline-flex; align-items: center; gap: 5px;
  background: #fff5cc; color: var(--duo-yellow-shadow);
  border: 2px solid var(--duo-yellow); border-radius: 999px;
  padding: 5px 12px; font-weight: 800; font-size: 14px;
}
.price-pill img { width: 16px; height: 16px; object-fit: contain; }

.item-action { margin-top: auto; width: 100%; }
.mini-btn { width: 100%; margin: 0; padding: 11px; font-size: 14px; border-radius: 14px; }
.btn-buy { background: var(--duo-yellow); color: #fff; border-bottom-color: var(--duo-yellow-shadow); }
.btn-buy:hover { filter: brightness(1.05); }
.btn-disabled { background: #e5e5e5; color: #afafaf; border-bottom-color: #c8c8c8; cursor: not-allowed; }
.equipped-status {
  text-align: center; padding: 10px; border-radius: 14px;
  background: #c8efa0; color: var(--duo-green-shadow); border: 2px solid var(--duo-green);
  font-weight: 800; font-size: 14px;
}

/* Earn tips */
.earn { background: #fff8d6; border: 2px solid var(--duo-yellow); border-bottom: 5px solid var(--duo-yellow-shadow); border-radius: 22px; padding: 20px; }
.section-icon { width: 24px; height: 24px; object-fit: contain; }
.earn-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 12px; }
.earn-item { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.6); border-radius: 14px; padding: 10px 12px; color: #6b5400; font-weight: 700; font-size: 14px; }
.earn-item img { width: 22px; height: 22px; object-fit: contain; }

@media (max-width: 480px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .item-img-ghost { width: 90px; height: 90px; }
  .item-stage { height: 100px; }
}
</style>
