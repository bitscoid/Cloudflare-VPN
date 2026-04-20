<script setup lang="ts">
definePageMeta({
  title: "Convert",
});

const rawProxies = ref("");
const convertedProxies = ref("");
const convertFormats = ref(["clash", "provider"]);
const isLoading = ref(false);

async function convertProxiesTo(format: string) {
  isLoading.value = true;
  try {
    const res = await fetch("https://vpn.bits.co.id/convert", {
      method: "post",
      body: JSON.stringify({
        url: rawProxies.value.split("\n").join(","),
        format,
      }),
    });

    convertedProxies.value = await res.text();
  } catch (e: any) {
    convertedProxies.value = e.message;
  } finally {
    isLoading.value = false;
  }
}

function copyToClipboard() {
  navigator.clipboard.writeText(convertedProxies.value);
}
</script>

<template>
  <section class="tool-shell">
    <div class="tool-head">
      <h1>Convert</h1>
      <p>Convert raw URLs into Clash or provider output with one click.</p>
    </div>

    <div class="tool-card">
      <label class="label">Raw URL</label>
      <textarea
        v-model="rawProxies"
        class="surface"
        placeholder="vless://..."
      ></textarea>

      <div class="actions">
        <button
          v-for="format in convertFormats"
          :key="format"
          class="btn"
          :disabled="isLoading"
          @click="convertProxiesTo(format)"
        >
          {{ isLoading ? "Converting..." : format.toUpperCase() }}
        </button>
      </div>

      <label class="label">Result</label>
      <textarea :value="convertedProxies" class="surface" placeholder="result..." readonly></textarea>

      <button class="btn ghost" @click="copyToClipboard">Copy to Clipboard</button>
    </div>
  </section>
</template>

<style scoped>
.tool-shell {
  display: grid;
  gap: 1rem;
  animation: reveal 0.45s ease both;
}

.tool-head h1 {
  font-family: "Space Grotesk", sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 2rem);
}

.tool-head p {
  color: var(--text-soft);
}

.tool-card {
  display: grid;
  gap: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: rgba(16, 21, 36, 0.82);
  padding: 1rem;
}

.label {
  color: var(--text-soft);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.surface {
  min-height: 170px;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: rgba(9, 11, 18, 0.88);
  color: var(--text-main);
  padding: 0.75rem;
  resize: vertical;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.btn {
  border: 1px solid rgba(79, 140, 255, 0.45);
  border-radius: 0.7rem;
  background: rgba(79, 140, 255, 0.18);
  color: var(--text-main);
  padding: 0.5rem 0.95rem;
  transition: 0.2s ease;
}

.btn:hover {
  border-color: rgba(79, 140, 255, 0.82);
  transform: translateY(-1px);
}

.btn.ghost {
  background: transparent;
  border-color: var(--line);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
