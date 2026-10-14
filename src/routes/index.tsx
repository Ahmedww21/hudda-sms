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

interface Teacher {
  id: string
  name: string
  email: string
  department: string
  created_at: string
}

function DashboardPage() {
  const { user, role, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'attendance'>('students')

  // Students state
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [studentGrade, setStudentGrade] = useState('')
  const [submittingStudent, setSubmittingStudent] = useState(false)

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  // Attendance state
  const [selectedClass, setSelectedClass] = useState('Grade 10-A')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({})
  const [savingAttendance, setSavingAttendance] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchTeachers()
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
      setLoadingStudents(false)
    }
  }

  async function fetchTeachers() {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setTeachers(data)
    } catch (err) {
      console.error('Error loading teachers:', err)
    } finally {
      setLoadingTeachers(false)
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName || !studentEmail) return

    setSubmittingStudent(true)
    try {
      const { error } = await supabase
        .from('students')
        .insert([{ name: studentName, email: studentEmail, grade: studentGrade || '10th Grade' }])

      if (error) throw error

      setStudentName('')
      setStudentEmail('')
      setStudentGrade('')
      setIsStudentModalOpen(false)
      fetchStudents()
    } catch (err) {
      console.error('Error inserting student:', err)
      alert('Failed to add student. Check console or database permissions.')
    } finally {
      setSubmittingStudent(false)
    }
  }

  function handleMarkAttendance(studentId: string, status: string) {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }))
  }

  async function handleSaveAttendance() {
    setSavingAttendance(true)
    try {
      const payload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student_id: studentId,
        class_name: selectedClass,
        date: attendanceDate,
        status,
      }))

      if (payload.length === 0) {
        alert('Please mark attendance for at least one student.')
        setSavingAttendance(false)
        return
      }

      const { error } = await supabase.from('attendance').insert(payload)
      if (error) throw error
      alert('Attendance successfully saved to Supabase!')
    } catch (err) {
      console.error('Error saving attendance:', err)
      alert('Failed to save attendance records.')
    } finally {
      setSavingAttendance(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
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

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="mt-2 text-3xl font-bold text-white">{students.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Teachers</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{teachers.length || 12}</p>
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'students'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Directory
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'teachers'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Teacher Directory
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'attendance'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Attendance Tracker
          </button>
        </div>

        {/* TAB 1: STUDENT DIRECTORY */}
        {activeTab === 'students' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Student Directory</h2>
                <p className="text-sm text-slate-400">Manage enrolled students and academic profiles.</p>
              </div>
              {role === 'admin' && (
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition shadow"
                >
                  + Add Student
                </button>
              )}
            </div>

            <div className="mt-4 overflow-x-auto">
              {loadingStudents ? (
                <div className="py-8 text-center text-slate-500">Loading student records...</div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p>No students found in database.</p>
                  <p className="text-xs mt-1 text-slate-600">Click '+ Add Student' above to insert your first record.</p>
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
        )}

        {/* TAB 2: TEACHER DIRECTORY */}
        {activeTab === 'teachers' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Teacher Directory</h2>
                <p className="text-sm text-slate-400">Faculty members and department assignments.</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {loadingTeachers ? (
                <div className="py-8 text-center text-slate-500">Loading teacher records...</div>
              ) : teachers.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p>No teachers found in database.</p>
                  <p className="text-xs mt-1 text-slate-600">Populate the 'teachers' table in Supabase to view faculty.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teachers.map((tch) => (
                      <tr key={tch.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-medium text-white">{tch.name}</td>
                        <td className="px-4 py-3 text-slate-400">{tch.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-slate-700">
                            {tch.department || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(tch.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE TRACKER */}
        {activeTab === 'attendance' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Class Attendance Tracker</h2>
                <p className="text-sm text-slate-400">Record daily student attendance by class.</p>
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 11-B">Grade 11-B</option>
                    <option value="Grade 12-C">Grade 12-C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="self-end">
                  <button
                    onClick={handleSaveAttendance}
                    disabled={savingAttendance}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition shadow disabled:opacity-50"
                  >
                    {savingAttendance ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {students.length === 0 ? (
                <div className="py-12 text-center text-slate-500">No students available to track attendance.</div>
              ) : (
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {students.map((st) => {
                      const currentStatus = attendanceRecords[st.id] || 'Present'
                      return (
                        <tr key={st.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-medium text-white">{st.name}</td>
                          <td className="px-4 py-3 text-slate-400">{st.grade || 'N/A'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex rounded-lg p-1 bg-slate-950 border border-slate-800 space-x-1">
                              <button
                                onClick={() => handleMarkAttendance(st.id, 'Present')}
                                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(st.id, 'Late')}
                                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                  currentStatus === 'Late'
                                    ? 'bg-amber-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(st.id, 'Absent')}
                                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-semibold text-white">Add New Student</h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Leyla Yılmaz"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g., leyla@student.arel.edu.tr"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Grade Level</label>
                <input
                  type="text"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  placeholder="e.g., 10th Grade / Freshman"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStudent}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition disabled:opacity-50"
                >
                  {submittingStudent ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
