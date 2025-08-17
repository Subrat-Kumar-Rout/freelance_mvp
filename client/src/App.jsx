import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [user, setUser] = useState(null)
  const [gigs, setGigs] = useState([])
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: 'freelancer' })

  useEffect(() => {
    fetch(`${API}/gigs`).then(r=>r.json()).then(setGigs).catch(()=>{})
    fetch(`${API}/jobs`).then(r=>r.json()).then(setJobs).catch(()=>{})
  }, [])

  const signup = async () => {
    const res = await fetch(`${API}/signup`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (!res.ok) return alert('Signup failed')
    const data = await res.json(); setUser(data)
  }

  const login = async () => {
    const res = await fetch(`${API}/login`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: form.email }) })
    if (!res.ok) return alert('Login failed')
    const data = await res.json(); setUser(data)
  }

  const postGig = async () => {
    const title = prompt('Gig title (e.g. I will design your website)')
    if (!title) return
    const res = await fetch(`${API}/gigs`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user.id, title, description: '', price: 50 }) })
    const g = await res.json(); setGigs(prev=>[...prev, g])
  }

  const postJob = async () => {
    const title = prompt('Job title (e.g. Need a logo)')
    if (!title) return
    const res = await fetch(`${API}/jobs`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ client_id: user.id, title, description: '' }) })
    const j = await res.json(); setJobs(prev=>[...prev, j])
  }

  const hire = async (jobId) => {
    const fid = prompt('Enter freelancer id to hire (e.g. 1)')
    if (!fid) return
    const res = await fetch(`${API}/jobs/${jobId}/hire`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ freelancer_id: Number(fid) }) })
    const updated = await res.json()
    setJobs(prev=>prev.map(p=>p.id===updated.id?updated:p))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded">
        <h1 className="text-2xl font-bold">Freelance Marketplace — MVP</h1>

        {!user ? (
          <div className="mt-4 space-y-2">
            <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <input className="border p-2 w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <select className="border p-2 w-full" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={signup}>Sign Up</button>
              <button className="bg-gray-600 text-white px-3 py-2 rounded" onClick={login}>Login</button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email} • {user.role}</div>
              </div>
              <button className="text-sm text-red-600" onClick={()=>setUser(null)}>Logout</button>
            </div>

            <div className="mt-4 flex gap-2">
              {user.role === 'freelancer' && <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={postGig}>Post Gig</button>}
              {user.role === 'client' && <button className="bg-indigo-600 text-white px-3 py-2 rounded" onClick={postJob}>Post Job</button>}
            </div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold">Gigs</h2>
            <ul className="mt-2 space-y-2">
              {gigs.map(g=>(
                <li key={g.id} className="border p-3 rounded bg-white">
                  <div className="font-medium">{g.title} <span className="text-sm text-gray-500">#id:{g.id}</span></div>
                  <div className="text-sm">By user #{g.user_id} • ${g.price}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold">Jobs</h2>
            <ul className="mt-2 space-y-2">
              {jobs.map(j=>(
                <li key={j.id} className="border p-3 rounded bg-white">
                  <div className="font-medium">{j.title} <span className="text-sm text-gray-500">#id:{j.id}</span></div>
                  <div className="text-sm">Client #{j.client_id} • Status: {j.status}</div>
                  {user && user.role === 'client' && <div className="mt-2"><button className="px-2 py-1 text-sm bg-yellow-400 rounded" onClick={()=>alert('Waiting for hires...')}>View Proposals</button></div>}
                  {user && user.role === 'client' && j.status === 'Pending' && <div className="mt-2"><button className="px-2 py-1 text-sm bg-blue-500 text-white rounded" onClick={()=>hire(j.id)}>Hire Freelancer</button></div>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Tip: use simple numeric freelancer ids to hire (e.g. hire freelancer id 1). This is a quick demo MVP.
        </div>
      </div>
    </div>
  )
}
