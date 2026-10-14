import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

interface Student {
  id: string
  name: string
  email: string
  grade: string
  created_at: string
}

function DashboardPage() {
  const { user, role, signOut } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setStudents(data)
    } catch (err) {
      console.error('Error loading students:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-sky-400">HUDDA SMS</h1>
          <span className="rounded-full bg-sky-900/50 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-700">
            Role: {role ? role.toUpperCase() : 'GUEST'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-400">{user?.email ?? 'Guest'}</span>
          <button
            onClick={signOut}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="mt-2 text-3xl font-bold text-white">{students.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Teachers</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">12</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Classes</p>
            <p className="mt-2 text-3xl font-bold text-indigo-400">8</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Status</p>
            <p className="mt-2 text-sm font-semibold text-emerald-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Operational
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-white">Student Directory</h2>
              <p className="text-sm text-slate-400">Manage enrolled students and academic profiles.</p>
            </div>
            {role === 'admin' && (
              <button className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition shadow">
                + Add Student
              </button>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading student records...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>No students found in database.</p>
                <p className="text-xs mt-1 text-slate-600">Insert sample rows in your Supabase 'students' table to populate this view.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-medium text-white">{st.name}</td>
                      <td className="px-4 py-3 text-slate-400">{st.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-sky-300 border border-slate-700">
                          {st.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(st.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
