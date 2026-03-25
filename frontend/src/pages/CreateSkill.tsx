import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { skillService, aiService, Question, Framework } from "../services/api"

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["基本信息", "AI问答", "生成框架", "本地测试", "提交发布"]
  return (
    <div className="flex items-center mb-8">
      {steps.map((label, i) => {
        const n = i + 1, isActive = n === currentStep, isDone = n < currentStep
        return (
          <div key={n} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-600 text-white" : "bg-gray-200"}`}>{isDone ? "✓" : n}</div>
            <span className={`ml-2 text-sm ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`}>{label}</span>
            {n < 5 && <div className={`w-12 h-0.5 mx-2 ${isDone ? "bg-green-600" : "bg-gray-200"}`}></div>}
          </div>
        )
      })}
    </div>
  )
}

function StepBasicInfo({ data, onChange, onNext }: { data: any; onChange: (d: any) => void; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">填写基本信息</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">名称 *</label><input type="text" value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label className="block text-sm font-medium mb-1">描述 *</label><textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
        <div><label className="block text-sm font-medium mb-1">分类 *</label><select value={data.category} onChange={(e) => onChange({ ...data, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">选择</option><option value="飞书集成">飞书集成</option><option value="AI工具">AI工具</option><option value="效率工具">效率工具</option></select></div>
        <div><label className="block text-sm font-medium mb-1">标签</label><input type="text" value={data.tags} onChange={(e) => onChange({ ...data, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
      </div>
      <div className="mt-6 flex justify-end"><button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">下一步</button></div>
    </div>
  )
}

function StepAIQuestion({ userInput, onNext, onBack }: { userInput: string; onNext: (a: Record<string, string>) => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [qs, setQs] = useState<Question[]>([])
  const [ans, setAns] = useState<Record<string, string>>({})
  const gen = async () => { setLoading(true); try { setQs(await aiService.generateQuestions(userInput)) } finally { setLoading(false) } }
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">AI问答</h2>
      {!qs.length && <div className="text-center py-8"><button onClick={gen} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg">{loading ? "处理中" : "生成选择题"}</button></div>}
      {qs.length > 0 && <div className="space-y-4">{qs.map((q, i) => (<div key={q.key} className="bg-gray-50 p-4 rounded-lg"><p className="font-medium mb-2">Q{i+1}. {q.question}</p><div className="space-y-1">{q.options.map(o => (<label key={o} className="flex items-center p-2 border rounded cursor-pointer"><input type="radio" name={q.key} checked={ans[q.key] === o} onChange={() => setAns({ ...ans, [q.key]: o })} className="mr-2" />{o}</label>))}</div></div>))}</div>}
      <div className="mt-6 flex justify-between"><button onClick={onBack} className="px-4 py-2 border rounded-lg">上一步</button>{qs.length > 0 && <button onClick={() => onNext(ans)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">下一步</button>}</div>
    </div>
  )
}

function StepGenerateFramework({ userInput, answers, fw, onUpd, onNext, onBack }: { userInput: string; answers: Record<string, string>; fw: Framework | null; onUpd: (f: Framework) => void; onNext: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const gen = async () => { setLoading(true); try { onUpd(await aiService.generateFramework(userInput, answers)) } finally { setLoading(false) } }
  const change = (f: string, v: any) => { if (!fw) return; if (f.startsWith("c.")) { const k = f.slice(2); onUpd({ ...fw, config: { ...fw.config, [k]: v } }) } else { onUpd({ ...fw, [f]: v }) } }
  const addP = () => { if (!fw) return; onUpd({ ...fw, parameters: [...fw.parameters, { name: "", type: "string", required: false, description: "" }] }) }
  const rmP = (i: number) => { if (!fw) return; onUpd({ ...fw, parameters: fw.parameters.filter((_, x) => x !== i) }) }
  const chgP = (i: number, f: string, v: any) => { if (!fw) return; const p = [...fw.parameters]; p[i] = { ...p[i], [f]: v }; onUpd({ ...fw, parameters: p }) }
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">生成框架</h2>
      {!fw && <div className="text-center py-8"><button onClick={gen} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg">{loading ? "生成中" : "生成框架"}</button></div>}
      {fw && <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4"><div><label className="text-sm">名称</label><input value={fw.name} onChange={(e) => change("name", e.target.value)} className="w-full p-2 border rounded" /></div><div><label className="text-sm">分类</label><select value={fw.category} onChange={(e) => change("category", e.target.value)} className="w-full p-2 border rounded"><option>飞书集成</option><option>AI工具</option><option>效率工具</option></select></div></div>
        <div><label className="text-sm">描述</label><textarea value={fw.description} onChange={(e) => change("description", e.target.value)} className="w-full p-2 border rounded" rows={2} /></div>
        <div><label className="text-sm">标签</label><input value={fw.tags.join(",")} onChange={(e) => change("tags", e.target.value.split(","))} className="w-full p-2 border rounded" /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="text-sm">触发</label><input value={fw.config.triggers.join(",")} onChange={(e) => change("c.triggers", e.target.value.split(","))} className="w-full p-2 border rounded" /></div><div><label className="text-sm">动作</label><input value={fw.config.actions.join(",")} onChange={(e) => change("c.actions", e.target.value.split(","))} className="w-full p-2 border rounded" /></div></div>
        <div><label className="text-sm">Prompt</label><textarea value={fw.prompt} onChange={(e) => change("prompt", e.target.value)} className="w-full p-2 border rounded font-mono text-sm" rows={8} /></div>
        <div><div className="flex justify-between mb-2"><label className="text-sm">参数</label><button onClick={addP} className="text-blue-600 text-sm">+添加</button></div>{fw.parameters.map((p, i) => (<div key={i} className="flex gap-2 mb-1"><input value={p.name} onChange={(e) => chgP(i, "name", e.target.value)} placeholder="名" className="flex-1 p-1 border rounded" /><select value={p.type} onChange={(e) => chgP(i, "type", e.target.value)} className="p-1 border rounded"><option>string</option><option>number</option></select><label className="text-sm"><input type="checkbox" checked={p.required} onChange={(e) => chgP(i, "required", e.target.checked)} />必填</label><input value={p.description} onChange={(e) => chgP(i, "description", e.target.value)} placeholder="描述" className="flex-1 p-1 border rounded" /><button onClick={() => rmP(i)} className="text-red-500">X</button></div>))}</div>
      </div>}
      <div className="mt-6 flex justify-between"><button onClick={onBack} className="px-4 py-2 border rounded-lg">上一步</button>{fw && <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">下一步</button>}</div>
    </div>
  )
}

function StepLocalTest({ fw, onNext, onBack }: { fw: Framework | null; onNext: () => void; onBack: () => void }) {
  const [params, setParams] = useState<Record<string, string>>({})
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const test = async () => { if (!fw) return; setLoading(true); try { setResult((await aiService.testSkill(fw.prompt, params)).result) } finally { setLoading(false) } }
  if (!fw) return null
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">本地测试</h2>
      <div className="space-y-3 mb-4">{fw.parameters.map(p => (<div key={p.name}><label className="text-sm">{p.name}</label><input value={params[p.name] || ""} onChange={(e) => setParams({ ...params, [p.name]: e.target.value })} className="w-full p-2 border rounded" /></div>))}<button onClick={test} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg">{loading ? "测试中" : "运行测试"}</button></div>
      {result && <pre className="bg-gray-100 p-4 rounded text-sm">{result}</pre>}
      <div className="mt-6 flex justify-between"><button onClick={onBack} className="px-4 py-2 border rounded-lg">上一步</button><button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg">下一步</button></div>
    </div>
  )
}

function StepSubmit({ fw, basic, onSub, onBack, onSave }: { fw: Framework | null; basic: any; onSub: (s: "public"|"private") => void; onBack: () => void; onSave: () => void }) {
  const [scope, setScope] = useState<"public"|"private">("private")
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">提交发布</h2>
      <div className="bg-gray-50 p-4 rounded-lg mb-6"><p>名称: {basic.name}</p><p>描述: {basic.description}</p><p>分类: {basic.category}</p>{fw && <><p>触发: {fw.config.triggers.join(",")}</p><p>动作: {fw.config.actions.join(",")}</p></>}</div>
      <div className="mb-6"><label className="text-sm font-medium mb-2 block">发布范围</label><label className={`flex items-center p-3 border rounded cursor-pointer ${scope === "private" ? "border-blue-500 bg-blue-50" : ""}`}><input type="radio" name="s" value="private" checked={scope === "private"} onChange={() => setScope("private")} className="mr-2" />私有(仅自己)</label><label className={`flex items-center p-3 border rounded cursor-pointer mt-2 ${scope === "public" ? "border-blue-500 bg-blue-50" : ""}`}><input type="radio" name="s" value="public" checked={scope === "public"} onChange={() => setScope("public")} className="mr-2" />公开(需审核)</label></div>
      <div className="mt-6 flex justify-between"><button onClick={onBack} className="px-4 py-2 border rounded-lg">上一步</button><div className="space-x-2"><button onClick={onSave} className="px-4 py-2 border rounded-lg">保存草稿</button><button onClick={() => onSub(scope)} className="px-6 py-2 bg-green-600 text-white rounded-lg">提交发布</button></div></div>
    </div>
  )
}

export default function CreateSkill() {
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [basic, setBasic] = useState({ name: "", description: "", category: "", tags: "" })
  const [ans, setAns] = useState<Record<string, string>>({})
  const [fw, setFw] = useState< Framework | null >(null)
  const userInput = basic.name + " - " + basic.description
  const submit = async (_scope: "public"|"private") => { if (!fw) return; await skillService.create({ name: fw.name, description: fw.description, category: fw.category, tags: fw.tags, author: "用户", config: fw.config, prompt: fw.prompt, parameters: fw.parameters, status: "draft" }); nav("/") }
  const save = async () => { if (!fw) return; await skillService.create({ name: fw.name, description: fw.description, category: fw.category, tags: fw.tags, author: "用户", config: fw.config, prompt: fw.prompt, parameters: fw.parameters, status: "draft" }); nav("/") }
  return (
    <div><Link to="/" className="text-blue-600 mb-4 inline-block">返回</Link><h1 className="text-2xl font-bold mb-6">创建Skill</h1><StepIndicator currentStep={step} /><div className="bg-white border rounded-lg p-6 max-w-4xl">
      {step === 1 && <StepBasicInfo data={basic} onChange={setBasic} onNext={() => setStep(2)} />}
      {step === 2 && <StepAIQuestion userInput={userInput} onNext={(a) => { setAns(a); setStep(3) }} onBack={() => setStep(1)} />}
      {step === 3 && <StepGenerateFramework userInput={userInput} answers={ans} fw={fw} onUpd={setFw} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <StepLocalTest fw={fw} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
      {step === 5 && <StepSubmit fw={fw} basic={basic} onSub={(s) => submit(s)} onBack={() => setStep(4)} onSave={save} />}
    </div></div>
  )
}
