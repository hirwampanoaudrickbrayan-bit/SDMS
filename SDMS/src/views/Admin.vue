<script setup>
import { ref } from 'vue'
import { useSdms } from '../stores/sdms'
import { LEVELS, TRADES } from '../data/seed'
const st = useSdms()
const term = ref(''), msg = ref('')
const f = ref({ regNo: '', name: '', level: 'L3', trade: 'SOD', parentPhone: '' })
const off = ref({ name: '', points: 1 })
function add() {
  if (!f.value.regNo || !f.value.name) return
  if (st.students.some((s) => s.regNo === f.value.regNo)) return (msg.value = 'Reg. number already exists')
  st.addStudent({ ...f.value }); f.value.regNo = f.value.name = ''; msg.value = 'Student added'
}
async function imp(e) { msg.value = `${st.importCsv(await e.target.files[0].text())} students imported`; e.target.value = '' }
function addOff() { if (off.value.name) { st.offenses.push({ ...off.value }); st.log('offense added', off.value.name); off.value = { name: '', points: 1 } } }
function delOff(i) { st.log('offense removed', st.offenses[i].name); st.offenses.splice(i, 1) }
function del(s) { if (confirm(`Delete ${s.name}?`)) st.removeStudent(s.id) }
const newTerm = () => { if (term.value && confirm('Start new term? Everyone returns to 40 marks (history is kept).')) { st.newTerm(term.value); term.value = '' } }
</script>
<template>
  <p v-if="msg" class="alert">{{ msg }}</p>
  <h3>Term / academic year</h3>
  <div class="filters"><input v-model="term" placeholder="e.g. 2026 – Term 2" /><button @click="newTerm">Start new term</button></div>

  <h3>Add student</h3>
  <div class="filters">
    <input v-model="f.regNo" placeholder="Reg. no" /><input v-model="f.name" placeholder="Full name" />
    <select v-model="f.level"><option v-for="l in LEVELS" :key="l">{{ l }}</option></select>
    <select v-model="f.trade"><option v-for="t in TRADES" :key="t">{{ t }}</option></select>
    <input v-model="f.parentPhone" placeholder="Parent phone" /><button @click="add">Add</button>
  </div>
  <p>Import CSV (regNo,name,level,trade,parentPhone): <input type="file" accept=".csv" @change="imp" /></p>

  <h3>Offenses and marks</h3>
  <ul class="history"><li v-for="(o, i) in st.offenses" :key="i"><span><input v-model="o.name" @change="st.save()" /> <input type="number" min="1" v-model.number="o.points" @change="st.save()" style="width:70px" /></span><button class="ghost" @click="delOff(i)">✕</button></li></ul>
  <div class="filters"><input v-model="off.name" placeholder="New offense" /><input type="number" min="1" v-model.number="off.points" style="width:80px" /><button @click="addOff">Add offense</button></div>

  <h3>Delete student</h3>
  <select @change="del(st.students.find((s) => s.id == $event.target.value)); $event.target.value = ''"><option value="">Choose…</option><option v-for="s in st.students" :key="s.id" :value="s.id">{{ s.regNo }} {{ s.name }}</option></select>

  <h3>Audit log (latest 50)</h3>
  <table><tbody><tr v-for="(a, i) in st.audit.slice(0, 50)" :key="i"><td>{{ new Date(a.date).toLocaleString() }}</td><td>{{ a.user }}</td><td>{{ a.action }}</td><td>{{ a.detail }}</td></tr></tbody></table>
</template>
