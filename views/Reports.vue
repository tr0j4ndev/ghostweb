<template>

<div class="page-wrapper">

  <div v-if="!isAuthenticated" class="password-overlay">

    <div class="password-modal">

      <div v-if="isFirstTime" class="password-header">

        <h2>

          <img class="title-icon-img" :src="lockIcon" alt="家长验证" />

          <span>设置家长密码</span>

        </h2>

        <p>首次使用，请设置密码和预留手机号来保护训练报告</p>

      </div>

      <div v-else-if="showForgotPassword" class="password-header">

        <h2>

          <img class="title-icon-img" :src="lockIcon" alt="家长验证" />

          <span>找回密码</span>

        </h2>

        <p>请输入设置密码时预留的手机号</p>

      </div>

      <div v-else class="password-header">

        <h2>

          <img class="title-icon-img" :src="lockIcon" alt="家长验证" />

          <span>家长验证</span>

        </h2>

        <p>请输入密码查看训练报告</p>

      </div>

      <div class="password-form">

        <div v-if="isFirstTime">

          <input

            v-model="passwordInput"

            type="password"

            placeholder="请设置密码（至少6位）"

            class="password-input"

            @keyup.enter="setNewPassword()"

          />

          <input

            v-model="confirmPassword"

            type="password"

            placeholder="请确认密码"

            class="password-input"

            @keyup.enter="setNewPassword"

          />

          <input

            v-model="phoneNumber"

            type="tel"

            placeholder="请输入手机号（用于找回密码）"

            class="password-input"

            maxlength="11"

            @keyup.enter="setNewPassword"

          />

          <button class="btn btn-green" @click="setNewPassword()">

            确认设置

          </button>

        </div>

        <div v-else-if="showForgotPassword">

          <input

            v-model="forgotPhoneInput"

            type="tel"

            placeholder="请输入预留手机号"

            class="password-input"

            maxlength="11"

            @keyup.enter="verifyPhone"

          />

          <div v-if="phoneVerified" class="phone-verified">

            <div class="success-message">✅ 手机号验证成功</div>

            <input

              v-model="newPasswordInput"

              type="password"

              placeholder="请输入新密码（至少6位）"

              class="password-input"

              @keyup.enter="resetPassword"

            />

            <input

              v-model="confirmNewPassword"

              type="password"

              placeholder="请确认新密码"

              class="password-input"

              @keyup.enter="resetPassword"

            />

            <button class="btn btn-green" @click="resetPassword">

              重置密码

            </button>

          </div>

          <button v-else class="btn btn-green" @click="verifyPhone">

            验证手机号

          </button>

          <button class="btn btn-outline" @click="backToLogin">

            返回登录

          </button>

        </div>

        <div v-else>

          <input

            v-model="passwordInput"

            type="password"

            placeholder="请输入密码"

            class="password-input"

            @keyup.enter="verifyPassword()"

          />

          <button class="btn btn-green" @click="verifyPassword()">

            验证

          </button>

          <button class="btn btn-outline forgot-btn" @click="showForgotPassword = true">

            忘记密码？

          </button>

        </div>

        <button class="btn btn-outline" @click="goHome">

          <img class="btn-icon" :src="backIcon" alt="返回主页" />

          返回主页

        </button>

      </div>

      <div v-if="passwordError" class="password-error">

        {{ passwordError }}

      </div>

      <div v-if="isFirstTime" class="password-hint">

        <small>密码和手机号将用于保护孩子的训练数据，请妥善保管。手机号用于找回密码。</small>

      </div>

    </div>

  </div>

  <div v-else>

    <div class="custom-header no-print no-export">

      <button class="btn btn-outline custom-back-button" @click="goHome">

        <img class="btn-icon" :src="backIcon" alt="返回主页" />

        返回主页

      </button>

      <div class="overview-header">

      <div class="header-title">

        <span>专注力训练报告</span>

      </div>

      <div class="report-date">

        生成时间: {{ formatDate(new Date()) }}

      </div>

      </div>

      

      <div class="header-actions">

        <button class="btn btn-outline export-btn" @click="exportToPDF" :disabled="isExporting">

          <img class="btn-icon" :src="pdfIcon" alt="导出PDF" />

          <span>{{ isExporting ? '导出中...' : '导出PDF' }}</span>

        </button>

      </div>

    </div>

    <div class="main-scroll-area">

      <div class="container report-container" ref="reportContent">

        <div class="report-overview">

          <div class="stats-grid">

            <div class="stat-card primary">

              <img class="stat-icon-img" :src="timeIcon" alt="训练次数" />

              <div class="stat-content">

                <div class="stat-number">{{ statistics.totalSessions || 0 }}</div>

                <div class="stat-label">训练次数</div>

              </div>

            </div>

            <div class="stat-card warning">

              <img class="stat-icon-img" :src="fireIcon" alt="连续训练天数" />

              <div class="stat-content">

                <div class="stat-number">{{ statistics.consecutiveDays || 0 }}</div>

                <div class="stat-label">连续训练天数</div>

              </div>

            </div>

            <div class="stat-card info">

              <img class="stat-icon-img" :src="trophyIcon" alt="最佳连续记录" />

              <div class="stat-content">

                <div class="stat-number">{{ statistics.bestStreak || 0 }}</div>

                <div class="stat-label">最佳连续记录</div>

              </div>

            </div>

            <div class="stat-card success">

              <img class="stat-icon-img" :src="fruitIcon" alt="总苹果数量" />

              <div class="stat-content">

                <div class="stat-number">{{ statistics.totalApplesCaught || 0 }}</div>

                <div class="stat-label">总苹果数量</div>

              </div>

            </div>

          </div>

        </div>

        <div class="charts-section">

          <div class="section-header">

            <h2>

              <img class="title-icon-img" :src="tendencyIcon" alt="训练趋势分析" />

              <span>训练趋势分析</span>

            </h2>

            <div class="time-filter no-print no-export">

              <button

                v-for="period in timePeriods"

                :key="period.value"

                :class="['filter-btn', selectedPeriod === period.value ? 'active' : '']"

                @click="selectPeriod(period.value)"

              >

                {{ period.label }}

              </button>

            </div>

          </div>

          <div class="charts-grid">

            <div class="chart-card">

              <h3>得分趋势</h3>

              <canvas ref="scoreChart" width="400" height="200"></canvas>

            </div>

            <div class="chart-card">

              <h3>准确率变化</h3>

              <canvas ref="accuracyChart" width="400" height="200"></canvas>

            </div>

            <div class="chart-card">

              <h3>关卡分布</h3>

              <canvas ref="levelChart" width="400" height="200"></canvas>

            </div>

          </div>

        </div>

        <div class="records-section">

          <div class="section-header">

            <h2>

              <img class="title-icon-img" :src="reportIcon" alt="训练记录详情" />

              <span>训练记录详情</span>

            </h2>

            <div class="records-filter no-print no-export">

              <select v-model="selectedLevelFilter" class="filter-select">

                <option value="">所有关卡</option>

                <option v-for="level in availableLevels" :key="level.id" :value="level.id">

                  {{ level.name }}

                </option>

              </select>

            </div>

          </div>

          <div class="table-container">

            <table class="records-table">

              <thead>

                <tr>

                  <th>日期时间</th>

                  <th>关卡</th>

                  <th>得分</th>

                  <th>金币</th>

                  <th>准确率</th>

                  <th>最高连击</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="record in filteredRecords" :key="record.id">

                  <td>{{ formatDateTime(record.date) }}</td>

                  <td>

                    <span class="level-badge">{{ record.levelName }}</span>

                  </td>

                  <td class="score-cell">{{ record.score }}</td>

                  <td class="coins-cell">

                    <img class="coins-icon-img" :src="glodIcon" alt="金币" />

                    <span>{{ record.coinsEarned }}</span>

                  </td>

                  <td>

                    <div class="accuracy-bar">

                      <div class="accuracy-fill" :style="{ width: record.accuracy + '%' }"></div>

                      <span class="accuracy-text">{{ record.accuracy }}%</span>

                    </div>

                  </td>

                  <td class="combo-cell">{{ record.maxCombo }}</td>

                </tr>

              </tbody>

            </table>

            <div v-if="filteredRecords.length === 0" class="no-records">

              <div class="no-records-icon">📝</div>

              <div class="no-records-text">暂无训练记录</div>

              <div class="no-records-hint">开始游戏后这里会显示详细的训练数据</div>

            </div>

          </div>

        </div>

        <div class="suggestions-section">

          <div class="section-header">

            <h2>

              <img class="title-icon-img" :src="hintIcon" alt="训练建议" />

              <span>训练建议</span>

            </h2>

          </div>

          <div class="suggestions-content">

            <div

              v-for="suggestion in suggestions"

              :key="suggestion.type"

              :class="['suggestion-card', suggestion.type]"

            >

              <img class="suggestion-icon-img" :src="getSuggestionIcon(suggestion)" alt="建议" />

              <div class="suggestion-text">

                <div class="suggestion-title">{{ suggestion.title }}</div>

                <div class="suggestion-desc">{{ suggestion.description }}</div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>

</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

/* 新增：PNG 图标 */
import lockIcon from '../assets/lock.png'
import backIcon from '../assets/back.png'
import storeIcon from '../assets/store.png' // 供需要时使用
import timeIcon from '../assets/time.png'
import fireIcon from '../assets/fire.png'
import trophyIcon from '../assets/trophy.png'
import fruitIcon from '../assets/fruit.png'
import tendencyIcon from '../assets/tendency.png'
import reportIcon from '../assets/report.png'
import glodIcon from '../assets/glod.png'
import hintIcon from '../assets/hint.png'
import challengeIcon from '../assets/challenge.png'
import pdfIcon from '../assets/pdf.png'

import habitPng from '../assets/habit.png'
import accuracyPng from '../assets/accuracy.png'
import insistPng from '../assets/insist.png'

export default {
  setup() {
    const reportImages = ref({})
    const iconsLoaded = ref(false)
    const loadImage = (key, src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      }).then((img) => {
        reportImages.value[key] = img
        return img
      })
    }
    const ensureReportImages = async () => {
      if (iconsLoaded.value) return
      const sources = [
        ['report', reportIcon],
        ['time', timeIcon],
        ['fire', fireIcon],
        ['trophy', trophyIcon],
        ['fruit', fruitIcon],
        ['coin', glodIcon],
        ['hint', hintIcon],
        ['challenge', challengeIcon],
        ['tendency', tendencyIcon],
      ]
      await Promise.all(sources.map(([k, s]) => loadImage(k, s)))
      iconsLoaded.value = true
    }

    const router = useRouter()
    const gameStore = useGameStore()
    
    // 认证相关
    const isAuthenticated = ref(false)
    const passwordInput = ref('')
    const passwordError = ref('')
    const isFirstTime = ref(false)
    const confirmPassword = ref('')
    const phoneNumber = ref('')
    
    // 忘记密码相关
    const showForgotPassword = ref(false)
    const forgotPhoneInput = ref('')
    const phoneVerified = ref(false)
    const newPasswordInput = ref('')
    const confirmNewPassword = ref('')
    
    // 导出状态
    const isExporting = ref(false)
    
    // 数据相关
    const reportContent = ref(null)
    const selectedPeriod = ref(7)
    const selectedLevelFilter = ref('')
    
    // 图表引用
    const scoreChart = ref(null)
    const accuracyChart = ref(null)
    const levelChart = ref(null)
    
    // 时间周期选项
    const timePeriods = [
      { label: '最近7天', value: 7 },
      { label: '最近30天', value: 30 },
      { label: '最近90天', value: 90 },
      { label: '全部', value: 365 }
    ]
    
    // 计算属性
    const statistics = computed(() => gameStore.statistics)
    const trainingRecords = computed(() => gameStore.trainingRecords)
    const filteredRecords = computed(() => {
      let records = [...trainingRecords.value]
      if (selectedLevelFilter.value) {
        records = records.filter(r => r.levelId == selectedLevelFilter.value)
      }
      return records.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50)
    })
    const availableLevels = computed(() => {
      const levelIds = [...new Set(trainingRecords.value.map(r => r.levelId))]
      return levelIds.map(id => {
        const level = gameStore.gameData.levels.find(l => l.id === id)
        return level || { id, name: `关卡 ${id}` }
      })
    })
    const suggestions = computed(() => {
      const stats = statistics.value
      const recentRecords = gameStore.getRecentRecords(7)
      const suggestions = []
      
      if (stats.consecutiveDays < 30) {
        suggestions.push({
          type: 'info',
          title: '建立训练习惯',
          description: '建议每天进行10-15分钟的专注力训练，有助于建立良好的学习习惯。'
        })
      }
      
      if (recentRecords.length > 0) {
        const avgAccuracy = recentRecords.reduce((sum, r) => sum + r.accuracy, 0) / recentRecords.length
        if (avgAccuracy < 70) {
          suggestions.push({
            type: 'warning',
            title: '提高准确率',
            description: '当前准确率偏低，建议放慢速度，专注于精确控制而非速度。'
          })
        }
      }
      
      if (stats.totalSessions > 30) {
        suggestions.push({
          type: 'success',
          title: '尝试挑战模式',
          description: '基础训练表现不错！可以尝试干扰物关卡或多目标追踪来提升难度。'
        })
      }
      
      if (suggestions.length >= 0) {
        suggestions.push({
          type: 'info',
          title: '保持训练',
          description: '继续保持良好的训练状态，专注力会随着练习不断提升！'
        })
      }
      
      return suggestions
    })
    const getSuggestionIcon = (s) => {
      const title = s?.title || ''
      if (title.includes('建立训练习惯')) return habitPng
      if (title.includes('提高准确率')) return accuracyPng
      if (title.includes('保持训练')) return insistPng
      if (title.includes('尝试挑战模式')) return challengeIcon
      return hintIcon
    }
    
    const selectPeriod = (period) => {
      selectedPeriod.value = period
      nextTick(() => {
        updateCharts()
      })
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }
    
    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('zh-CN')
    }
    
    // 图表相关方法
    const initCharts = () => {
      drawScoreChart()
      drawAccuracyChart()
      drawLevelChart()
    }
    
    const updateCharts = () => {
      initCharts()
    }
    
    const drawScoreChart = () => {
      const canvas = scoreChart.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const recentRecords = [...trainingRecords.value]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-20)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (recentRecords.length === 0) {
        drawNoDataMessage(ctx, canvas, '暂无得分数据')
        return
      }
      
      const padding = 40
      const chartWidth = canvas.width - padding * 2
      const chartHeight = canvas.height - padding * 2
      const maxScore = Math.max(...recentRecords.map(r => r.score), 100)
      
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()
      
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - (i / 5) * chartHeight
        const value = Math.round((i / 5) * maxScore)
        ctx.fillText(value.toString(), padding - 5, y + 3)
      }
      
      const barWidth = Math.max(chartWidth / recentRecords.length * 0.8, 8)
      const barSpacing = chartWidth / recentRecords.length * 0.2
      
      recentRecords.forEach((record, index) => {
        const x = padding + index * (chartWidth / recentRecords.length) + barSpacing / 2
        const barHeight = (record.score / maxScore) * chartHeight
        const y = canvas.height - padding - barHeight
        
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding)
        gradient.addColorStop(0, '#8b5cf6')
        gradient.addColorStop(1, '#7c3aed')
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)
        
        if (barWidth > 15) {
          ctx.fillStyle = '#374151'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`${record.score}`, x + barWidth / 2, y - 5)
        }
      })
      
      ctx.fillStyle = '#374151'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.font = '10px sans-serif'
      ctx.fillText('游戏次数', canvas.width / 2, canvas.height - 5)
      
      ctx.save()
      ctx.translate(15, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('得分', 0, 0)
      ctx.restore()
    }
    
    const drawAccuracyChart = () => {
      const canvas = accuracyChart.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const recentRecords = [...trainingRecords.value]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-20)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (recentRecords.length === 0) {
        drawNoDataMessage(ctx, canvas, '暂无准确率数据')
        return
      }
      
      const padding = 40
      const chartWidth = canvas.width - padding * 2
      const chartHeight = canvas.height - padding * 2
      
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, canvas.height - padding)
      ctx.lineTo(canvas.width - padding, canvas.height - padding)
      ctx.stroke()
      
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - (i / 5) * chartHeight
        const value = Math.round((i / 5) * 100)
        ctx.fillText(`${value}%`, padding - 5, y + 3)
      }
      
      const barWidth = Math.max(chartWidth / recentRecords.length * 0.8, 8)
      const barSpacing = chartWidth / recentRecords.length * 0.2
      
      recentRecords.forEach((record, index) => {
        const x = padding + index * (chartWidth / recentRecords.length) + barSpacing / 2
        const barHeight = (record.accuracy / 100) * chartHeight
        const y = canvas.height - padding - barHeight
        
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding)
        gradient.addColorStop(0, '#10b981')
        gradient.addColorStop(1, '#059669')
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)
        
        if (barWidth > 15) {
          ctx.fillStyle = '#374151'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`${record.accuracy}%`, x + barWidth / 2, y - 5)
        }
      })
      
      ctx.fillStyle = '#374151'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.font = '10px sans-serif'
      ctx.fillText('游戏次数', canvas.width / 2, canvas.height - 5)
      
      ctx.save()
      ctx.translate(15, canvas.height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('准确率(%)', 0, 0)
      ctx.restore()
    }
    
const drawLevelChart = () => {
  const canvas = levelChart.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const records = gameStore.getRecentRecords(selectedPeriod.value);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (records.length === 0) {
    drawNoDataMessage(ctx, canvas, '暂无关卡数据');
    return;
  }
  
  // 获取关卡列表
  const levels = gameStore.gameData.levels;
  
  // 初始化四个类别的计数器
  const categoryCounts = {
    '基础关卡': 0,
    '特殊关卡': 0,
    '无限模式（基础）': 0,
    '无限模式（特殊）': 0
  };
  
  // 统计每个类别的游戏次数
  records.forEach(record => {
    const level = levels.find(l => l.id === record.levelId);
    if (!level) return;
    
    if (level.mode === 'timed') {
      categoryCounts['基础关卡']++;
    } else if (level.mode === 'interference' || level.mode === 'multi-target') {
      categoryCounts['特殊关卡']++;
    } else if (level.mode === 'endless') {
      if (level.shape === 'circle' || level.shape === 'square' || level.shape === 'triangle') {
        categoryCounts['无限模式（基础）']++;
      } else {
        categoryCounts['无限模式（特殊）']++;
      }
    }
  });
  
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    drawNoDataMessage(ctx, canvas, '暂无关卡数据');
    return;
  }
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 + 10;
  const radius = Math.min(canvas.width, canvas.height) / 3;
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  let currentAngle = -Math.PI / 2;
  
  // 只绘制有数据的类别
  Object.entries(categoryCounts).forEach(([category, count], index) => {
    if (count === 0) return;
    
    const percentage = count / total;
    const sliceAngle = percentage * 2 * Math.PI;
    
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
    const labelY = centerY + Math.sin(labelAngle) * (radius + 25);
    
    ctx.fillStyle = '#374151';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${category}`, labelX, labelY);
    ctx.fillText(`${count}次`, labelX, labelY + 12);
    ctx.fillText(`${Math.round(percentage * 100)}%`, labelX, labelY + 24);
    
    currentAngle += sliceAngle;
  });
  
  ctx.fillStyle = '#374151';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
}
    
    const drawNoDataMessage = (ctx, canvas, message) => {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(message, canvas.width / 2, canvas.height / 2)
    }
    
    // 直接下载PDF功能
    const exportToPDF = async () => {
      if (isExporting.value) return
      try {
        isExporting.value = true
        const printStyles = document.createElement('style')
        printStyles.textContent = `
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            body * {
              visibility: hidden;
            }
            .report-container, .report-container * {
              visibility: visible;
            }
            .report-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-size: 12px !important;
            }
            .no-print, .no-export {
              display: none !important;
            }
            .charts-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 20px !important;
              page-break-inside: avoid;
            }
            .chart-card {
              page-break-inside: avoid;
              margin-bottom: 20px;
            }
            .records-section {
              page-break-before: always;
            }
            .suggestions-section {
              page-break-before: always;
            }
          }
        `
        document.head.appendChild(printStyles)
        setTimeout(() => {
          window.print()
          setTimeout(() => {
            document.head.removeChild(printStyles)
            isExporting.value = false
          }, 1000)
        }, 100)
        showNotification('请在打印对话框中选择"保存为PDF"', 'info')
      } catch (error) {
        console.error('PDF导出失败:', error)
        showNotification('PDF导出失败，请重试', 'error')
        isExporting.value = false
      }
    }
    
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
        max-width: 350px;
        word-wrap: break-word;
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
    
    const goHome = () => {
      router.push('/')
    }
    
    const setNewPassword = () => {
      if (passwordInput.value.length < 6) {
        passwordError.value = '密码长度至少6位'
        return
      }
      if (passwordInput.value !== confirmPassword.value) {
        passwordError.value = '两次输入的密码不一致'
        return
      }
      if (!phoneNumber.value || phoneNumber.value.length !== 11) {
        passwordError.value = '请输入正确的11位手机号'
        return
      }
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phoneNumber.value)) {
        passwordError.value = '请输入正确的手机号格式'
        return
      }
      
      localStorage.setItem('parent-password', passwordInput.value)
      localStorage.setItem('parent-phone', phoneNumber.value)
      isAuthenticated.value = true
      passwordError.value = ''
      isFirstTime.value = false
      showNotification('密码和手机号设置成功！', 'success')
      nextTick(() => {
        initCharts()
      })
    }
    
    const verifyPassword = () => {
      const savedPassword = localStorage.getItem('parent-password')
      if (passwordInput.value === savedPassword) {
        isAuthenticated.value = true
        passwordError.value = ''
        nextTick(() => {
          initCharts()
        })
      } else {
        passwordError.value = '密码错误，请重试'
        passwordInput.value = ''
      }
    }
    
    const verifyPhone = () => {
      const savedPhone = localStorage.getItem('parent-phone')
      if (!savedPhone) {
        passwordError.value = '未找到预留手机号，请联系管理员'
        return
      }
      if (forgotPhoneInput.value === savedPhone) {
        phoneVerified.value = true
        passwordError.value = ''
      } else {
        passwordError.value = '手机号不匹配，请重试'
        forgotPhoneInput.value = ''
      }
    }
    
    const resetPassword = () => {
      if (newPasswordInput.value.length < 6) {
        passwordError.value = '新密码长度至少6位'
        return
      }
      if (newPasswordInput.value !== confirmNewPassword.value) {
        passwordError.value = '两次输入的新密码不一致'
        return
      }
      
      localStorage.setItem('parent-password', newPasswordInput.value)
      showNotification('密码重置成功！', 'success')
      showForgotPassword.value = false
      phoneVerified.value = false
      forgotPhoneInput.value = ''
      newPasswordInput.value = ''
      confirmNewPassword.value = ''
      passwordError.value = ''
      isAuthenticated.value = true
      nextTick(() => {
        initCharts()
      })
    }
    
    const backToLogin = () => {
      showForgotPassword.value = false
      phoneVerified.value = false
      forgotPhoneInput.value = ''
      newPasswordInput.value = ''
      confirmNewPassword.value = ''
      passwordError.value = ''
    }
    
    const mounted = () => {
      gameStore.loadGameData()
      const savedPassword = localStorage.getItem('parent-password')
      const savedPhone = localStorage.getItem('parent-phone')
      // 首次：需要设置密码与手机号；否则：需要输入密码进行验证
      isFirstTime.value = !savedPassword || !savedPhone
      isAuthenticated.value = false
      // 注意：不再在此处自动 initCharts；通过 setNewPassword/verifyPassword/resetPassword 成功后再初始化
    }
    
    onMounted(mounted)
    
    return {
      reportImages,
      iconsLoaded,
      router,
      gameStore,
      isAuthenticated,
      passwordInput,
      passwordError,
      isFirstTime,
      confirmPassword,
      phoneNumber,
      showForgotPassword,
      forgotPhoneInput,
      phoneVerified,
      newPasswordInput,
      confirmNewPassword,
      isExporting,
      reportContent,
      selectedPeriod,
      selectedLevelFilter,
      scoreChart,
      accuracyChart,
      levelChart,
      timePeriods,
      statistics,
      trainingRecords,
      filteredRecords,
      availableLevels,
      suggestions,
      getSuggestionIcon,
      selectPeriod,
      formatDate,
      formatDateTime,
      initCharts,
      updateCharts,
      drawScoreChart,
      drawAccuracyChart,
      drawLevelChart,
      drawNoDataMessage,
      exportToPDF,
      showNotification,
      goHome,
      setNewPassword,
      verifyPassword,
      verifyPhone,
      resetPassword,
      backToLogin,
      lockIcon,
      backIcon,
      storeIcon,
      timeIcon,
      fireIcon,
      trophyIcon,
      fruitIcon,
      tendencyIcon,
      reportIcon,
      glodIcon,
      hintIcon,
      challengeIcon,
      pdfIcon
    }
  }
}
</script>

<style scoped>
/* 图标通用 */
.btn-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 6px;
  vertical-align: -3px;
}

.title-icon-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  vertical-align: -4px;
  margin-right: 8px;
}

.white-icon {
  filter: brightness(0) invert(1);
}

.stat-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  opacity: 0.95;
}

.coins-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 6px;
  vertical-align: -2px;
}

.suggestion-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 基础样式 */
.report-container {
  max-width: 100%;
  margin: 0 auto;
}

.no-print, .no-export {}

/* 密码验证样式 */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.password-modal {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.password-header h2 {
  color: #374151;
  margin-bottom: 8px;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.password-header p {
  color: #6b7280;
  margin-bottom: 24px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-input {
  width: 85%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
}

.password-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.password-error {
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
}

.password-hint {
  margin-top: 16px;
  color: #9ca3af;
}

.forgot-btn {
  background: transparent;
  color: #8b5cf6;
  border: 1px solid #8b5cf6;
  font-size: 14px;
}

.forgot-btn:hover {
  background: #f3e8ff;
}

.phone-verified {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.success-message {
  color: #10b981;
  font-weight: 600;
  padding: 8px;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}

/* 头部样式 */
.header-title-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.export-btn {
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 报告内容样式 */
.report-overview {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
}

.overview-header {
  text-align: center;
  margin-bottom: 32px;
}

.report-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.report-date {
  opacity: 0.9;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  color: #374151;
  font-size: 24px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.time-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #8b5cf6;
}

.filter-btn.active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.chart-card h3 {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

.chart-card canvas {
  width: 100%;
  height: 200px;
}

/* 记录表格样式 */
.records-section {
  margin-bottom: 32px;
}

.records-filter {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th {
  background: #f9fafb;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.records-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.level-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.score-cell {
  font-weight: 600;
  color: #059669;
}

.coins-cell {
  color: #d97706;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.combo-cell {
  color: #dc2626;
  font-weight: 600;
}

.accuracy-bar {
  position: relative;
  background: #f3f4f6;
  border-radius: 8px;
  height: 20px;
  min-width: 80px;
}

.accuracy-fill {
  background: linear-gradient(90deg, #10b981, #059669);
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease;
}

.accuracy-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.no-records {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.no-records-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-records-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.no-records-hint {
  font-size: 14px;
}

/* 建议样式 */
.suggestions-section {
  margin-bottom: 32px;
}

.suggestions-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-left: 4px solid;
}

.suggestion-card.info {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.suggestion-card.warning {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.suggestion-card.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

/* 打印样式 */
@media print {
  @page {
    size: A4;
    margin: 1cm;
  }
  body * {
    visibility: hidden;
  }
  .report-container, .report-container * {
    visibility: visible;
  }
  .report-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    font-size: 12px !important;
  }
  .no-print, .no-export {
    display: none !important;
  }
  .charts-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 20px !important;
    page-break-inside: avoid;
  }
  .chart-card {
    page-break-inside: avoid;
    margin-bottom: 20px;
  }
  .records-section {
    page-break-before: always;
  }
  .suggestions-section {
    page-break-before: always;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  .export-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .chart-card canvas {
    height: 150px;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .time-filter {
    width: 100%;
    justify-content: center;
  }
  .records-table {
    font-size: 12px;
  }
  .records-table th,
  .records-table td {
    padding: 8px 6px;
  }
}

@media (max-width: 480px) {
  .report-title {
    font-size: 24px;
  }
  .stat-card {
    padding: 16px;
  }
  .stat-number {
    font-size: 20px;
  }
  .chart-card {
    padding: 16px;
  }
  .password-modal {
    padding: 24px;
  }
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

/* 新增：密码表单按钮统一样式 */
.password-form .btn {
  box-sizing: border-box;
  width: 80%;
  margin: 0 auto;
  text-align: center;
  padding: 12px 16px;
  font-size: 16px;
  justify-content: center; /* 确保内容居中 */
}

/* 特别调整忘记密码按钮 */
.password-form .forgot-btn {
  background: transparent;
  color: #8b5cf6;
  border: 1px solid #8b5cf6;
  font-size: 16px; /* 统一字体大小 */
}

.password-form .forgot-btn:hover {
  background: #f3e8ff;
}

/* 调整按钮间距 */
.password-form > div > .btn {
  margin-top: 12px;
}
</style>