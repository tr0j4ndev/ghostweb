<template>
  <div class="page-wrapper">
    <!-- 自定义头部 -->
    <div class="custom-header">
      <button class="btn btn-outline custom-back-button" @click="goHome">
        <img class="btn-icon" :src="backIcon" alt="返回主页" />
        <span>返回主页</span>
      </button>
      <div class="header-title header-title-with-icon">
        <span>幽灵商店</span>
      </div>
      <div class="header-coins">
        <img class="coin-icon" :src="glodIcon" alt="金币" />
        <span>{{ totalCoins }}</span>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="container">
        <div class="shop-content">
          <!-- 标签栏 -->
          <div class="tab-bar">
            <div 
              :class="['tab-item', currentTab === 'outfits' ? 'active' : '']" 
              @click="switchTab('outfits')"
            >
              <img class="tab-icon-img icon-ghost" :src="ghostImg" alt="幽灵图标" />
              <span>幽灵装扮</span>
            </div>
            <div 
              :class="['tab-item', currentTab === 'fruits' ? 'active' : '']" 
              @click="switchTab('fruits')"
            >
              <img class="tab-icon-img icon-apple" :src="appleImg" alt="苹果图标" />
              <span>水果种类</span>
            </div>
          </div>

          <!-- 幽灵装扮区域 -->
          <div v-if="currentTab === 'outfits'" class="shop-section">
            <div class="section-header">
              <h2 class="section-title">
                <img class="title-icon icon-ghost" :src="ghostImg" alt="" />
                幽灵装扮收藏
              </h2>
              <p class="section-desc">让你的小幽灵更加个性化！</p>
            </div>
            <div class="items-grid">
              <div 
                v-for="outfit in outfits" 
                :key="outfit.id" 
                :class="['item-card', 'outfit-card', { 'equipped': currentOutfit === outfit.id }]"
              >
                <!-- 装备标识 -->
                <div v-if="currentOutfit === outfit.id" class="equipped-badge">
                  <span>✓ 已装备</span>
                </div>
                
                <!-- 幽灵预览 -->
                <div class="item-preview">
                  <img 
                    :src="getOutfitImage(outfit)" 
                    :alt="outfit.name"
                    class="ghost-preview-img"
                  />
                </div>
                
                <!-- 装扮信息 -->
                <div class="item-info">
                  <div class="item-name">{{ outfit.name }}</div>
                  <div v-if="!outfit.unlocked" class="item-price">{{ outfit.price }} 
                    <img class="coin-icon" :src="glodIcon" alt="金币" />
                  </div>
                </div>
                
                <!-- 按钮区域 -->
                <div class="item-actions">
                  <div v-if="outfit.unlocked">
                    <div v-if="currentOutfit === outfit.id" class="status-badge equipped-status">
                      已装备
                    </div>
                    <button 
                      v-else
                      class="btn item-btn"
                      @click="equipOutfit(outfit.id)"
                    >
                      装备
                    </button>
                  </div>
                  <div v-else>
                    <button 
                      :class="['btn', 'item-btn', totalCoins >= outfit.price ? 'btn-purchase' : 'btn-disabled']" 
                      @click="purchaseOutfit(outfit.id)"
                      :disabled="totalCoins < outfit.price"
                    >
                      {{ totalCoins >= outfit.price ? '购买' : '🔒 金币不足' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 水果种类区域 -->
          <div v-if="currentTab === 'fruits'" class="shop-section">
            <div class="section-header">
              <h2 class="section-title">
                <img class="title-icon title-icon-apple" :src="appleImg" alt="" />
                水果种类收藏
              </h2>
              <p class="section-desc">收集不同的水果，让游戏更有趣！</p>
            </div>
            <div class="items-grid">
              <div 
                v-for="fruit in fruits" 
                :key="fruit.id" 
                :class="['item-card', 'fruit-card', { 'equipped': currentFruit === fruit.id }]"
              >
                <!-- 装备标识 -->
                <div v-if="currentFruit === fruit.id" class="equipped-badge">
                  <span>✓ 已装备</span>
                </div>
                
                <!-- 水果预览 -->
                <div class="item-preview">
                  <img 
                    :src="getFruitImage(fruit.id)" 
                    :alt="fruit.name"
                    class="fruit-preview-img"
                  />
                </div>
                
                <!-- 水果信息 -->
                <div class="item-info">
                  <div class="item-name">{{ fruit.name }}</div>
                  <div v-if="!fruit.unlocked" class="item-price">{{ fruit.price }} 
                  
                  </div>
                </div>
                
                <!-- 按钮区域 -->
                <div class="item-actions">
                  <div v-if="fruit.unlocked">
                    <div v-if="currentFruit === fruit.id" class="status-badge equipped-status">
                      已装备
                    </div>
                    <button 
                      v-else
                      class="btn item-btn"
                      @click="equipFruit(fruit.id)"
                    >
                      装备
                    </button>
                  </div>
                  <div v-else>
                    <button 
                      :class="['btn', 'item-btn', totalCoins >= fruit.price ? 'btn-purchase' : 'btn-disabled']" 
                      @click="purchaseFruit(fruit.id)"
                      :disabled="totalCoins < fruit.price"
                    >
                      {{ totalCoins >= fruit.price ? '购买' : '🔒 金币不足' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 获取金币提示（全部改为 PNG 图标） -->
          <div class="help-section">
            <div class="help-card">
              <div class="help-title title-with-icon">
                <img class="title-icon" :src="glodIcon" alt="如何获得更多金币？" />
                <span>如何获得更多金币？</span>
              </div>
              <div class="help-content">
                <div class="help-item">
                  <img class="help-icon-img" :src="fruitIcon" alt="在游戏中吃到苹果可以获得金币" />
                  <span>在游戏中吃到苹果可以获得金币</span>
                </div>
                <div class="help-item">
                  <img class="help-icon-img" :src="fireIcon" alt="连击和高等级会获得更多奖励" />
                  <span>连击和高等级会获得更多奖励</span>
                </div>
                <div class="help-item">
                  <img class="help-icon-img" :src="trophyIcon" alt="完成关卡挑战获得额外金币" />
                  <span>完成关卡挑战获得额外金币</span>
                </div>
                <div class="help-item">
                  <img class="help-icon-img" :src="endlessIcon" alt="无尽模式是获得金币的好方法" />
                  <span>无尽模式是获得金币的好方法</span>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- /shop-content -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

/* 新增：UI PNG 图标 */
import backIcon from '../assets/back.png'
import glodIcon from '../assets/glod.png'
import trophyIcon from '../assets/trophy.png'
import fruitIcon from '../assets/fruit.png'
import fireIcon from '../assets/fire.png'
import endlessIcon from '../assets/endless.png'

const fruitImageMap = {
  'apple': appleImg,
  'banana': bananaImg,
  'grape': grapeImg,
  'orange': orangeImg,
  'strawberry': strawberryImg,
  'cherry': cherryImg
}

const router = useRouter()
const gameStore = useGameStore()

const totalCoins = ref(0)
const currentOutfit = ref('default')
const outfits = ref([])
const currentFruit = ref('apple')
const fruits = ref([])
const currentTab = ref('outfits')

const imageMap = {
  'ghost.png': ghostImg,
  'ghost_tiger.png': ghostTigerImg,
  'ghost_scarf.png': ghostScarfImg,
  'ghost_witch.png': ghostWitchImg,
  'ghost_mashmallow.png': ghostMarshmallowImg,
  'ghost_evil.png': ghostEvilImg,
  'ghost_peking.png': ghostPekingImg
}

const loadShopData = () => {
  const gameData = gameStore.gameData
  totalCoins.value = gameData.totalCoins
  currentOutfit.value = gameData.currentOutfit
  outfits.value = gameData.outfits
  currentFruit.value = gameData.currentFruit
  fruits.value = gameData.fruits
}

const switchTab = (tab) => {
  currentTab.value = tab
}

const getFruitImage = (fruitId) => {
  return fruitImageMap[fruitId] || appleImg
}

const purchaseOutfit = (outfitId) => {
  const outfit = outfits.value.find(o => o.id === outfitId)

  if (!outfit || outfit.unlocked || totalCoins.value < outfit.price) {
    return
  }

  gameStore.spendCoins(outfit.price)
  gameStore.unlockOutfit(outfitId)
  loadShopData()

  showNotification('购买成功！', 'success')
}

const equipOutfit = (outfitId) => {
  gameStore.setCurrentOutfit(outfitId)
  loadShopData()
  showNotification('装备成功！', 'success')
}

const purchaseFruit = (fruitId) => {
  const fruit = fruits.value.find(f => f.id === fruitId)

  if (!fruit || fruit.unlocked || totalCoins.value < fruit.price) {
    return
  }

  gameStore.spendCoins(fruit.price)
  gameStore.unlockFruit(fruitId)
  loadShopData()

  showNotification('购买成功！', 'success')
}

const equipFruit = (fruitId) => {
  gameStore.setCurrentFruit(fruitId)
  loadShopData()
  showNotification('装备成功！', 'success')
}

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `

  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
    document.head.removeChild(style)
  }, 2000)
}

const goHome = () => {
  router.push('/')
}

const getOutfitImage = (outfit) => {
  return imageMap[outfit.image] || ghostImg
}

onMounted(() => {
  loadShopData()
})
</script>

<style scoped>
.shop-content {
  max-width: 1200px;
  margin: 0 auto;
}


.btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 6px;
}
.coin-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 6px;
  vertical-align: -3px;
}
.title-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  vertical-align: -6px;
  margin-right: 10px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.06));
}

/* 标签栏 */
.tab-bar {
  display: flex;
  width: 100%;
  margin-bottom: 32px;
  border-bottom: 2px solid #e5e7eb;
  background: white;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  padding: 20px 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #7c3aed;          /* 未选中：略浅主题色文字 */
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #faf5ff;     /* 未选中：比背景稍浅但有区分 */
}

.tab-item.active {
  color: #6d28d9;          /* 选中：更深主题色 */
  border-color: #6d28d9;   /* 与文字同色 */
  background: #e9d5ff;     /* 选中：比未选中更深一点 */
}

.tab-item:hover {
  background: #f3e8ff;     /* hover：介于未选中与选中之间 */
  color: #6d28d9;
}

.tab-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: inline-block;
}

/* 区块标题 */
.shop-section {
  margin-bottom: 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 16px;
  opacity: 0.9;
}

/* 网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.item-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}

.item-card.equipped {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.equipped-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #10b981;
  color: white;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 2;
}

.item-preview {
  position: relative;
  margin-bottom: 16px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-preview-img {
  width: 140px;
  height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.fruit-preview-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.item-info {
  flex-grow: 1;
  margin-bottom: 16px;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.item-price {
  color: #f59e0b;
  font-size: 16px;
  font-weight: 600;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
}

.item-actions {
  margin-top: auto;
}

.item-btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}

.btn-purchase {
  background: #f59e0b;
  color: white;
}

.btn-purchase:hover {
  background: #d97706;
}

.btn-disabled {
  background: #d1d5db !important;
  color: #6b7280 !important;
  cursor: not-allowed;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.equipped-status {
  background: #dcfce7;
  color: #166534;
  border: 2px solid #bbf7d0;
}

/* 获取金币提示（图标PNG） */
.help-section {
  margin-top: 40px;
}

.help-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
}

.help-title {
  font-size: 20px;
  font-weight: bold;
  color: #92400e;
  margin-bottom: 16px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.help-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #92400e;
  font-size: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.help-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  .tab-item {
    padding: 16px 12px;
    font-size: 14px;
  }

  .section-title {
    font-size: 20px;
  }

  .help-content {
    grid-template-columns: 1fr;
  }
  .tab-icon-img {
    width: 24px;
    height: 24px;
  }
  .title-icon {
    width: 26px;
    height: 26px;
    vertical-align: -4px;
  }
}

@media (max-width: 480px) {
  .items-grid {
    grid-template-columns: 1fr;
  }

  .item-card {
    min-height: 280px;
    padding: 20px;
  }

  .ghost-preview-img {
    width: 120px;
    height: 120px;
  }

  .item-preview {
    height: 140px;
  }

  .tab-item span:not(:first-child) {
    /* 保持布局紧凑 */
  }
}

/* 统一幽灵图标尺寸（标签和标题一致） */
.icon-ghost {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: inline-block;
}

@media (max-width: 768px) {
  .icon-ghost {
    width: 34px;
    height: 34px;
  }
}

@media (max-width: 480px) {
  .icon-ghost {
    width: 30px;
    height: 30px;
  }
}

.custom-back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;     /* 不换行 */
  min-width: max-content;  /* 根据内容自适应宽度 */
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  position: relative;
}

/* 三个部分等宽布局 */
.header-left, .header-center, .header-right {
  flex: 1;
  display: flex;
  align-items: center;
}

/* 左侧内容右对齐 */
.header-left {
  justify-content: flex-start;
}

/* 中间内容居中 */
.header-center {
  justify-content: center;
}

/* 右侧内容左对齐 */
.header-right {
  justify-content: flex-end;
}


/* 保持原有标题样式 */
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

  padding-right:70px;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .custom-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .header-left, .header-center, .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .header-left {
    order: 1;
    justify-content: flex-start;
  }
  
  .header-center {
    order: 2;
  }
  
  .header-right {
    order: 3;
  }
  

}

@media (max-width: 480px) {
  .header-title {
    font-size: clamp(15px, 6vw, 20px);
    letter-spacing: 0.04em;
  }
  
  .header-title::after {
    width: 36px;
    height: 2.5px;
    margin-top: 4px;
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

</style>
