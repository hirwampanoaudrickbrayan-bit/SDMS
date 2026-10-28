<script setup>
import { ref, computed } from 'vue'
import { useSdms } from '../stores/sdms'
import { CRITICAL, MAX_MARKS, actionFor } from '../data/seed'

const props = defineProps({ student: Object })
const emit = defineEmits(['close', 'recorded'])
const st = useSdms()
const mode = ref('deduct'), offense = ref(st.offenses[0].name), points = ref(st.offenses[0].points), note = ref('')
const cur = computed(() => st.marks(props.student))
const pick = () => (points.value = st.offenses.find((o) => o.name === offense.value).points)
const after = computed(() => Math.min(MAX_MARKS, Math.max(0, cur.value + (mode.value === 'deduct' ? -1 : 1) * points.value)))
const valid = computed(() => points.value > 0 && (mode.value === 'deduct' || note.value.trim()))
function submit() {
  if (!valid.value) return
  st.record(props.student.id, mode.value, mode.value === 'deduct' ? offense.value : 'Marks restored', points.value, note.value.trim())
  note.value = ''
  if (mode.value === 'deduct') emit('recorded')
}
const sms = computed(() => `sms:${props.student.parentPhone}?body=` + encodeURIComponent(
  `SJITC: ${props.student.name} now has ${cur.value}/${MAX_MARKS} discipline marks. Please contact the school.`))
const fmt = (d) => new Date(d).toLocaleString()
</script>
<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <h2>{{ student.name }} <small>{{ student.regNo }} · {{ student.level }} {{ student.trade }}</small></h2>
      <p>Marks ({{ st.term }}): <b>{{ cur }}/{{ MAX_MARKS }}</b> <span v-if="actionFor(cur)" class="alert">{{ actionFor(cur) }}</span></p>
      <label>Parent phone <input v-model="student.parentPhone" placeholder="07…" @change="st.save()" /></label>
      <a v-if="student.parentPhone" :href="sms" class="sms">📱 Send SMS to parent</a>

      <div class="tabs"><button :class="{ on: mode === 'deduct' }" @click="mode = 'deduct'">Remove marks</button>
        <button :class="{ on: mode === 'restore' }" @click="mode = 'restore'">Give back marks</button></div>
      <label v-if="mode === 'deduct'">Crime / offense
        <select v-model="offense" @change="pick"><option v-for="o in st.offenses" :key="o.name">{{ o.name }}</option></select></label>
      <label>Marks <input type="number" min="1" v-model.number="points" /></label>
      <label>{{ mode === 'deduct' ? 'Note (optional)' : 'Reason (required)' }} <input v-model="note" /></label>
      <p v-if="mode === 'deduct' && after < CRITICAL" class="alert">⚠ Marks will drop to {{ after }}: risk of being sent to another school.</p>
      <p v-else>Marks after: <b>{{ after }}</b></p>
      <div class="actions">
        <button :class="mode === 'deduct' ? 'danger' : ''" :disabled="!valid" @click="submit">{{ mode === 'deduct' ? 'Remove marks' : 'Give back' }}</button>
        <button class="ghost" @click="emit('close')">Close</button>
      </div>

      <h3>History</h3>
      <ul class="history">
        <li v-for="(h, i) in student.history" :key="i">
          <span>{{ h.type === 'deduct' ? '−' : '+' }}{{ h.points }} · {{ h.offense }}<em v-if="h.note"> — {{ h.note }}</em></span>
          <small>{{ fmt(h.date) }} · {{ h.by }} · {{ h.term }}</small>
        </li>
        <li v-if="!student.history.length" class="empty">No records.</li>
      </ul>
      <button v-if="st.isAdmin && student.history.length" class="ghost" @click="st.undoLast(student.id)">Undo last entry (admin)</button>
    </div>
  </div>
</template>
