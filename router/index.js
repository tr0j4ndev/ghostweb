import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/Home.vue"
import Game from "../views/Game.vue"
import Levels from "../views/Levels.vue"
import Shop from "../views/Shop.vue"
import EndlessSetup from "../views/EndlessSetup.vue"
import Reports from "../views/Reports.vue"
import SaveManager from "../views/SaveManager.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/game",
    name: "Game",
    component: Game,
  },
  {
    path: "/levels",
    name: "Levels",
    component: Levels,
  },
  {
    path: "/shop",
    name: "Shop",
    component: Shop,
  },
  {
    path: "/endless-setup",
    name: "EndlessSetup",
    component: EndlessSetup,
  },
  {
    path: "/reports",
    name: "Reports",
    component: Reports,
  },
  {
    path: "/save-manager",
    name: "SaveManager",
    component: SaveManager,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
