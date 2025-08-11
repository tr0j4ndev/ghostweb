import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"

const app = createApp(App)
const pinia = createPinia()

// 1. 先安装 Pinia
app.use(pinia) // ✅ 必须在前

// 2. 再导入和使用 store（重要：必须放在 app.use(pinia) 后面）
import { useGameStore } from "./stores/gameStore"
const gameStore = useGameStore() // ✅ 现在 Pinia 已激活

// 3. 初始化游戏数据
gameStore.loadGameData()

// 4. 安装路由并挂载应用
app.use(router)
app.mount("#app")
