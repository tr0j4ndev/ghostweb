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

    <div class="report-toolbar no-print no-export">

      <div class="report-toolbar-left">
        <h1 class="report-page-title">专注力训练报告</h1>
        <div class="report-date">生成时间: {{ formatDate(new Date()) }}</div>
      </div>

      <button class="btn btn-outline export-btn" @click="exportToPDF" :disabled="isExporting">
        <img class="btn-icon" :src="pdfIcon" alt="导出PDF" />
        <span>{{ isExporting ? '导出中...' : '导出PDF' }}</span>
      </button>

    </div>

    <div class="main-scroll-area">

      <div class="container report-container" ref="reportContent">

        <!-- ===== Stat hero: bold rounded cards ===== -->
        <section class="stat-hero">
          <div class="stat-big stat-green">
            <img :src="timeIcon" alt="训练次数" class="stat-big-icon" />
            <div class="stat-big-num">{{ statistics.totalSessions || 0 }}</div>
            <div class="stat-big-label">训练次数</div>
          </div>
          <div class="stat-big stat-orange">
            <img :src="fireIcon" alt="连续天数" class="stat-big-icon" />
            <div class="stat-big-num">{{ statistics.consecutiveDays || 0 }}</div>
            <div class="stat-big-label">连续天数</div>
          </div>
          <div class="stat-big stat-yellow">
            <img :src="trophyIcon" alt="最佳连击" class="stat-big-icon" />
            <div class="stat-big-num">{{ statistics.bestStreak || 0 }}</div>
            <div class="stat-big-label">最佳连击</div>
          </div>
          <div class="stat-big stat-blue">
            <img :src="fruitIcon" alt="总水果数" class="stat-big-icon" />
            <div class="stat-big-num">{{ statistics.totalApplesCaught || 0 }}</div>
            <div class="stat-big-label">总水果数</div>
          </div>
        </section>

        <!-- ===== Activity graph (GitHub-style contribution heatmap) ===== -->
        <section class="cal-card">
          <h2 class="duo-section-title"><img :src="habitPng" alt="近期活跃" class="section-icon" /> 近期活跃</h2>
          <div class="gh-scroll">
            <div class="gh-graph">
              <div class="gh-months">
                <span v-for="m in activityMonths" :key="m.col" class="gh-month" :style="{ left: (28 + 6 + (m.col - 1) * 17) + 'px' }">{{ m.label }}</span>
              </div>
              <div class="gh-body">
                <div class="gh-weekdays">
                  <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
                </div>
                <div class="gh-grid">
                  <div v-for="(week, wi) in activityGraph" :key="wi" class="gh-col">
                    <div
                      v-for="cell in week"
                      :key="cell.key"
                      :class="['gh-cell', ghLevel(cell)]"
                      :title="cell.future ? '' : `${cell.label}${cell.count ? ' · ' + cell.count + '次' : ' · 无训练'}`"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="gh-legend">
            <span>少</span>
            <span class="gh-cell gh-0"></span>
            <span class="gh-cell gh-1"></span>
            <span class="gh-cell gh-2"></span>
            <span class="gh-cell gh-3"></span>
            <span class="gh-cell gh-4"></span>
            <span>多</span>
          </div>
        </section>

        <!-- ===== Charts ===== -->
        <section class="charts-section">
          <div class="card-head between">
            <h2 class="duo-section-title"><img :src="tendencyIcon" alt="训练趋势" class="section-icon" /> 训练趋势</h2>
            <div class="pill-filter no-print no-export">
              <button
                v-for="period in timePeriods"
                :key="period.value"
                :class="['pill', selectedPeriod === period.value ? 'active' : '']"
                @click="selectPeriod(period.value)"
              >{{ period.label }}</button>
            </div>
          </div>
          <div class="charts-grid">
            <div class="chart-card"><h3>得分趋势</h3><canvas ref="scoreChart" width="400" height="200"></canvas></div>
            <div class="chart-card"><h3>准确率变化</h3><canvas ref="accuracyChart" width="400" height="200"></canvas></div>
            <div class="chart-card"><h3>关卡分布</h3><canvas ref="levelChart" width="400" height="200"></canvas></div>
          </div>
        </section>

        <!-- ===== Records ===== -->
        <section class="records-section">
          <div class="card-head between">
            <h2 class="duo-section-title"><img :src="reportIcon" alt="训练记录" class="section-icon" /> 训练记录</h2>
            <select v-model="selectedLevelFilter" class="filter-select no-print no-export">
              <option value="">所有关卡</option>
              <option v-for="level in availableLevels" :key="level.id" :value="level.id">{{ level.name }}</option>
            </select>
          </div>
          <div class="table-wrap">
            <table class="rec-table">
              <thead><tr><th>日期</th><th>关卡</th><th>得分</th><th>金币</th><th>准确率</th><th>连击</th></tr></thead>
              <tbody>
                <tr v-for="record in filteredRecords" :key="record.id">
                  <td>{{ formatDateTime(record.date) }}</td>
                  <td><span class="lvl-chip">{{ record.levelName }}</span></td>
                  <td class="score-cell">{{ record.score }}</td>
                  <td><span class="coins-cell"><img :src="glodIcon" alt="金币" /> {{ record.coinsEarned }}</span></td>
                  <td>
                    <div class="acc-bar"><div class="acc-fill" :style="{ width: record.accuracy + '%' }"></div><span class="acc-text">{{ record.accuracy }}%</span></div>
                  </td>
                  <td class="combo-cell">{{ record.maxCombo }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredRecords.length === 0" class="empty-records">
              <img :src="reportIcon" alt="" class="empty-icon" />
              <div class="empty-text">暂无训练记录</div>
              <div class="empty-hint">开始游戏后这里会显示训练数据</div>
            </div>
          </div>
        </section>

        <!-- ===== Suggestions ===== -->
        <section class="suggestions-section">
          <div class="card-head"><h2 class="duo-section-title"><img :src="hintIcon" alt="训练建议" class="section-icon" /> 训练建议</h2></div>
          <div class="sugg-list">
            <div v-for="suggestion in suggestions" :key="suggestion.type" :class="['sugg-card', suggestion.type]">
              <img :src="getSuggestionIcon(suggestion)" alt="建议" class="sugg-icon" />
              <div class="sugg-body">
                <div class="sugg-title">{{ suggestion.title }}</div>
                <div class="sugg-desc">{{ suggestion.description }}</div>
              </div>
            </div>
          </div>
        </section>

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
import lockIcon from '../assets/lock.svg'
import backIcon from '../assets/back.png'
import storeIcon from '../assets/store.svg' // 供需要时使用
import timeIcon from '../assets/time.svg'
import fireIcon from '../assets/fire.svg'
import trophyIcon from '../assets/trophy.svg'
import fruitIcon from '../assets/fruit.svg'
import tendencyIcon from '../assets/tendency.svg'
import reportIcon from '../assets/report.svg'
import glodIcon from '../assets/glod.png'
import hintIcon from '../assets/hint.svg'
import challengeIcon from '../assets/challenge.svg'
import pdfIcon from '../assets/pdf.svg'

import habitPng from '../assets/habit.svg'
import accuracyPng from '../assets/accuracy.svg'
import insistPng from '../assets/insist.svg'

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

    // GitHub-style contribution graph: weeks as columns, 7 days (rows) each
    const activityGraph = computed(() => {
      const counts = {}
      trainingRecords.value.forEach((r) => {
        const key = new Date(r.date).toDateString()
        counts[key] = (counts[key] || 0) + 1
      })
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const monBasedDow = (today.getDay() + 6) % 7 // 0=Mon ... 6=Sun
      const NUM_WEEKS = 18
      const weeks = []
      for (let w = 0; w < NUM_WEEKS; w++) {
        const col = []
        for (let d = 0; d < 7; d++) {
          const date = new Date(today)
          date.setDate(today.getDate() - monBasedDow - (NUM_WEEKS - 1 - w) * 7 + d)
          const key = date.toDateString()
          const future = date > today
          col.push({
            key,
            date,
            count: counts[key] || 0,
            future,
            label: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          })
        }
        weeks.push(col)
      }
      return weeks
    })

    const activityMonths = computed(() => {
      const months = []
      let lastMonth = -1
      activityGraph.value.forEach((week, wi) => {
        const firstDay = week[0].date
        const m = firstDay.getMonth()
        if (m !== lastMonth) {
          months.push({ col: wi + 1, label: firstDay.toLocaleDateString('zh-CN', { month: 'short' }) })
          lastMonth = m
        }
      })
      return months
    })

    const ghLevel = (cell) => {
      if (cell.future) return 'gh-future'
      const c = cell.count
      if (c === 0) return 'gh-0'
      if (c <= 1) return 'gh-1'
      if (c <= 3) return 'gh-2'
      if (c <= 5) return 'gh-3'
      return 'gh-4'
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
    
    // Prepare canvas for crisp rendering at any display size (DPR-aware)
    const prepCanvas = (canvas, logicalH) => {
      const dpr = window.devicePixelRatio || 1
      const w = Math.max(canvas.clientWidth || 400, 200)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(logicalH * dpr)
      canvas.style.height = logicalH + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return { ctx, w, h: logicalH }
    }

    // Rounded-top rectangle (Duolingo-style 3D bar)
    const roundBar = (ctx, x, y, bw, bh, r) => {
      const rad = Math.min(r, bw / 2, bh / 2)
      ctx.beginPath()
      ctx.moveTo(x, y + bh)
      ctx.lineTo(x, y + rad)
      ctx.quadraticCurveTo(x, y, x + rad, y)
      ctx.lineTo(x + bw - rad, y)
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + rad)
      ctx.lineTo(x + bw, y + bh)
      ctx.closePath()
    }

    const drawScoreChart = () => {
      const canvas = scoreChart.value
      if (!canvas) return
      const { ctx, w, h } = prepCanvas(canvas, 220)
      const recentRecords = [...trainingRecords.value].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-20)
      ctx.clearRect(0, 0, w, h)
      if (recentRecords.length === 0) { drawNoDataMessage(ctx, w, h, '暂无得分数据'); return }

      const padL = 44, padR = 16, padT = 18, padB = 34
      const cw = w - padL - padR, ch = h - padT - padB
      const maxScore = Math.max(...recentRecords.map((r) => r.score), 100)

      // gridlines
      ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 1
      ctx.font = '600 11px Nunito, sans-serif'; ctx.fillStyle = '#777'; ctx.textAlign = 'right'
      for (let i = 0; i <= 4; i++) {
        const y = padT + ch - (i / 4) * ch
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke()
        ctx.fillText(Math.round((i / 4) * maxScore).toString(), padL - 6, y + 4)
      }

      const n = recentRecords.length
      const slot = cw / n
      const barW = Math.max(Math.min(slot * 0.6, 30), 6)
      recentRecords.forEach((record, i) => {
        const x = padL + i * slot + (slot - barW) / 2
        const bh = (record.score / maxScore) * ch
        const y = padT + ch - bh
        const grad = ctx.createLinearGradient(0, y, 0, y + bh)
        grad.addColorStop(0, '#61e002'); grad.addColorStop(1, '#58cc02')
        ctx.fillStyle = grad
        roundBar(ctx, x, y, barW, bh, 5); ctx.fill()
        // 3D bottom shade
        ctx.fillStyle = '#58a700'
        ctx.fillRect(x, y + bh - 3, barW, 3)
        if (barW > 18) {
          ctx.fillStyle = '#3c3c3c'; ctx.font = '800 10px Nunito, sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(record.score, x + barW / 2, y - 5)
        }
      })
      ctx.fillStyle = '#777'; ctx.font = '700 11px Nunito, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('游戏次数', w / 2, h - 8)
    }
    
    const drawAccuracyChart = () => {
      const canvas = accuracyChart.value
      if (!canvas) return
      const { ctx, w, h } = prepCanvas(canvas, 220)
      const recentRecords = [...trainingRecords.value].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-20)
      ctx.clearRect(0, 0, w, h)
      if (recentRecords.length === 0) { drawNoDataMessage(ctx, w, h, '暂无准确率数据'); return }

      const padL = 44, padR = 16, padT = 18, padB = 34
      const cw = w - padL - padR, ch = h - padT - padB

      ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 1
      ctx.font = '600 11px Nunito, sans-serif'; ctx.fillStyle = '#777'; ctx.textAlign = 'right'
      for (let i = 0; i <= 4; i++) {
        const y = padT + ch - (i / 4) * ch
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke()
        ctx.fillText(Math.round((i / 4) * 100) + '%', padL - 6, y + 4)
      }

      const n = recentRecords.length
      const slot = cw / n
      const barW = Math.max(Math.min(slot * 0.6, 30), 6)
      recentRecords.forEach((record, i) => {
        const x = padL + i * slot + (slot - barW) / 2
        const bh = (record.accuracy / 100) * ch
        const y = padT + ch - bh
        const grad = ctx.createLinearGradient(0, y, 0, y + bh)
        grad.addColorStop(0, '#4ad0f6'); grad.addColorStop(1, '#1cb0f6')
        ctx.fillStyle = grad
        roundBar(ctx, x, y, barW, bh, 5); ctx.fill()
        ctx.fillStyle = '#1899d6'
        ctx.fillRect(x, y + bh - 3, barW, 3)
        if (barW > 18) {
          ctx.fillStyle = '#3c3c3c'; ctx.font = '800 10px Nunito, sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(record.accuracy + '%', x + barW / 2, y - 5)
        }
      })
      ctx.fillStyle = '#777'; ctx.font = '700 11px Nunito, sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('游戏次数', w / 2, h - 8)
    }
    
    const drawLevelChart = () => {
      const canvas = levelChart.value
      if (!canvas) return
      const { ctx, w, h } = prepCanvas(canvas, 220)
      const records = gameStore.getRecentRecords(selectedPeriod.value)
      ctx.clearRect(0, 0, w, h)
      if (records.length === 0) { drawNoDataMessage(ctx, w, h, '暂无关卡数据'); return }

      const levels = gameStore.gameData.levels
      const categories = [
        { name: '基础关卡', color: '#58cc02' },
        { name: '特殊关卡', color: '#1cb0f6' },
        { name: '无尽·基础', color: '#ffc800' },
        { name: '无尽·特殊', color: '#ff4b4b' },
      ]
      const counts = [0, 0, 0, 0]
      records.forEach((record) => {
        const level = levels.find((l) => l.id === record.levelId)
        if (!level) return
        if (level.mode === 'timed') counts[0]++
        else if (level.mode === 'interference' || level.mode === 'multi-target') counts[1]++
        else if (level.mode === 'endless') {
          if (['circle', 'square', 'triangle'].includes(level.shape)) counts[2]++; else counts[3]++
        }
      })
      const total = counts.reduce((a, b) => a + b, 0)
      if (total === 0) { drawNoDataMessage(ctx, w, h, '暂无关卡数据'); return }

      // Pie/donut on the left — compact so legend always fits
      const cx = Math.min(w * 0.25, 72)
      const cy = h / 2
      const radius = Math.max(Math.min(cx, cy) - 8, 18)
      const inner = radius * 0.55
      let angle = -Math.PI / 2

      counts.forEach((c, i) => {
        if (c === 0) return
        const slice = (c / total) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, radius, angle, angle + slice)
        ctx.closePath()
        ctx.fillStyle = categories[i].color
        ctx.fill()
        angle += slice
      })
      // donut hole
      ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()
      // center total
      ctx.fillStyle = '#3c3c3c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = '800 20px Fredoka, Nunito, sans-serif'
      ctx.fillText(total, cx, cy - 4)
      ctx.fillStyle = '#777'; ctx.font = '700 10px Nunito, sans-serif'
      ctx.fillText('总次数', cx, cy + 12)

      // Legend on the right — positioned further right with smaller dots
      const legX = cx + radius + 24
      const legDotR = 5
      let legY = cy - (categories.length * 34) / 2 + 8
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      categories.forEach((cat, i) => {
        const c = counts[i]
        ctx.fillStyle = cat.color
        ctx.beginPath(); ctx.arc(legX + legDotR, legY, legDotR, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#3c3c3c'; ctx.font = '800 12px Nunito, sans-serif'
        ctx.fillText(cat.name, legX + legDotR * 2 + 7, legY)
        ctx.fillStyle = '#999'; ctx.font = '700 11px Nunito, sans-serif'
        ctx.fillText(`${c} 次 · ${Math.round((c / total) * 100)}%`, legX + legDotR * 2 + 7, legY + 13)
        legY += 34
      })
    }

    const drawNoDataMessage = (ctx, w, h, message) => {
      ctx.fillStyle = '#afafaf'
      ctx.font = '700 15px Nunito, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(message, w / 2, h / 2)
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
        background: ${type === 'success' ? '#58cc02' : type === 'error' ? '#ff4b4b' : '#1cb0f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 16px;
        border-bottom: 4px solid ${type === 'success' ? '#58a700' : type === 'error' ? '#ea2b2b' : '#1899d6'};
        z-index: 1000;
        font-weight: 800;
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
      activityGraph,
      activityMonths,
      ghLevel,
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
      pdfIcon,
      habitPng
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

/* Toolbar */
.report-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px 20px; flex-wrap: wrap;
  border-bottom: 2px solid var(--duo-border);
}
.report-toolbar-left { display: flex; flex-direction: column; gap: 2px; }
.report-page-title { font-family: 'Fredoka','Nunito',sans-serif; font-size: 26px; font-weight: 700; color: var(--duo-ink); }
.report-date { font-size: 13px; color: var(--duo-muted); font-weight: 600; }
.export-btn { padding: 10px 16px; font-size: 14px; white-space: nowrap; margin: 0; }
.export-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* 密码验证样式 */
.password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(60, 60, 60, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.password-modal {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 12px 0 var(--duo-border);
  border: 2px solid var(--duo-border);
}

.password-header h2 {
  color: var(--duo-ink);
  margin-bottom: 8px;
  font-size: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Fredoka','Nunito',sans-serif;
}

.password-header p {
  color: var(--duo-muted);
  margin-bottom: 24px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-input {
  width: 85%;
  padding: 14px 16px;
  border: 2px solid var(--duo-border);
  border-bottom: 4px solid var(--duo-border);
  border-radius: 14px;
  font-size: 16px;
  text-align: center;
  font-family: 'Nunito',sans-serif;
}

.password-input:focus {
  outline: none;
  border-color: var(--duo-blue);
  border-bottom-color: var(--duo-blue-shadow);
}

.password-error {
  color: var(--duo-red);
  font-size: 14px;
  font-weight: 700;
  margin-top: 8px;
}

.password-hint {
  margin-top: 16px;
  color: var(--duo-muted);
}

.forgot-btn {
  background: transparent;
  color: var(--duo-blue);
  border: 2px solid var(--duo-blue) !important;
  border-bottom: 4px solid var(--duo-blue-shadow) !important;
  font-size: 14px;
}

.forgot-btn:hover {
  background: #e8f7ff;
}

.phone-verified {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.success-message {
  color: var(--duo-green-shadow);
  font-weight: 800;
  padding: 8px;
  background: #e9f7d6;
  border-radius: 12px;
  border: 2px solid var(--duo-green);
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
  background: var(--duo-green);
  color: white;
  border-radius: 24px;
  border-bottom: 6px solid var(--duo-green-shadow);
  padding: 32px;
  margin-bottom: 32px;
}

.overview-header {
  text-align: center;
  margin-bottom: 32px;
}

.report-title {
  font-family: 'Fredoka','Nunito',sans-serif;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.report-date {
  opacity: 0.95;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-number {
  font-family: 'Fredoka','Nunito',sans-serif;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.95;
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
  color: var(--duo-ink);
  font-family: 'Fredoka','Nunito',sans-serif;
  font-size: 24px;
  font-weight: 700;
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
  border: 2px solid var(--duo-border);
  border-bottom: 4px solid var(--duo-border);
  background: white;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.1s, transform 0.08s;
}

.filter-btn:hover {
  background: #f4fce8;
}

.filter-btn:active {
  border-bottom-width: 2px;
  transform: translateY(2px);
}

.filter-btn.active {
  background: var(--duo-green);
  color: white;
  border-color: var(--duo-green);
  border-bottom-color: var(--duo-green-shadow);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 2px solid var(--duo-border);
  box-shadow: 0 4px 0 var(--duo-border);
}

.chart-card h3 {
  color: var(--duo-ink);
  font-family: 'Fredoka','Nunito',sans-serif;
  font-size: 18px;
  font-weight: 700;
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
  border: 2px solid var(--duo-border);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  background: white;
}

.table-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid var(--duo-border);
  box-shadow: 0 4px 0 var(--duo-border);
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th {
  background: var(--duo-card);
  padding: 16px 12px;
  text-align: left;
  font-weight: 800;
  color: var(--duo-ink);
  border-bottom: 2px solid var(--duo-border);
}

.records-table td {
  padding: 12px;
  border-bottom: 1px solid var(--duo-border);
}

.level-badge {
  background: #e9f7d6;
  color: var(--duo-green-shadow);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 2px solid var(--duo-green);
}

.score-cell {
  font-weight: 800;
  color: var(--duo-green-shadow);
}

.coins-cell {
  color: var(--duo-yellow-shadow);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
}

.combo-cell {
  color: var(--duo-red);
  font-weight: 800;
}

.accuracy-bar {
  position: relative;
  background: #f3f4f6;
  border-radius: 8px;
  height: 20px;
  min-width: 80px;
}

.accuracy-fill {
  background: linear-gradient(90deg, var(--duo-green), var(--duo-green-hover));
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
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 2px solid var(--duo-border);
  border-left: 6px solid;
  box-shadow: 0 4px 0 var(--duo-border);
}

.suggestion-card.info {
  border-left-color: var(--duo-blue);
  background: #e8f7ff;
}

.suggestion-card.warning {
  border-left-color: var(--duo-yellow);
  background: #fff8d6;
}

.suggestion-card.success {
  border-left-color: var(--duo-green);
  background: #e9f7d6;
}

.suggestion-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--duo-ink);
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 14px;
  color: var(--duo-ink);
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
  font-family: 'Fredoka','Nunito',sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 5vw, 30px);
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: var(--duo-ink);
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
  width: 48px;
  height: 4px;
  border-radius: 999px;
  margin: 6px auto 0;
  background: var(--duo-green);
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
    letter-spacing: 0.02em;
  }
  
  .header-title::after {
    width: 40px;
    height: 3.5px;
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
  font-family: 'Fredoka','Nunito',sans-serif;
  font-weight: 700;
  font-size: clamp(20px, 5vw, 30px);
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: var(--duo-ink);
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
  width: 48px;
  height: 4px;
  border-radius: 999px;
  margin: 6px auto 0;
  background: var(--duo-green);
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
    letter-spacing: 0.02em;
  }
  
  .header-title::after {
    width: 40px;
    height: 3.5px;
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
  color: var(--duo-blue);
  border: 2px solid var(--duo-blue) !important;
  border-bottom: 4px solid var(--duo-blue-shadow) !important;
  font-size: 16px;
}

.password-form .forgot-btn:hover {
  background: #e8f7ff;
}

/* 调整按钮间距 */
.password-form > div > .btn {
  margin-top: 12px;
}

/* ===== Redesigned report layout ===== */
.report-container { max-width: 960px; display: flex; flex-direction: column; gap: 22px; }
.section-icon { width: 24px; height: 24px; object-fit: contain; }
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.card-head.between { justify-content: space-between; flex-wrap: wrap; gap: 12px; }

/* Stat hero */
.stat-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}
.stat-big {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border-radius: 20px; padding: 20px 12px;
  border: 2px solid var(--duo-border); border-bottom: 5px solid var(--duo-border);
  background: #fff; text-align: center;
}
.stat-big-icon { width: 34px; height: 34px; object-fit: contain; }
.stat-big-num { font-family: 'Fredoka','Nunito',sans-serif; font-size: 30px; font-weight: 700; color: var(--duo-ink); line-height: 1; }
.stat-big-label { font-size: 13px; font-weight: 800; color: var(--duo-muted); }
.stat-green { background: #e9f7d6; border-color: var(--duo-green); border-bottom-color: var(--duo-green-shadow); }
.stat-orange { background: #ffe6d6; border-color: #ff9600; border-bottom-color: #e6a700; }
.stat-yellow { background: #fff5cc; border-color: #ffe066; border-bottom-color: var(--duo-yellow-shadow); }
.stat-blue { background: #e8f7ff; border-color: var(--duo-blue); border-bottom-color: var(--duo-blue-shadow); }

/* Activity calendar */
.cal-card {
  background: #fff; border: 2px solid var(--duo-border); border-radius: 20px;
  padding: 20px; box-shadow: 0 4px 0 var(--duo-border);
}
/* GitHub-style contribution graph */
.gh-scroll { overflow-x: auto; padding: 4px 2px 6px; }
.gh-graph { display: flex; flex-direction: column; gap: 5px; width: max-content; margin: 10px auto 0; }
.gh-months {
  position: relative; height: 16px;
  font-size: 11px; font-weight: 700; color: var(--duo-muted);
}
.gh-month {
  position: absolute; top: 0; white-space: nowrap;
}
.gh-body { display: grid; grid-template-columns: 28px 1fr; gap: 6px; align-items: center; }
.gh-weekdays {
  display: grid; grid-template-rows: repeat(7, 14px); gap: 3px;
  font-size: 10px; font-weight: 700; color: var(--duo-muted);
}
.gh-weekdays span { height: 14px; line-height: 14px; text-align: right; }
.gh-grid { display: grid; grid-auto-flow: column; gap: 3px; }
.gh-col { display: grid; grid-template-rows: repeat(7, 14px); gap: 3px; }
.gh-cell {
  width: 14px; height: 14px; border-radius: 3px;
  background: #ebedf0; border: 1px solid rgba(0,0,0,0.04);
}
.gh-cell.gh-future { background: transparent; border-color: transparent; }
.gh-cell.gh-0 { background: #ebedf0; }
.gh-cell.gh-1 { background: #9be9a8; }
.gh-cell.gh-2 { background: #40c463; }
.gh-cell.gh-3 { background: #30a14e; }
.gh-cell.gh-4 { background: #216e39; }
.gh-legend { display: flex; align-items: center; gap: 5px; margin: 10px auto 0; width: max-content; font-size: 11px; font-weight: 700; color: var(--duo-muted); }
.gh-legend .gh-cell { width: 14px; height: 14px; }

/* Charts */
.charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.chart-card {
  background: #fff; border: 2px solid var(--duo-border); border-radius: 18px;
  padding: 18px; box-shadow: 0 4px 0 var(--duo-border);
}
.chart-card h3 { font-family: 'Fredoka','Nunito',sans-serif; font-size: 16px; font-weight: 700; color: var(--duo-ink); margin-bottom: 12px; text-align: center; }
.chart-card canvas { width: 100%; height: 220px; display: block; }

.pill-filter { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  padding: 7px 14px; border-radius: 999px;
  border: 2px solid var(--duo-border); border-bottom: 4px solid var(--duo-border);
  background: #fff; font-weight: 800; font-size: 13px; color: var(--duo-muted); cursor: pointer;
  transition: filter 0.1s, transform 0.08s, border-bottom-width 0.08s;
}
.pill:hover { background: var(--duo-card); }
.pill:active { border-bottom-width: 2px; transform: translateY(2px); }
.pill.active { background: var(--duo-green); color: #fff; border-color: var(--duo-green); border-bottom-color: var(--duo-green-shadow); }

/* Records */
.filter-select { padding: 8px 12px; border: 2px solid var(--duo-border); border-radius: 12px; font-size: 14px; font-weight: 600; background: #fff; }
.table-wrap {
  background: #fff; border: 2px solid var(--duo-border); border-radius: 18px;
  overflow: hidden; box-shadow: 0 4px 0 var(--duo-border);
}
.rec-table { width: 100%; border-collapse: collapse; }
.rec-table th { background: var(--duo-card); padding: 14px 12px; text-align: left; font-weight: 800; color: var(--duo-ink); border-bottom: 2px solid var(--duo-border); font-size: 14px; }
.rec-table td { height: 54px; padding: 8px 12px; border-bottom: 1px solid var(--duo-border); font-size: 14px; vertical-align: middle; }
.rec-table tbody tr:last-child td { border-bottom: none; }
.lvl-chip { display: inline-block; background: #e9f7d6; color: var(--duo-green-shadow); border: 2px solid var(--duo-green); border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 800; line-height: 1.3; }
.score-cell { font-weight: 800; color: var(--duo-green-shadow); }
.coins-cell { color: var(--duo-yellow-shadow); font-weight: 800; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.coins-cell img { width: 16px; height: 16px; object-fit: contain; }
.combo-cell { color: var(--duo-red); font-weight: 800; }
.acc-bar { position: relative; display: inline-block; background: var(--duo-border); border-radius: 999px; height: 18px; width: 90px; overflow: hidden; vertical-align: middle; }
.acc-fill { background: linear-gradient(90deg, var(--duo-green), var(--duo-green-hover)); height: 100%; border-radius: 999px; transition: width 0.3s ease; }
.acc-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

.empty-records { text-align: center; padding: 48px 20px; color: var(--duo-muted); }
.empty-icon { width: 56px; height: 56px; object-fit: contain; opacity: 0.4; margin-bottom: 12px; }
.empty-text { font-size: 18px; font-weight: 800; }
.empty-hint { font-size: 14px; margin-top: 4px; }

/* Suggestions */
.sugg-list { display: flex; flex-direction: column; gap: 12px; }
.sugg-card {
  display: flex; align-items: flex-start; gap: 14px;
  border-radius: 18px; padding: 16px 18px;
  border: 2px solid var(--duo-border); border-left: 6px solid;
  box-shadow: 0 4px 0 var(--duo-border);
}
.sugg-card.info { border-left-color: var(--duo-blue); background: #e8f7ff; }
.sugg-card.warning { border-left-color: var(--duo-yellow); background: #fff8d6; }
.sugg-card.success { border-left-color: var(--duo-green); background: #e9f7d6; }
.sugg-icon { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
.sugg-title { font-weight: 800; font-size: 16px; color: var(--duo-ink); margin-bottom: 2px; }
.sugg-desc { font-size: 14px; color: var(--duo-ink); line-height: 1.5; font-weight: 600; }

@media (max-width: 600px) {
  .stat-hero { grid-template-columns: repeat(2, 1fr); }
  .charts-grid { grid-template-columns: 1fr; }
  .rec-table { font-size: 12px; }
  .rec-table th, .rec-table td { padding: 8px 6px; }
}
</style>