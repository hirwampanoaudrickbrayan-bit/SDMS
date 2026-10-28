import { defineStore } from 'pinia'
import { seed, OFFENSES, MAX_MARKS, LEVELS, TRADES } from '../data/seed'

const KEY = 'sdms-v2'
// TODO (backend team): replace localStorage + signup with real API and authentication

export const useSdms = defineStore('sdms', {
  state: () =>
    JSON.parse(localStorage.getItem(KEY) || 'null') || {
      students: seed(), offenses: OFFENSES, audit: [], accounts: [], term: '2026 – Term 1', user: null,
    },
  getters: { isAdmin: (s) => s.user?.role === 'admin' },
  actions: {
    save() { localStorage.setItem(KEY, JSON.stringify(this.$state)) },
    log(action, detail) {
      this.audit.unshift({ date: new Date().toISOString(), user: this.user?.u, action, detail })
      this.save()
    },
    // no login page: signing up with a name that already exists signs that person back in.
    // The first account created becomes admin, everyone after is a patron.
    signup(name) {
      name = name.trim()
      if (!name) return false
      this.accounts ||= []
      let a = this.accounts.find((x) => x.name.toLowerCase() === name.toLowerCase())
      if (!a) { a = { name, role: this.accounts.length ? 'patron' : 'admin' }; this.accounts.push(a) }
      this.user = { u: a.name, role: a.role }
      this.log('signup', a.role)
      return true
    },
    logout() { this.log('logout', ''); this.user = null; this.save() },
    // marks are calculated from the current term's history, so a new term resets everyone to 40
    marks(s) {
      const t = s.history.filter((h) => h.term === this.term)
        .reduce((a, h) => a + (h.type === 'restore' ? h.points : -h.points), 0)
      return Math.min(MAX_MARKS, Math.max(0, MAX_MARKS + t))
    },
    record(id, type, offense, points, note) {
      const s = this.students.find((x) => x.id === id)
      s.history.unshift({ date: new Date().toISOString(), type, offense, points: Number(points), note, by: this.user.u, term: this.term })
      this.log(type, `${s.name} (${s.regNo}) ${type === 'deduct' ? '-' : '+'}${points} ${offense} ${note}`)
    },
    undoLast(id) {
      const s = this.students.find((x) => x.id === id)
      const h = s.history.shift()
      if (h) this.log('undo', `${s.name} (${s.regNo}) removed entry: ${h.offense} ${h.points}`)
    },
    addStudent(d) {
      this.students.push({ id: Math.max(0, ...this.students.map((s) => s.id)) + 1, parentPhone: '', history: [], ...d })
      this.log('add student', `${d.name} (${d.regNo})`)
    },
    removeStudent(id) {
      const s = this.students.find((x) => x.id === id)
      this.students = this.students.filter((x) => x.id !== id)
      this.log('delete student', `${s.name} (${s.regNo})`)
    },
    // CSV columns: regNo,name,level,trade,parentPhone  (invalid rows/header are skipped)
    importCsv(text) {
      let n = 0
      for (const line of text.split(/\r?\n/)) {
        const [regNo, name, level, trade, parentPhone = ''] = line.split(',').map((x) => x.trim())
        if (!name || !LEVELS.includes(level) || !TRADES.includes(trade) || this.students.some((s) => s.regNo === regNo)) continue
        this.addStudent({ regNo, name, level, trade, parentPhone }); n++
      }
      return n
    },
    newTerm(name) { this.term = name; this.log('new term', name) },
  },
})
