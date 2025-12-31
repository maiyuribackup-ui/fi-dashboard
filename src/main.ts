import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles/main.css'

import DashboardPage from './pages/DashboardPage.vue'
import FDListPage from './pages/FDListPage.vue'
import TransactionsPage from './pages/TransactionsPage.vue'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/fds', component: FDListPage },
  { path: '/transactions', component: TransactionsPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.mount('#app')
