import { defineStore } from "pinia"

export const useGameStore = defineStore("game", {
  state: () => ({
    currentSaveId: "",
    gameData: {
      totalCoins: 0,
      currentOutfit: "default",
      currentFruit: "apple",
      levels: [
        {
          id: 1,
          name: "圆形轨道",
          shape: "circle",
          mode: "timed",
          timeLimit: 35,
          unlocked: true,
          bestScore: 0,
          completed: false,
        },
        {
          id: 2,
          name: "方形轨道",
          shape: "square",
          mode: "timed",
          timeLimit: 40,
          unlocked: false,
          bestScore: 0,
          completed: false,
        },
        {
          id: 3,
          name: "三角轨道",
          shape: "triangle",
          mode: "timed",
          timeLimit: 40,
          unlocked: false,
          bestScore: 0,
          completed: false,
        },
        {
          id: 6,
          name: "干扰物关卡",
          shape: "circle",
          mode: "interference",
          timeLimit: 45,
          unlocked: false,
          bestScore: 0,
          bestScoresByShape: { circle: 0, square: 0, triangle: 0 },
          completed: false,
        },
        {
          id: 7,
          name: "多目标追踪",
          shape: "circle",
          mode: "multi-target",
          timeLimit: 45,
          unlocked: false,
          bestScore: 0,
          bestScoresByShape: { circle: 0, square: 0, triangle: 0 },
          completed: false,
        },
        {
          id: 99,
          name: "无尽模式",
          shape: "circle",
          mode: "endless",
          timeLimit: 0,
          unlocked: false,
          bestScore: 0,
          completed: false,
        },
      ],
      outfits: [
        { id: "default", name: "经典幽灵", price: 0, image: "ghost.png", unlocked: true },
        { id: "evil", name: "恶魔幽灵", price: 200, image: "ghost_evil.png", unlocked: false },
        { id: "witch", name: "女巫幽灵", price: 240, image: "ghost_witch.png", unlocked: false },
        { id: "tiger", name: "老虎幽灵", price: 300, image: "ghost_tiger.png", unlocked: false },
        { id: "scarf", name: "围巾幽灵", price: 360, image: "ghost_scarf.png", unlocked: false },
        { id: "marshmallow", name: "棉花糖幽灵", price: 400, image: "ghost_mashmallow.png", unlocked: false },
        { id: "peking", name: "京剧幽灵", price: 500, image: "ghost_peking.png", unlocked: false },
      ],
      fruits: [
        { id: "apple", name: "苹果", price: 0, unlocked: true, image: "apple.png" },
        { id: "banana", name: "香蕉", price: 200, unlocked: false, image: "banana.png" },
        { id: "grape", name: "葡萄", price: 240, unlocked: false, image: "grape.png" },
        { id: "orange", name: "橙子", price: 300, unlocked: false, image: "orange.png" },
        { id: "strawberry", name: "草莓", price: 360, unlocked: false, image: "strawberry.png" },
        { id: "cherry", name: "樱桃", price: 400, unlocked: false, image: "cherry.png" },
      ],
      trainingRecords: [],
      statistics: {
        totalSessions: 0,
        totalPlayTime: 0,
        consecutiveDays: 0,
        lastPlayDate: null,
        bestStreak: 0,
        totalApplesCaught: 0,
        totalMisses: 0,
        totalInterferenceHits: 0,
      },
    },
  }),

  getters: {
    totalCoins: (state) => state.gameData.totalCoins,
    currentOutfit: (state) => state.gameData.currentOutfit,
    currentFruit: (state) => state.gameData.currentFruit,
    trainingRecords: (state) => state.gameData.trainingRecords || [],
    statistics: (state) => state.gameData.statistics || {},
  },

  actions: {
    initializeSaveSystem() {
      const saves = localStorage.getItem("ghost-game-saves")
      const currentSaveId = localStorage.getItem("ghost-game-current-save")
      if (!saves) {
        const defaultSave = this.createDefaultSaveData("默认存档")
        const savesData = { [defaultSave.id]: defaultSave }
        localStorage.setItem("ghost-game-saves", JSON.stringify(savesData))
        localStorage.setItem("ghost-game-current-save", defaultSave.id)
        this.currentSaveId = defaultSave.id
      } else {
        this.currentSaveId = currentSaveId || Object.keys(JSON.parse(saves))[0]
      }
    },

    createDefaultSaveData(name) {
      return {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        lastPlayDate: new Date().toISOString(),
        ...JSON.parse(JSON.stringify(this.gameData)),
      }
    },

    getAllSaves() {
      const saves = localStorage.getItem("ghost-game-saves")
      if (!saves) return []
      const savesData = JSON.parse(saves)
      return Object.values(savesData).sort((a, b) => new Date(b.lastPlayDate) - new Date(a.lastPlayDate))
    },

    getCurrentSaveId() {
      return this.currentSaveId || localStorage.getItem("ghost-game-current-save")
    },

    createNewSave(name) {
      this.saveGameData()

      // 创建全新空白存档
      const newSave = {
        id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9),
        name,
        createdAt: new Date().toISOString(),
        lastPlayDate: new Date().toISOString(),
        totalCoins: 0,
        currentOutfit: "default",
        currentFruit: "apple",
        // 关卡数据 - 只解锁第一关
        levels: [
          {
            id: 1,
            name: "圆形轨道",
            shape: "circle",
            mode: "timed",
            timeLimit: 35,
            unlocked: true,
            bestScore: 0,
            completed: false,
          },
          {
            id: 2,
            name: "方形轨道",
            shape: "square",
            mode: "timed",
            timeLimit: 40,
            unlocked: false,
            bestScore: 0,
            completed: false,
          },
          {
            id: 3,
            name: "三角轨道",
            shape: "triangle",
            mode: "timed",
            timeLimit: 40,
            unlocked: false,
            bestScore: 0,
            completed: false,
          },
          {
            id: 6,
            name: "干扰物关卡",
            shape: "circle",
            mode: "interference",
            timeLimit: 45,
            unlocked: false,
            bestScore: 0,
            bestScoresByShape: { circle: 0, square: 0, triangle: 0 },
            completed: false,
          },
          {
            id: 7,
            name: "多目标追踪",
            shape: "circle",
            mode: "multi-target",
            timeLimit: 45,
            unlocked: false,
            bestScore: 0,
            bestScoresByShape: { circle: 0, square: 0, triangle: 0 },
            completed: false,
          },
          {
            id: 99,
            name: "无尽模式",
            shape: "circle",
            mode: "endless",
            timeLimit: 0,
            unlocked: false,
            bestScore: 0,
            completed: false,
          },
        ],

        outfits: [
          { id: "default", name: "经典幽灵", price: 0, image: "ghost.png", unlocked: true },
          { id: "evil", name: "恶魔幽灵", price: 200, image: "ghost_evil.png", unlocked: false },
          { id: "witch", name: "女巫幽灵", price: 240, image: "ghost_witch.png", unlocked: false },
          { id: "tiger", name: "老虎幽灵", price: 300, image: "ghost_tiger.png", unlocked: false },
          { id: "scarf", name: "围巾幽灵", price: 360, image: "ghost_scarf.png", unlocked: false },
          { id: "marshmallow", name: "棉花糖幽灵", price: 400, image: "ghost_mashmallow.png", unlocked: false },
          { id: "peking", name: "京剧幽灵", price: 500, image: "ghost_peking.png", unlocked: false },
        ],
        fruits: [
          { id: "apple", name: "苹果", price: 0, unlocked: true, image: "apple.png" },
          { id: "banana", name: "香蕉", price: 200, unlocked: false, image: "banana.png" },
          { id: "grape", name: "葡萄", price: 240, unlocked: false, image: "grape.png" },
          { id: "orange", name: "橙子", price: 300, unlocked: false, image: "orange.png" },
          { id: "strawberry", name: "草莓", price: 360, unlocked: false, image: "strawberry.png" },
          { id: "cherry", name: "樱桃", price: 400, unlocked: false, image: "cherry.png" },
        ],

        trainingRecords: [],
        statistics: {
          totalSessions: 0,
          totalPlayTime: 0,
          consecutiveDays: 0,
          lastPlayDate: null,
          bestStreak: 0,
          totalApplesCaught: 0,
          totalMisses: 0,
          totalInterferenceHits: 0,
        },
      }

      const existingSaves = JSON.parse(localStorage.getItem("ghost-game-saves") || {})
      existingSaves[newSave.id] = newSave
      localStorage.setItem("ghost-game-saves", JSON.stringify(existingSaves))

      this.currentSaveId = newSave.id
      localStorage.setItem("ghost-game-current-save", newSave.id)
      this.gameData = { ...newSave }

      return newSave.id
    },

    switchToSave(saveId) {
      this.saveGameData()
      const saves = JSON.parse(localStorage.getItem("ghost-game-saves") || "{}")
      const targetSave = saves[saveId]
      if (!targetSave) return

      this.currentSaveId = saveId
      localStorage.setItem("ghost-game-current-save", saveId)
      this.gameData = { ...targetSave }
    },

    renameSave(saveId, newName) {
      const saves = JSON.parse(localStorage.getItem("ghost-game-saves") || "{}")
      if (saves[saveId]) {
        saves[saveId].name = newName
        localStorage.setItem("ghost-game-saves", JSON.stringify(saves))
        if (saveId === this.currentSaveId) this.gameData.name = newName
      }
    },

    deleteSave(saveId) {
      const saves = JSON.parse(localStorage.getItem("ghost-game-saves") || "{}")
      if (!saves[saveId]) return
      delete saves[saveId]
      localStorage.setItem("ghost-game-saves", JSON.stringify(saves))
      if (saveId === this.currentSaveId) {
        const remaining = Object.keys(saves)
        if (remaining.length > 0) this.switchToSave(remaining[0])
      }
    },

    loadGameData() {
      try {
        this.initializeSaveSystem()
        const saves = JSON.parse(localStorage.getItem("ghost-game-saves") || "{}")
        const currentSave = saves[this.currentSaveId]

        // 数据迁移：更新旧关卡的时间限制
        const timeLimitUpdates = { 1: 35, 2: 40, 3: 40 }
        this.gameData.levels.forEach((level) => {
          if (timeLimitUpdates[level.id]) {
            level.timeLimit = timeLimitUpdates[level.id]
          }
        })

        if (currentSave) {
          // 合并可扩展字段
          const mergedLevels = this.gameData.levels.map((d) => {
            const saved = currentSave.levels?.find((sl) => sl.id === d.id)
            const merged = saved ? { ...d, ...saved } : d
            // 迁移：为特殊限时模式补全分轨道成绩对象
            if (["interference", "multi-target"].includes(merged.mode)) {
              if (!merged.bestScoresByShape) {
                merged.bestScoresByShape = { circle: 0, square: 0, triangle: 0 }
              } else {
                merged.bestScoresByShape.circle ??= 0
                merged.bestScoresByShape.square ??= 0
                merged.bestScoresByShape.triangle ??= 0
              }
            }
            return merged
          })

          const mergedOutfits = this.gameData.outfits.map((d) =>
            currentSave.outfits?.find((so) => so.id === d.id)
              ? { ...d, ...currentSave.outfits.find((so) => so.id === d.id) }
              : d,
          )
          const mergedFruits = this.gameData.fruits.map((d) =>
            currentSave.fruits?.find((sf) => sf.id === d.id)
              ? { ...d, ...currentSave.fruits.find((sf) => sf.id === d.id) }
              : d,
          )

          this.gameData = {
            ...this.gameData,
            ...currentSave,
            levels: mergedLevels,
            outfits: mergedOutfits,
            fruits: mergedFruits,
            trainingRecords: currentSave.trainingRecords || [],
            statistics: { ...this.gameData.statistics, ...(currentSave.statistics || {}) },
          }
        } else {
          // 首次初始化场景的迁移（无存档但默认结构也需保证）
          this.gameData.levels = this.gameData.levels.map((l) => {
            if (["interference", "multi-target"].includes(l.mode) && !l.bestScoresByShape) {
              return { ...l, bestScoresByShape: { circle: 0, square: 0, triangle: 0 } }
            }
            return l
          })
        }
      } catch (e) {
        console.error("加载游戏数据失败:", e)
      }
    },

    saveGameData() {
      try {
        const saves = JSON.parse(localStorage.getItem("ghost-game-saves") || "{}")
        if (saves[this.currentSaveId]) {
          const updated = {
            ...saves[this.currentSaveId],
            ...this.gameData,
            lastPlayDate: new Date().toISOString(),
          }
          saves[this.currentSaveId] = updated
          localStorage.setItem("ghost-game-saves", JSON.stringify(saves))
        }
      } catch (e) {
        console.error("保存游戏数据失败:", e)
      }
    },

    addCoins(amount) {
      this.gameData.totalCoins += amount
      this.saveGameData()
    },

    spendCoins(amount) {
      if (this.gameData.totalCoins >= amount) {
        this.gameData.totalCoins -= amount
        this.saveGameData()
        return true
      }
      return false
    },

    unlockOutfit(outfitId) {
      const outfit = this.gameData.outfits.find((o) => o.id === outfitId)
      if (outfit) {
        outfit.unlocked = true
        this.saveGameData()
      }
    },

    setCurrentOutfit(outfitId) {
      this.gameData.currentOutfit = outfitId
      this.saveGameData()
    },

    unlockFruit(fruitId) {
      const fruit = this.gameData.fruits.find((f) => f.id === fruitId)
      if (fruit) {
        fruit.unlocked = true
        this.saveGameData()
      }
    },

    setCurrentFruit(fruitId) {
      this.gameData.currentFruit = fruitId
      this.saveGameData()
    },

    updateLevelScore(levelId, score) {
      const level = this.gameData.levels.find((l) => l.id === levelId)
      if (level) {
        level.bestScore = Math.max(level.bestScore || 0, score || 0)
        this.saveGameData()
      }
    },

    completLevel(levelId) {
      const level = this.gameData.levels.find((l) => l.id === levelId)
      if (level) {
        level.completed = true
        this.saveGameData()
      }
    },

    unlockLevel(levelId) {
      const level = this.gameData.levels.find((l) => l.id === levelId)
      if (level) {
        level.unlocked = true
        this.saveGameData()
      }
    },

    recordTrainingSession(sessionData) {
      const record = {
        id: Date.now(),
        date: new Date().toISOString(),
        levelId: sessionData.levelId,
        levelName: sessionData.levelName,
        gameMode: sessionData.gameMode,
        score: sessionData.score,
        coinsEarned: sessionData.coinsEarned,
        playTime: Math.max(sessionData.playTime || 0, 0),
        applesCaught: sessionData.applesCaught || 0,
        missedApples: sessionData.missedApples || 0,
        interferenceHits: sessionData.interferenceHits || 0,
        maxCombo: sessionData.maxCombo || 0,
        finalLevel: sessionData.finalLevel || 1,
        averageReactionTime: sessionData.averageReactionTime || 0,
        accuracy: sessionData.accuracy || 0,
        multiTargetCorrectRate: sessionData.multiTargetCorrectRate || 0,
      }
      this.gameData.trainingRecords.push(record)
      this.updateStatistics(record)
      this.saveGameData()
    },

    updateStatistics(record) {
      const stats = this.gameData.statistics
      const today = new Date().toDateString()
      const last = stats.lastPlayDate ? new Date(stats.lastPlayDate).toDateString() : null

      stats.totalSessions += 1
      stats.totalPlayTime = (stats.totalPlayTime || 0) + (record.playTime || 0)
      stats.totalApplesCaught += record.applesCaught || 0
      stats.totalMisses += record.missedApples || 0
      stats.totalInterferenceHits += record.interferenceHits || 0

      if (last === today) {
        // same day
      } else if (last && this.isConsecutiveDay(last, today)) {
        stats.consecutiveDays += 1
      } else {
        stats.consecutiveDays = 1
      }

      stats.bestStreak = Math.max(stats.bestStreak, stats.consecutiveDays)
      stats.lastPlayDate = new Date().toISOString()
    },

    isConsecutiveDay(lastDate, currentDate) {
      const last = new Date(lastDate)
      const current = new Date(currentDate)
      const diffTime = current - last
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays === 1
    },

    getRecentRecords(days = 7) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      return this.gameData.trainingRecords
        .filter((r) => new Date(r.date) >= cutoff)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    getTrainingTrends(days = 30) {
      const records = this.getRecentRecords(days)
      if (records.length === 0) return []
      const daily = {}
      records.forEach((r) => {
        const d = new Date(r.date).toDateString()
        if (!daily[d]) {
          daily[d] = {
            date: d,
            sessions: 0,
            totalScore: 0,
            totalPlayTime: 0,
            totalApples: 0,
            totalMisses: 0,
            reactionTimes: [],
          }
        }
        const dd = daily[d]
        dd.sessions += 1
        dd.totalScore += r.score || 0
        dd.totalPlayTime += r.playTime || 0
        dd.totalApples += r.applesCaught || 0
        dd.totalMisses += r.missedApples || 0
        if (r.averageReactionTime > 0) dd.reactionTimes.push(r.averageReactionTime)
      })
      return Object.values(daily)
        .map((d) => ({
          ...d,
          avgScore: d.sessions ? Math.round(d.totalScore / d.sessions) : 0,
          avgPlayTime: d.sessions ? Math.round(d.totalPlayTime / d.sessions) : 0,
          accuracy:
            d.totalApples + d.totalMisses > 0 ? Math.round((d.totalApples / (d.totalApples + d.totalMisses)) * 100) : 0,
          avgReactionTime: d.reactionTimes.length
            ? Math.round(d.reactionTimes.reduce((a, b) => a + b, 0) / d.reactionTimes.length)
            : 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    },

    clearTrainingRecords() {
      this.gameData.trainingRecords = []
      this.gameData.statistics = {
        totalSessions: 0,
        totalPlayTime: 0,
        consecutiveDays: 0,
        lastPlayDate: null,
        bestStreak: 0,
        totalApplesCaught: 0,
        totalMisses: 0,
        totalInterferenceHits: 0,
      }
      this.saveGameData()
    },
  },
})
