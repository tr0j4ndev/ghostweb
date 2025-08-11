<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App.vue 作为根组件，只需要渲染路由视图
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 20px;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 40px 20px 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.custom-back-button {
  padding: 6px 10px;
  font-size: 13px;
  margin: 0;
}

.header-title {
  font-size: 25px;
  font-weight: bold;
  color: #8b5cf6;
  flex-grow: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-coins {
  color: #f59e0b;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}

.main-scroll-area {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
}

.container {
  box-sizing: border-box;
  padding: 10px 20px 20px;
}

.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.1);
  padding: 20px;
  margin: 10px auto;
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
}

.btn {
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  margin: 8px;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.btn:hover {
  background: #7c3aed;
  transform: scale(0.98);
}

.btn-outline {
  background: transparent;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
}

.btn-outline:hover {
  background: #f3e8ff;
}

.btn-green {
  background: #10b981;
}

.btn-green:hover {
  background: #059669;
}

.badge {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.badge-primary {
  background: #8b5cf6;
  color: white;
}

.text-center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-small {
  gap: 8px;
}

.gap-medium {
  gap: 16px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #8b5cf6;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 16px;
}

.coins {
  color: #f59e0b;
  font-weight: 600;
  font-size: 16px;
}
</style>
