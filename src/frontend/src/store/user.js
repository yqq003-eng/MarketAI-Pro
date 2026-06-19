import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const permissions = ref([])
  const roles = ref([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value.name || '未登录')
  const userAvatar = computed(() => userInfo.value.avatar || '')
  const userRole = computed(() => roles.value[0] || 'user')

  // 方法
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const setPermissions = (perms) => {
    permissions.value = perms
  }

  const setRoles = (newRoles) => {
    roles.value = newRoles
  }

  const initUserInfo = async () => {
    // 从本地存储或API获取用户信息
    if (token.value) {
      try {
        // 这里应该调用API获取最新用户信息
        // const res = await api.getUserInfo()
        // setUserInfo(res.data)
        // setPermissions(res.data.permissions)
        // setRoles(res.data.roles)
      } catch (error) {
        console.error('获取用户信息失败', error)
        logout()
      }
    }
  }

  const login = async (credentials) => {
    try {
      // 调用登录API
      // const res = await api.login(credentials)
      // setToken(res.data.token)
      // setUserInfo(res.data.user)
      // setPermissions(res.data.permissions)
      // setRoles(res.data.roles)
      
      // 模拟登录成功
      setToken('mock-jwt-token-12345')
      setUserInfo({
        id: 1,
        name: 'Admin',
        email: 'admin@marketai.com',
        avatar: '',
        role: 'admin'
      })
      setRoles(['admin'])
      setPermissions(['*'])
      
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {}
    permissions.value = []
    roles.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const hasPermission = (perm) => {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(perm)
  }

  const hasRole = (role) => {
    return roles.value.includes(role)
  }

  return {
    token,
    userInfo,
    permissions,
    roles,
    isLoggedIn,
    userName,
    userAvatar,
    userRole,
    setToken,
    setUserInfo,
    setPermissions,
    setRoles,
    initUserInfo,
    login,
    logout,
    hasPermission,
    hasRole
  }
})
