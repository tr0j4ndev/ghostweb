<template>
  <div class="page-wrapper">
    <!-- 自定义头部 -->
    <div class="custom-header">
      <button class="btn btn-outline custom-back-button" @click="goHome">
        <img class="btn-icon" :src="backIcon" alt="返回主页" />
        <span>返回主页</span>
      </button>
      <div class="header-title">
        <span>存档管理</span>
      </div>
      <div class="header-actions">
        <button class="btn btn-green" @click="showCreateModal = true">
          <img class="btn-icon" :src="newIcon" alt="新建存档" />
          <span>{{ isCreating ? '创建中...' : '新建存档' }}</span>
        </button>
      </div>
    </div>

    <div class="main-scroll-area">
      <div class="container">
        <!-- 当前存档提示 -->
        <div class="current-save-info">
          <div class="current-save-header">
            <h2 class="title-with-icon">
              <img class="title-icon-img" :src="currentIcon" alt="当前存档" />
              <span>当前存档</span>
            </h2>
          </div>
          <div class="current-save-card">
            <div class="save-info">
              <div class="save-name">{{ currentSave.name || '未知存档' }}</div>
              <div class="save-stats">
                <span class="stat-line">
                  <img class="inline-icon" :src="glodIcon" alt="金币" />
                  <span>金币: {{ currentSave.totalCoins || 0 }}</span>
                </span>
                <span class="stat-line">
                  <img class="inline-icon" :src="timeIcon" alt="训练次数" />
                  <span>训练次数: {{ (currentSave.statistics && currentSave.statistics.totalSessions) || 0 }}</span>
                </span>
                <span class="stat-line">
                  <img class="inline-icon" :src="fireIcon" alt="连续天数" />
                  <span>连续天数: {{ (currentSave.statistics && currentSave.statistics.consecutiveDays) || 0 }}</span>
                </span>
              </div>
              <div class="save-date">
                最后游戏: {{ formatDate(currentSave.lastPlayDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 所有存档列表 -->
        <div class="saves-section">
          <div class="section-header">
            <h2 class="title-with-icon">
              <img class="title-icon-img" :src="allIcon" alt="所有存档" />
              <span>所有存档</span>
            </h2>
            <div class="saves-count">共 {{ allSaves.length }} 个存档</div>
          </div>
          
          <div v-if="allSaves.length === 0" class="no-saves">
            <div class="no-saves-icon">📁</div>
            <div class="no-saves-text">暂无存档</div>
            <div class="no-saves-hint">点击上方"新建存档"按钮创建第一个存档</div>
          </div>
          
          <div v-else class="saves-grid">
            <div 
              v-for="save in allSaves" 
              :key="save.id"
              :class="['save-card', { 'current': save.id === currentSaveId }]"
            >
              <div class="save-header">
                <div class="save-title">
                  <div class="save-name">{{ save.name }}</div>
                  <div v-if="save.id === currentSaveId" class="current-badge">当前</div>
                </div>
                <div class="save-actions">
                  <button 
                    v-if="save.id !== currentSaveId"
                    class="btn btn-outline action-btn"
                    @click="switchSave(save.id)"
                  >
                    切换
                  </button>
                  <button 
                    class="btn btn-outline action-btn"
                    @click="renameSave(save)"
                  >
                    重命名
                  </button>
                  <button 
                    v-if="allSaves.length > 1"
                    class="btn btn-outline action-btn delete-btn"
                    @click="deleteSave(save.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
              
              <div class="save-content">
                <div class="save-stats">
                  <div class="stat-item">
                    <img class="stat-icon-img" :src="glodIcon" alt="金币" />
                    <span class="stat-value">{{ save.totalCoins || 0 }}</span>
                    <span class="stat-label">金币</span>
                  </div>
                  <div class="stat-item">
                    <img class="stat-icon-img" :src="timeIcon" alt="训练次数" />
                    <span class="stat-value">{{ (save.statistics && save.statistics.totalSessions) || 0 }}</span>
                    <span class="stat-label">训练次数</span>
                  </div>
                  <div class="stat-item">
                    <img class="stat-icon-img" :src="fireIcon" alt="连续天数" />
                    <span class="stat-value">{{ (save.statistics && save.statistics.consecutiveDays) || 0 }}</span>
                    <span class="stat-label">连续天数</span>
                  </div>
                </div>
                
                <div class="save-progress">
                  <div class="progress-item">
                    <span>完成关卡: {{ getCompletedLevels(save) }}/{{ getTotalLevels(save) }}</span>
                    <div class="progress-bar">
                      <div 
                        class="progress-fill" 
                        :style="{ width: (getCompletedLevels(save) / getTotalLevels(save)) * 100 + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div class="save-date">
                  创建时间: {{ formatDate(save.createdAt) }}<br>
                  最后游戏: {{ formatDate(save.lastPlayDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建存档模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🆕 新建存档</h3>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>存档名称</label>
            <input 
              v-model="newSaveName" 
              type="text" 
              placeholder="请输入存档名称"
              class="form-input"
              maxlength="20"
              @keyup.enter="createNewSave"
              ref="nameInput"
            />
            <div class="form-hint">最多20个字符</div>
          </div>
          <div class="form-group">
            <div class="warning-box">
              <div class="warning-icon">⚠️</div>
              <div class="warning-text">
                新建存档将创建一个全新的游戏进度，所有数据从零开始。
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeCreateModal">取消</button>
          <button 
            class="btn btn-green" 
            @click="createNewSave"
            :disabled="!newSaveName.trim() || isCreating"
          >
            {{ isCreating ? '创建中...' : '创建存档' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 重命名模态框 -->
    <div v-if="showRenameModal" class="modal-overlay" @click="closeRenameModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ 重命名存档</h3>
          <button class="modal-close" @click="closeRenameModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新名称</label>
            <input 
              v-model="renameSaveName" 
              type="text" 
              placeholder="请输入新的存档名称"
              class="form-input"
              maxlength="20"
              @keyup.enter="confirmRename"
            />
            <div class="form-hint">最多20个字符</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeRenameModal">取消</button>
          <button 
            class="btn btn-green" 
            @click="confirmRename"
            :disabled="!renameSaveName.trim()"
          >
            确认重命名
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

import backIcon from '../assets/back.png'
import currentIcon from '../assets/current.png'
import timeIcon from '../assets/time.png'
import fireIcon from '../assets/fire.png'
import trophyIcon from '../assets/trophy.png'
import allIcon from '../assets/all.png'
import newIcon from '../assets/new.png'
import glodIcon from '../assets/glod.png'

const router = useRouter()
const gameStore = useGameStore()

// 模态框状态
const showCreateModal = ref(false)
const showRenameModal = ref(false)
const newSaveName = ref('')
const renameSaveName = ref('')
const renameTargetId = ref('')
const isCreating = ref(false)
const nameInput = ref(null)

// 存档数据
const currentSaveId = ref('')
const allSaves = ref([])
const currentSave = ref({})

// 监听存档变化，自动刷新数据
watch(() => gameStore.currentSaveId, () => {
  console.log('检测到存档ID变化，重新加载数据')
  loadSaveData()
}, { immediate: false })

// 加载存档数据
const loadSaveData = () => {
  console.log('🔄 开始加载存档数据...')
  
  try {
    // 获取所有存档
    const saves = gameStore.getAllSaves()
    const currentId = gameStore.getCurrentSaveId()
    
    console.log('📁 获取到存档列表:', {
      totalSaves: saves.length,
      currentId: currentId,
      saveNames: saves.map(s => s.name)
    })
    
    // 更新响应式数据
    allSaves.value = [...saves] // 创建新数组确保响应式更新
    currentSaveId.value = currentId
    
    // 找到当前存档
    const current = saves.find(s => s.id === currentId)
    if (current) {
      currentSave.value = {
        ...current,
        totalSessions: current.statistics?.totalSessions || 0,
        consecutiveDays: current.statistics?.consecutiveDays || 0
      }
      console.log('✅ 当前存档信息:', {
        id: current.id,
        name: current.name,
        totalCoins: current.totalCoins
      })
    } else {
      console.warn('⚠️ 未找到当前存档')
      currentSave.value = {}
    }
    
    console.log('✅ 存档数据加载完成')
  } catch (error) {
    console.error('❌ 加载存档数据失败:', error)
  }
}

// 计算属性
const getCompletedLevels = (save) => {
  if (!save.levels) return 0
  return save.levels.filter(l => l.completed).length
}

const getTotalLevels = (save) => {
  if (!save.levels) return 1
  return save.levels.length
}

// 方法
const formatDate = (dateString) => {
  if (!dateString) return '从未'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const switchSave = async (saveId) => {
  if (confirm('确定要切换到这个存档吗？当前游戏进度将被保存。')) {
    console.log('🔄 开始切换存档到:', saveId)
    
    try {
      gameStore.switchToSave(saveId)
      
      // 等待一下再刷新数据
      await nextTick()
      setTimeout(() => {
        loadSaveData()
      }, 100)
      
      showNotification('存档切换成功！', 'success')
    } catch (error) {
      console.error('❌ 切换存档失败:', error)
      showNotification('切换存档失败，请重试', 'error')
    }
  }
}

const createNewSave = async () => {
  const name = newSaveName.value.trim()
  if (!name || isCreating.value) return
  
  if (confirm(`确定要创建名为"${name}"的新存档吗？这将创建一个全新的游戏进度。`)) {
    console.log('🆕 开始创建新存档:', name)
    isCreating.value = true
    
    try {
      const newSaveId = gameStore.createNewSave(name)
      console.log('✅ 新存档创建成功，ID:', newSaveId)
      
      // 等待一下再刷新数据
      await nextTick()
      setTimeout(() => {
        loadSaveData()
        closeCreateModal()
        showNotification(`存档"${name}"创建成功并已切换！`, 'success')
      }, 100)
      
    } catch (error) {
      console.error('❌ 创建存档失败:', error)
      showNotification('创建存档失败，请重试', 'error')
    } finally {
      isCreating.value = false
    }
  } else {
    isCreating.value = false
  }
}

const renameSave = (save) => {
  renameTargetId.value = save.id
  renameSaveName.value = save.name
  showRenameModal.value = true
}

const confirmRename = () => {
  const newName = renameSaveName.value.trim()
  if (!newName) return
  
  console.log('✏️ 重命名存档:', renameTargetId.value, '新名称:', newName)
  
  try {
    gameStore.renameSave(renameTargetId.value, newName)
    loadSaveData()
    closeRenameModal()
    showNotification('存档重命名成功！', 'success')
  } catch (error) {
    console.error('❌ 重命名存档失败:', error)
    showNotification('重命名失败，请重试', 'error')
  }
}

const deleteSave = (saveId) => {
  const save = allSaves.value.find(s => s.id === saveId)
  if (!save) return
  
  if (confirm(`确定要删除存档"${save.name}"吗？此操作不可恢复！`)) {
    console.log('🗑️ 删除存档:', saveId)
    
    try {
      if (saveId === currentSaveId.value && allSaves.value.length > 1) {
        // 如果删除的是当前存档，先切换到其他存档
        const otherSave = allSaves.value.find(s => s.id !== saveId)
        gameStore.switchToSave(otherSave.id)
      }
      
      gameStore.deleteSave(saveId)
      loadSaveData()
      showNotification('存档删除成功！', 'success')
    } catch (error) {
      console.error('❌ 删除存档失败:', error)
      showNotification('删除存档失败，请重试', 'error')
    }
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newSaveName.value = ''
  isCreating.value = false
}

const closeRenameModal = () => {
  showRenameModal.value = false
  renameSaveName.value = ''
  renameTargetId.value = ''
}

// 监听模态框打开，自动聚焦输入框
watch(showCreateModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (nameInput.value) {
        nameInput.value.focus()
      }
    })
  }
})

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `
  
  // 添加动画样式
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
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
    if (document.head.contains(style)) {
      document.head.removeChild(style)
    }
  }, 3000)
}

const goHome = () => {
  router.push('/')
}

onMounted(() => {
  console.log('📱 SaveManager 组件已挂载，开始加载数据')
  loadSaveData()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 12px;
}

.current-save-info {
  margin-bottom: 32px;
}

.current-save-header {
  margin-bottom: 16px;
}

.current-save-header h2 {
  color: #374151;
  font-size: 24px;
  font-weight: bold;
}

.current-save-card {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
}

.saves-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  color: #374151;
  font-size: 24px;
  font-weight: bold;
}

.saves-count {
  color: #6b7280;
  font-size: 14px;
}

.no-saves {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  background: white;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
}

.no-saves-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-saves-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.no-saves-hint {
  font-size: 14px;
}

.saves-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.save-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.save-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.save-card.current {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
}

.save-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.save-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-name {
  font-size: 18px;
  font-weight: bold;
  color: #374151;
}

.current-badge {
  background: #8b5cf6;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.save-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  font-size: 12px;
  min-width: 60px;
}

.delete-btn {
  color: #ef4444;
  border-color: #ef4444;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.save-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.save-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #374151;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.save-progress {
  margin: 8px 0;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item span {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.progress-bar {
  background: #e5e7eb;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.save-date {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h3 {
  color: #374151;
  font-size: 20px;
  font-weight: bold;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 0 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  margin-top: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
}

.warning-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.warning-text {
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .saves-grid {
    grid-template-columns: 1fr;
  }
  
  .save-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .save-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}

.btn-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; vertical-align: -3px; }
.title-icon-img { width: 22px; height: 22px; object-fit: contain; vertical-align: -4px; margin-right: 8px; }
.stat-icon-img { width: 20px; height: 20px; object-fit: contain; margin-bottom: 4px; }
.inline-icon { width: 16px; height: 16px; object-fit: contain; margin-right: 6px; vertical-align: -3px; }
.title-with-icon { display: inline-flex; align-items: center; gap: 8px; }
.stat-line { display: inline-flex; align-items: center; gap: 6px; }


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
</style>
