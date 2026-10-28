<script setup>
import { ref } from 'vue'
import { useSdms } from './stores/sdms'
import Signup from './views/Signup.vue'
import Students from './views/Students.vue'
import Reports from './views/Reports.vue'
import Admin from './views/Admin.vue'
import History from './views/History.vue'
const st = useSdms()
const tab = ref('students')
</script>
<template>
  <header class="top">
    <img src="/logo.png" alt="SJITC logo" />
    <div>
      <h1>Saint Joseph Integrated Technical College</h1>
      <p>Student Discipline Management System · {{ st.term }}</p>
    </div>
    <div v-if="st.user" class="who">{{ st.user.u }} ({{ st.user.role }}) <button class="ghost" @click="st.logout()">Logout</button></div>
  </header>
  <Signup v-if="!st.user" />
  <main v-else>
    <nav class="tabs noprint">
      <button :class="{ on: tab === 'students' }" @click="tab = 'students'">Students</button>
      <button :class="{ on: tab === 'history' }" @click="tab = 'history'">History</button>
      <button :class="{ on: tab === 'reports' }" @click="tab = 'reports'">Reports</button>
      <button v-if="st.isAdmin" :class="{ on: tab === 'admin' }" @click="tab = 'admin'">Admin</button>
    </nav>
    <Students v-if="tab === 'students'" @recorded="tab = 'history'" />
    <History v-else-if="tab === 'history'" />
    <Reports v-else-if="tab === 'reports'" />
    <Admin v-else />
  </main>
</template>
