<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import { useSdms } from '../stores/sdms'
import { LEVELS, TRADES } from '../data/seed'

const st = useSdms()
const q = ref(''), from = ref(''), to = ref(''), level = ref(''), trade = ref(''), type = ref('')
const day = (d) => new Date(d).toLocaleDateString('en-CA') // YYYY-MM-DD, local time
const time = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const all = computed(() => st.students
  .flatMap((s) => s.history.map((h) => ({ ...h, regNo: s.regNo, name: s.name, level: s.level, trade: s.trade })))
  .sort((a, b) => b.date.localeCompare(a.date)))

const rows = computed(() => all.value.filter((r) => {
  const t = q.value.toLowerCase()
  return (!t || r.name.toLowerCase().includes(t) || r.regNo.toLowerCase().includes(t)) &&
    (!level.value || r.level === level.value) && (!trade.value || r.trade === trade.value) &&
    (!type.value || r.type === type.value) && (!from.value || day(r.date) >= from.value) && (!to.value || day(r.date) <= to.value)
}))

function exportXlsx() {
  const data = rows.value.map((r, i) => ({
    No: i + 1, Date: day(r.date), Time: time(r.date), 'Reg. no': r.regNo, Student: r.name, Level: r.level, Trade: r.trade,
    Type: r.type === 'deduct' ? 'Marks removed' : 'Marks restored', Offense: r.offense,
    Marks: r.type === 'deduct' ? -r.points : r.points, Note: r.note, 'Recorded by': r.by, Term: r.term,
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = Object.keys(data[0] || {}).map((k) => ({ wch: k === 'Student' || k === 'Offense' || k === 'Note' ? 26 : 14 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Discipline history')
  XLSX.writeFile(wb, `discipline-history-${day(new Date())}.xlsx`)
}
</script>

<template>
  <section class="filters">
    <input v-model="q" placeholder="Search name or reg. number…" />
    <label>From <input type="date" v-model="from" /></label>
    <label>To <input type="date" v-model="to" /></label>
    <select v-model="level"><option value="">All levels</option><option v-for="l in LEVELS" :key="l">{{ l }}</option></select>
    <select v-model="trade"><option value="">All trades</option><option v-for="t in TRADES" :key="t">{{ t }}</option></select>
    <select v-model="type"><option value="">All records</option><option value="deduct">Marks removed</option><option value="restore">Marks restored</option></select>
    <button :disabled="!rows.length" @click="exportXlsx">⬇ Export to Excel</button>
  </section>
  <p>{{ rows.length }} record(s)</p>
  <div class="scroll">
    <table>
      <thead><tr><th>Date</th><th>Time</th><th>Reg. no</th><th>Student</th><th>Class</th><th>Offense</th><th>Marks</th><th>Note</th><th>By</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <td>{{ day(r.date) }}</td><td>{{ time(r.date) }}</td><td>{{ r.regNo }}</td><td>{{ r.name }}</td><td>{{ r.level }} {{ r.trade }}</td>
          <td>{{ r.offense }}</td><td :class="r.type === 'deduct' ? 'neg' : 'pos'">{{ r.type === 'deduct' ? '−' : '+' }}{{ r.points }}</td><td>{{ r.note }}</td><td>{{ r.by }}</td>
        </tr>
        <tr v-if="!rows.length"><td colspan="9" class="empty">No records yet.</td></tr>
      </tbody>
    </table>
  </div>
</template>
