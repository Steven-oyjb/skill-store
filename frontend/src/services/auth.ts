import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

interface AuthConfig {
  appId: string
  redirectUri: string
  authUrl: string
}

export function useAuth() {
  const [user, setUser] = useState<{
    openId: string
    name: string
    avatar?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<AuthConfig | null>(null)
  const { showError } = useToast()
  const navigate = useNavigate()

  // 获取飞书授权配置
  useEffect(() => {
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data)
        }
      })
      .catch(console.error)
  }, [])

  // 验证当前用户
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user)
        } else {
          localStorage.removeItem('auth_token')
          if (data.error === 'token_expired') {
            showError('登录已过期，请重新登录')
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      })
  }, [showError])

  // 飞书登录
  const loginWithFeishu = (redirect = '/') => {
    if (!config) {
      showError('授权配置加载中，请稍后重试')
      return
    }

    // 保存登录成功后的回跳地址
    localStorage.setItem('auth_redirect', redirect)
    
    // 跳转到飞书授权页面
    window.location.href = config.authUrl + `&redirect=${encodeURIComponent('/api/auth/callback?redirect=' + redirect)}`
  }

  // 处理 OAuth 回调
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      showError(`登录失败: ${params.get('message') || error}`)
      navigate('/')
      return
    }

    if (token) {
      localStorage.setItem('auth_token', token)
      const redirect = localStorage.getItem('auth_redirect') || '/'
      localStorage.removeItem('auth_redirect')
      
      // 刷新页面以更新用户状态
      window.location.href = redirect
    }
  }, [navigate, showError])

  // 退出登录
  const logout = async () => {
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (e) {
        // 忽略错误
      }
    }

    localStorage.removeItem('auth_token')
    setUser(null)
    navigate('/')
  }

  // 获取认证头
  const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return {
    user,
    loading,
    isLoggedIn: !!user,
    loginWithFeishu,
    logout,
    getAuthHeader
  }
}

// 登录页面组件
export function LoginPage() {
  const { loginWithFeishu, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl">
            🎯
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Skill Store
        </h1>
        <p className="text-gray-600 mb-8">
          企业级 Skill 管理和分发平台
        </p>

        <button
          onClick={() => loginWithFeishu('/')}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.404 6.65l-5.998-5.608c-.682-.64-1.724-.64-2.406 0L9.606 2.446c-.682.64-.682 1.68 0 2.32l1.57 1.47H5.75c-.94 0-1.7.76-1.7 1.7v2.039c0 .94.76 1.7 1.7 1.7h4.426l-1.57 1.47c-.682.64-.682 1.68 0 2.32l1.394 1.304c.682.64 1.724.64 2.406 0l5.998-5.608c.682-.64.682-1.68 0-2.32l-1.394-1.304c-.34-.32-.79-.48-1.23-.48z"/>
          </svg>
          使用飞书账号登录
        </button>

        <p className="mt-6 text-xs text-gray-500">
          登录即表示同意我们的服务条款
        </p>
      </div>
    </div>
  )
}

// 需要登录的高阶组件
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isLoggedIn, loading, loginWithFeishu } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">加载中...</div>
        </div>
      )
    }

    if (!isLoggedIn) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">请先登录</p>
            <button
              onClick={() => loginWithFeishu()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              立即登录
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
