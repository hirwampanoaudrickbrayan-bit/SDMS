<script setup>
import { ref } from 'vue'
import { useSdms } from '../stores/sdms'
const st = useSdms()
const name = ref(''), err = ref(false)
const go = () => (err.value = !st.signup(name.value))
</script>
<template>
  <div class="login">
    <img src="/logo.png" alt="SJITC" />
    <h2>Sign up</h2>
    <input v-model="name" placeholder="Your full name" @keyup.enter="go" />
    <p v-if="err" class="alert">Please enter your name.</p>
    <button @click="go">Sign up and continue</button>
    <small>New name = new account (the first account is the admin, the others are patrons). Already signed up? Enter the same name to continue.</small>
  </div>
</template>
