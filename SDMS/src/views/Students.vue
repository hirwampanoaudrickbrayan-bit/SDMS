<script setup>
import { ref, computed } from 'vue'
import { useSdms } from '../stores/sdms'
import { TRADES, LEVELS, MAX_MARKS, CRITICAL, status } from '../data/seed'
import DeductModal from '../components/DeductModal.vue'

const emit = defineEmits(['recorded'])
const st = useSdms()
const showDone = ref(false)
const doneToday = (s) => s.history.some((h) => h.type === 'deduct' && new Date(h.date).toDateString() === new Date().toDateString())
const q = ref(''), level = ref(''), trade = ref(''), onlyLow = ref(false), selectedId = ref(null)
const list = computed(() => st.students.filter((s) => {
  const t = q.value.toLowerCase()
  return (!t || s.name.toLowerCase().includes(t) || s.regNo.toLowerCase().includes(t)) &&
    (!level.value || s.level === level.value) && (!trade.value || s.trade === trade.value) &&
    (!onlyLow.value || st.marks(s) < CRITICAL) && (showDone.value || !doneToday(s))
}))
const selected = computed(() => st.students.find((s) => s.id === selectedId.value))
const critical = computed(() => st.students.filter((s) => st.marks(s) < CRITICAL).length)
const warning = computed(() => st.students.filter((s) => st.marks(s) >= CRITICAL && st.marks(s) < 30).length)
</script>
<template>
  <section class="stats">
    <div><b>{{ st.students.length }}</b> students</div>
    <div class="warning"><b>{{ warning }}</b> warning (20–29)</div>
    <div class="critical"><b>{{ critical }}</b> critical (&lt; {{ CRITICAL }})</div>
  </section>
  <section class="filters">
    <input v-model="q" placeholder="Search name or reg. number…" />
    <select v-model="level"><option value="">All levels</option><option v-for="l in LEVELS" :key="l">{{ l }}</option></select>
    <select v-model="trade"><option value="">All trades</option><option v-for="t in TRADES" :key="t">{{ t }}</option></select>
    <label><input type="checkbox" v-model="onlyLow" /> Critical only</label>
    <label><input type="checkbox" v-model="showDone" /> Show students already recorded today</label>
  </section>
  <table>
    <thead><tr><th>Reg. no</th><th>Name</th><th>Class</th><th>Marks</th><th></th></tr></thead>
    <tbody>
      <tr v-for="s in list" :key="s.id" :class="status(st.marks(s))">
        <td>{{ s.regNo }}</td><td>{{ s.name }}</td><td>{{ s.level }} {{ s.trade }}</td>
        <td><span class="badge">{{ st.marks(s) }}/{{ MAX_MARKS }}</span></td>
        <td><button @click="selectedId = s.id">Open</button></td>
      </tr>
      <tr v-if="!list.length"><td colspan="5" class="empty">No students found.</td></tr>
    </tbody>
  </table>
  <DeductModal v-if="selected" :student="selected" @close="selectedId = null" @recorded="selectedId = null; emit('recorded')" />
</template>
