<template>
  <div class="page-wrapper">
    <div class="container saves">
      <div class="saves-head">
        <h1 class="page-title">存档管理</h1>
        <button class="btn btn-green new-btn" @click="showCreateModal = true">
          <img class="btn-icon" :src="newIcon" alt="新建" />
          <span>{{ isCreating ? '创建中...' : '新建存档' }}</span>
        </button>
      </div>

      <!-- ===== Current save profile ===== -->
      <section class="current-card">
        <div class="current-left">
          <div class="current-avatar">
            <img :src="glodIcon" alt="" />
          </div>
          <div class="current-info">
            <div class="current-name">{{ currentSave.name || '未知存档' }}</div>
            <div class="current-meta">
              <span class="meta-chip"><img :src="glodIcon" alt="" />{{ currentSave.totalCoins || 0 }}</span>
              <span class="meta-chip"><img :src="timeIcon" alt="" />{{ (currentSave.statistics && currentSave.statistics.totalSessions) || 0 }} 次</span>
              <span class="meta-chip"><img :src="fireIcon" alt="" />{{ (currentSave.statistics && currentSave.statistics.consecutiveDays) || 0 }} 天</span>
            </div>
          </div>
        </div>
        <!-- progress ring -->
        <div class="current-ring">
          <svg viewBox="0 0 100 100" class="cr-svg">
            <circle class="cr-track" cx="50" cy="50" r="42" />
            <circle class="cr-progress" cx="50" cy="50" r="42"
              :stroke-dasharray="crCirc" :stroke-dashoffset="crOffset(currentSave)" />
          </svg>
          <span class="cr-num">{{ getCompletedLevels(currentSave) }}/{{ getTotalLevels(currentSave) }}</span>
        </div>
      </section>

      <!-- ===== All saves ===== -->
      <section class="all-section">
        <div class="all-head">
          <h2 class="duo-section-title">
            <img class="section-icon" :src="allIcon" alt="" /> 所有存档
          </h2>
          <span class="count">共 {{ allSaves.length }} 个</span>
        </div>

        <div v-if="allSaves.length === 0" class="empty">
          <div class="empty-icon">📁</div>
          <div class="empty-text">暂无存档</div>
          <div class="empty-hint">点击上方"新建存档"创建第一个</div>
        </div>

        <div v-else class="saves-grid">
          <div
            v-for="save in allSaves"
            :key="save.id"
            :class="['save-card', { current: save.id === currentSaveId }]"
          >
            <div class="save-top">
              <div class="save-name">{{ save.name }}</div>
              <div v-if="save.id === currentSaveId" class="current-pill">当前</div>
            </div>

            <div class="save-stats">
              <div class="stat">
                <img :src="glodIcon" alt="" />
                <strong>{{ save.totalCoins || 0 }}</strong>
                <span>金币</span>
              </div>
              <div class="stat">
                <img :src="timeIcon" alt="" />
                <strong>{{ (save.statistics && save.statistics.totalSessions) || 0 }}</strong>
                <span>次数</span>
              </div>
              <div class="stat">
                <img :src="fireIcon" alt="" />
                <strong>{{ (save.statistics && save.statistics.consecutiveDays) || 0 }}</strong>
                <span>连击</span>
              </div>
            </div>

            <div class="save-progress">
              <div class="sp-label">完成关卡 {{ getCompletedLevels(save) }}/{{ getTotalLevels(save) }}</div>
              <div class="sp-bar"><div class="sp-fill" :style="{ width: (getCompletedLevels(save) / getTotalLevels(save)) * 100 + '%' }"></div></div>
            </div>

            <div class="save-date">最后游戏: {{ formatDate(save.lastPlayDate) }}</div>

            <div class="save-actions">
              <button v-if="save.id !== currentSaveId" class="btn btn-outline mini" @click="switchSave(save.id)">切换</button>
              <button class="btn btn-outline mini" @click="renameSave(save)">重命名</button>
              <button v-if="allSaves.length > 1" class="btn btn-outline mini danger" @click="deleteSave(save.id)">删除</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ===== Create modal ===== -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新建存档</h3>
          <button class="modal-close" @click="closeCreateModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>存档名称</label>
            <input v-model="newSaveName" type="text" placeholder="请输入存档名称" class="form-input" maxlength="20" @keyup.enter="createNewSave" ref="nameInput" />
            <div class="form-hint">最多20个字符</div>
          </div>
          <div class="warning-box">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">新建存档将创建全新游戏进度，所有数据从零开始。</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeCreateModal">取消</button>
          <button class="btn btn-green" @click="createNewSave" :disabled="!newSaveName.trim() || isCreating">
            {{ isCreating ? '创建中...' : '创建存档' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Rename modal ===== -->
    <div v-if="showRenameModal" class="modal-overlay" @click="closeRenameModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>重命名存档</h3>
          <button class="modal-close" @click="closeRenameModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>新名称</label>
            <input v-model="renameSaveName" type="text" placeholder="请输入新的存档名称" class="form-input" maxlength="20" @keyup.enter="confirmRename" />
            <div class="form-hint">最多20个字符</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeRenameModal">取消</button>
          <button class="btn btn-green" @click="confirmRename" :disabled="!renameSaveName.trim()">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

import timeIcon from '../assets/time.svg'
import fireIcon from '../assets/fire.svg'
import allIcon from '../assets/all.svg'
import newIcon from '../assets/new.svg'
import glodIcon from '../assets/glod.png'

const router = useRouter()
const gameStore = useGameStore()

const showCreateModal = ref(false)
const showRenameModal = ref(false)
const newSaveName = ref('')
const renameSaveName = ref('')
const renameTargetId = ref('')
const isCreating = ref(false)
const nameInput = ref(null)

const currentSaveId = ref('')
const allSaves = ref([])
const currentSave = ref({})

watch(() => gameStore.currentSaveId, () => loadSaveData(), { immediate: false })

const loadSaveData = () => {
  try {
    const saves = gameStore.getAllSaves()
    const currentId = gameStore.getCurrentSaveId()
    allSaves.value = [...saves]
    currentSaveId.value = currentId
    const current = saves.find((s) => s.id === currentId)
    currentSave.value = current ? { ...current } : {}
  } catch (e) { console.error('加载存档失败:', e) }
}

const getCompletedLevels = (save) => (save.levels ? save.levels.filter((l) => l.completed).length : 0)
const getTotalLevels = (save) => (save.levels ? save.levels.length : 1)

const crCirc = 2 * Math.PI * 42
const crOffset = (save) => crCirc * (1 - getCompletedLevels(save) / getTotalLevels(save))

const formatDate = (d) => {
  if (!d) return '从未'
  const date = new Date(d)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const switchSave = async (saveId) => {
  if (!confirm('确定切换到这个存档？当前进度将被保存。')) return
  try {
    gameStore.switchToSave(saveId)
    await nextTick()
    setTimeout(loadSaveData, 100)
    toast('存档切换成功！', 'success')
  } catch (e) { toast('切换失败，请重试', 'error') }
}

const createNewSave = async () => {
  const name = newSaveName.value.trim()
  if (!name || isCreating.value) return
  if (!confirm(`确定创建名为"${name}"的新存档？`)) { isCreating.value = false; return }
  isCreating.value = true
  try {
    gameStore.createNewSave(name)
    await nextTick()
    setTimeout(() => { loadSaveData(); closeCreateModal(); toast(`存档"${name}"创建成功！`, 'success') }, 100)
  } catch (e) { toast('创建失败，请重试', 'error') } finally { isCreating.value = false }
}

const renameSave = (save) => { renameTargetId.value = save.id; renameSaveName.value = save.name; showRenameModal.value = true }
const confirmRename = () => {
  const newName = renameSaveName.value.trim()
  if (!newName) return
  try { gameStore.renameSave(renameTargetId.value, newName); loadSaveData(); closeRenameModal(); toast('重命名成功！', 'success') }
  catch (e) { toast('重命名失败，请重试', 'error') }
}

const deleteSave = (saveId) => {
  const save = allSaves.value.find((s) => s.id === saveId)
  if (!save) return
  if (!confirm(`确定删除存档"${save.name}"？此操作不可恢复！`)) return
  try {
    if (saveId === currentSaveId.value && allSaves.value.length > 1) {
      gameStore.switchToSave(allSaves.value.find((s) => s.id !== saveId).id)
    }
    gameStore.deleteSave(saveId)
    loadSaveData()
    toast('存档删除成功！', 'success')
  } catch (e) { toast('删除失败，请重试', 'error') }
}

const closeCreateModal = () => { showCreateModal.value = false; newSaveName.value = ''; isCreating.value = false }
const closeRenameModal = () => { showRenameModal.value = false; renameSaveName.value = ''; renameTargetId.value = '' }

watch(showCreateModal, (v) => { if (v) nextTick(() => nameInput.value?.focus()) })

const toast = (msg, type = 'info') => {
  const n = document.createElement('div')
  n.textContent = msg
  n.style.cssText = `position:fixed;top:72px;right:20px;background:${type === 'success' ? '#58cc02' : type === 'error' ? '#ff4b4b' : '#1cb0f6'};color:#fff;padding:12px 20px;border-radius:16px;border-bottom:4px solid ${type === 'success' ? '#58a700' : type === 'error' ? '#ea2b2b' : '#1899d6'};z-index:1000;font-weight:800;`
  document.body.appendChild(n)
  setTimeout(() => document.body.contains(n) && document.body.removeChild(n), 3000)
}

onMounted(loadSaveData)
</script>

<style scoped>
.saves { display: flex; flex-direction: column; gap: 22px; }
.saves-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.page-title { font-family: 'Fredoka','Nunito',sans-serif; font-size: 30px; font-weight: 700; color: var(--duo-ink); }
.new-btn { margin: 0; }
.btn-icon { width: 18px; height: 18px; object-fit: contain; margin-right: 6px; }
.section-icon { width: 24px; height: 24px; object-fit: contain; }

/* Current card */
.current-card {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: var(--duo-green); color: #fff;
  border-radius: 22px; border-bottom: 6px solid var(--duo-green-shadow);
  padding: 22px 24px; flex-wrap: wrap;
}
.current-left { display: flex; align-items: center; gap: 16px; }
.current-avatar { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.current-avatar img { width: 32px; height: 32px; object-fit: contain; }
.current-name { font-family: 'Fredoka','Nunito',sans-serif; font-size: 22px; font-weight: 700; }
.current-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.meta-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.2); border-radius: 999px; padding: 4px 10px; font-size: 13px; font-weight: 800; }
.meta-chip img { width: 16px; height: 16px; object-fit: contain; }

.current-ring { position: relative; width: 84px; height: 84px; flex-shrink: 0; }
.cr-svg { width: 84px; height: 84px; transform: rotate(-90deg); }
.cr-track { fill: none; stroke: rgba(255,255,255,0.3); stroke-width: 9; }
.cr-progress { fill: none; stroke: #fff; stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
.cr-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Fredoka','Nunito',sans-serif; font-weight: 700; font-size: 16px; }

/* All section */
.all-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.count { font-size: 14px; color: var(--duo-muted); font-weight: 700; }

.empty { text-align: center; padding: 50px 20px; color: var(--duo-muted); background: #fff; border-radius: 22px; border: 2px dashed var(--duo-border); }
.empty-icon { font-size: 44px; margin-bottom: 12px; }
.empty-text { font-size: 18px; font-weight: 800; }
.empty-hint { font-size: 14px; margin-top: 4px; }

.saves-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.save-card {
  background: #fff; border: 2px solid var(--duo-border); border-bottom: 5px solid var(--duo-border);
  border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 14px;
  transition: filter 0.1s, transform 0.08s, border-color 0.15s, border-bottom-width 0.08s;
}
.save-card:hover { filter: brightness(1.02); }
.save-card.current { border-color: var(--duo-green); border-bottom-color: var(--duo-green-shadow); background: #f4fce8; }

.save-top { display: flex; align-items: center; justify-content: space-between; }
.save-name { font-weight: 800; font-size: 18px; color: var(--duo-ink); }
.current-pill { background: var(--duo-green); color: #fff; border: 2px solid var(--duo-green-shadow); border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 800; }

.save-stats { display: flex; justify-content: space-between; gap: 10px; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.stat img { width: 22px; height: 22px; object-fit: contain; }
.stat strong { font-size: 18px; font-weight: 800; color: var(--duo-ink); }
.stat span { font-size: 11px; color: var(--duo-muted); font-weight: 700; }

.save-progress { display: flex; flex-direction: column; gap: 6px; }
.sp-label { font-size: 13px; font-weight: 800; color: var(--duo-ink); }
.sp-bar { background: var(--duo-border); border-radius: 999px; height: 10px; overflow: hidden; }
.sp-fill { background: linear-gradient(90deg, var(--duo-green), var(--duo-green-hover)); height: 100%; border-radius: 999px; transition: width 0.3s ease; }

.save-date { font-size: 12px; color: var(--duo-muted); font-weight: 600; }

.save-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mini { margin: 0; padding: 8px 14px; font-size: 13px; border-radius: 12px; flex: 1; min-width: 70px; }
.danger { color: var(--duo-red); border-color: var(--duo-red) !important; border-bottom-color: var(--duo-red-shadow) !important; }
.danger:hover { background: #ffe0e0; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(60,60,60,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #fff; border-radius: 24px; border: 2px solid var(--duo-border); box-shadow: 0 10px 0 var(--duo-border); max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 22px 0; border-bottom: 2px solid var(--duo-border); margin-bottom: 20px; }
.modal-header h3 { font-family: 'Fredoka','Nunito',sans-serif; font-size: 20px; font-weight: 700; color: var(--duo-ink); }
.modal-close { background: none; border: 2px solid transparent; font-size: 18px; color: var(--duo-muted); cursor: pointer; padding: 4px 10px; border-radius: 10px; font-weight: 800; }
.modal-close:hover { background: var(--duo-card); border-color: var(--duo-border); }
.modal-body { padding: 0 22px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 22px; border-top: 2px solid var(--duo-border); margin-top: 20px; }
.modal-footer .btn { margin: 0; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 800; color: var(--duo-ink); }
.form-input { width: 100%; padding: 14px 16px; border: 2px solid var(--duo-border); border-bottom: 4px solid var(--duo-border); border-radius: 14px; font-size: 16px; font-family: 'Nunito',sans-serif; transition: border-color 0.15s; box-sizing: border-box; }
.form-input:focus { outline: none; border-color: var(--duo-blue); border-bottom-color: var(--duo-blue-shadow); }
.form-hint { margin-top: 4px; font-size: 12px; color: var(--duo-muted); }
.warning-box { display: flex; gap: 12px; background: #fff8d6; border: 2px solid var(--duo-yellow); border-radius: 14px; padding: 14px; }
.warning-icon { font-size: 20px; flex-shrink: 0; }
.warning-text { color: #6b5400; font-size: 14px; line-height: 1.5; font-weight: 600; }

@media (max-width: 480px) {
  .saves-grid { grid-template-columns: 1fr; }
  .save-actions { flex-direction: column; }
  .mini { width: 100%; }
}
</style>
