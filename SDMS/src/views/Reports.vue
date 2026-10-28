<script setup>
import { ref, computed } from 'vue'
import { useSdms } from '../stores/sdms'
import { TRADES, LEVELS, CRITICAL, actionFor } from '../data/seed'
const st = useSdms()
const level = ref(''), trade = ref(''), onlyLow = ref(false)
const rows = computed(() => st.students
  .filter((s) => (!level.value || s.level === level.value) && (!trade.value || s.trade === trade.value) && (!onlyLow.value || st.marks(s) < CRITICAL))
  .map((s) => ({ ...s, m: st.marks(s) })).sort((a, b) => a.m - b.m))
const printPage = () => window.print()
function exportCsv() {
  const csv = ['regNo,name,level,trade,marks,action,parentPhone', ...rows.value.map((r) =>
    [r.regNo, r.name, r.level, r.trade, r.m, actionFor(r.m), r.parentPhone].join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `discipline-report-${st.term}.csv`; a.click()
}
</script>
<template>
  <section class="filters noprint">
    <select v-model="level"><option value="">All levels</option><option v-for="l in LEVELS" :key="l">{{ l }}</option></select>
    <select v-model="trade"><option value="">All trades</option><option v-for="t in TRADES" :key="t">{{ t }}</option></select>
    <label><input type="checkbox" v-model="onlyLow" /> Critical only (committee list)</label>
    <button @click="printPage">🖨 Print / PDF</button><button @click="exportCsv">⬇ Excel (CSV)</button>
  </section>
  <h2 class="printonly">Discipline report – {{ st.term }} {{ level }} {{ trade }}</h2>
  <table>
    <thead><tr><th>Reg. no</th><th>Name</th><th>Class</th><th>Marks</th><th>Action</th></tr></thead>
    <tbody><tr v-for="r in rows" :key="r.id"><td>{{ r.regNo }}</td><td>{{ r.name }}</td><td>{{ r.level }} {{ r.trade }}</td><td>{{ r.m }}/40</td><td>{{ actionFor(r.m) }}</td></tr></tbody>
  </table>
</template>
