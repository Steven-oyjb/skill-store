import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { skillService, Skill } from '../services/api'

export default function SkillEditor() {
  const { id } = useParams<{ id: string }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'prompt' | 'parameters' | 'preview'>('config')

  useEffect(() => {
    if (id) loadSkill()
  }, [id])

  const loadSkill = async () => {
    try {
      const data = await skillService.getById(id!)
      setSkill(data)
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!skill) return
    setSaving(true)
    try {
      await skillService.update(skill.id, skill)
      alert('保存成功')
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 text-center">加载中...</div>
  if (!skill) return <div className="p-8 text-center">Skill 不存在</div>

  return (
    <div>
      <Link to={`/skills/${id}`} className="text-blue-600 hover:underline mb-4 inline-block">← 返回详情</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">编辑 Skill</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
      <div className="flex border-b mb-6">
        {[
          { key: 'config', label: '基础配置' },
          { key: 'prompt', label: 'Prompt' },
          { key: 'parameters', label: '参数' },
          { key: 'preview', label: '预览' }
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'config' && <ConfigTab skill={skill} setSkill={setSkill} />}
        {activeTab === 'prompt' && <PromptTab skill={skill} setSkill={setSkill} />}
        {activeTab === 'parameters' && <ParametersTab skill={skill} setSkill={setSkill} />}
        {activeTab === 'preview' && <PreviewTab skill={skill} />}
      </div>
    </div>
  )
}

function ConfigTab({ skill, setSkill }: { skill: Skill; setSkill: (s: Skill) => void }) {
  const handleChange = (field: string, value: any) => {
    if (field.startsWith('config.')) {
      const configKey = field.replace('config.', '')
      setSkill({ ...skill, config: { ...skill.config, [configKey]: value } })
    } else {
      setSkill({ ...skill, [field]: value })
    }
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">名称</label><input type="text" value={skill.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">分类</label><select value={skill.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="飞书集成">飞书集成</option><option value="AI工具">AI工具</option><option value="效率工具">效率工具</option></select></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">描述</label><textarea value={skill.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
      <div><label className="block text-sm font-medium mb-1">标签</label><input type="text" value={skill.tags.join(', ')} onChange={(e) => handleChange('tags', e.target.value.split(','))} className="w-full px-3 py-2 border rounded-lg" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">触发条件</label><input type="text" value={skill.config.triggers.join(', ')} onChange={(e) => handleChange('config.triggers', e.target.value.split(','))} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">执行动作</label><input type="text" value={skill.config.actions.join(', ')} onChange={(e) => handleChange('config.actions', e.target.value.split(','))} className="w-full px-3 py-2 border rounded-lg" /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">状态</label><select value={skill.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="draft">草稿</option><option value="published">已发布</option></select></div>
    </div>
  )
}

function PromptTab({ skill, setSkill }: { skill: Skill; setSkill: (s: Skill) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Prompt 内容</label>
      <textarea value={skill.prompt || ''} onChange={(e) => setSkill({ ...skill, prompt: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg font-mono text-sm" rows={20} />
    </div>
  )
}

function ParametersTab({ skill, setSkill }: { skill: Skill; setSkill: (s: Skill) => void }) {
  const params = skill.parameters || []
  const handleChange = (index: number, field: string, value: any) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: value }
    setSkill({ ...skill, parameters: newParams })
  }
  const addParam = () => setSkill({ ...skill, parameters: [...params, { name: '', type: 'string', required: false, description: '' }] })
  const removeParam = (index: number) => setSkill({ ...skill, parameters: params.filter((_, i) => i !== index) })
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium">参数配置</label>
        <button onClick={addParam} className="text-sm text-blue-600">+ 添加参数</button>
      </div>
      {params.length === 0 ? <p className="text-gray-500 italic text-center py-8">暂无参数</p> : (
        <div className="space-y-4">
          {params.map((param, index) => (
            <div key={index} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
              <input type="text" value={param.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="参数名" />
              <select value={param.type} onChange={(e) => handleChange(index, 'type', e.target.value)} className="w-28 px-2 py-2 border rounded-lg text-sm"><option value="string">字符串</option><option value="number">数字</option></select>
              <label className="flex items-center text-sm whitespace-nowrap"><input type="checkbox" checked={param.required} onChange={(e) => handleChange(index, 'required', e.target.checked)} className="mr-1" />必填</label>
              <input type="text" value={param.description} onChange={(e) => handleChange(index, 'description', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="参数描述" />
              <button onClick={() => removeParam(index)} className="text-red-500 hover:text-red-700 p-2">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PreviewTab({ skill }: { skill: Skill }) {
  const [testParams, setTestParams] = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const params = skill.parameters || []
  const handleParamChange = (name: string, value: string) => setTestParams({ ...testParams, [name]: value })
  const handleTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: skill.prompt, parameters: testParams }) })
      const data = await res.json()
      setResult(data.data?.result || '测试完成')
    } catch { setResult('测试失败') }
    finally { setLoading(false) }
  }
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">{skill.name}</h3>
        <p className="text-gray-600 mb-4">{skill.description}</p>
        <div className="flex gap-2 flex-wrap">{skill.tags.map((tag) => (<span key={tag} className="px-2 py-1 bg-white rounded-full text-sm text-gray-600">{tag}</span>))}</div>
      </div>
      {params.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">测试参数</h4>
          <div className="space-y-3">{params.map((param) => (<div key={param.name}><label className="text-sm text-gray-700">{param.name}</label><input type="text" value={testParams[param.name] || ''} onChange={(e) => handleParamChange(param.name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>))}</div>
          <button onClick={handleTest} disabled={loading} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{loading ? '测试中...' : '运行测试'}</button>
        </div>
      )}
      {result && <div><h4 className="font-medium mb-2">输出结果</h4><pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-sm">{result}</pre></div>}
      <div><h4 className="font-medium mb-2">Skill JSON</h4><pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">{JSON.stringify(skill, null, 2)}</pre></div>
    </div>
  )
}
