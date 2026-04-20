<script setup lang="ts">
import { daisyui } from "#tailwind-config";

const routerPaths = ref([
  { name: "Home", path: "/" },
  { name: "About", path: "/" },
  { name: "Uptime", path: "/uptime" },
  { name: "Tools", children: [{ name: "Converter", path: "/tools/converter" }] },
]);

const props = defineProps({
  name: String,
  root: String,
});
</script>

<template>
  <div class="navbar bg-base-100 px-[10%] z-50 sticky">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl">{{ props.name }}</NuxtLink>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1 font-bold gap-2 h-max lg:flex items-center hidden">
        <div v-for="routerPath in routerPaths">
          <li v-if="routerPath.path">
            <NuxtLink v-if="routerPath.path" :to="routerPath.path">{{ routerPath.name }}</NuxtLink>
          </li>
          <div v-else>
            <div class="dropdown dropdown-bottom dropdown-end w-max">
              <div tabindex="0" role="button" class="btn m-1">{{ routerPath.name }}</div>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow w-52">
                <li v-for="childPath of routerPath.children">
                  <NuxtLink :to="childPath.path">{{ childPath.name }}</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="dropdown dropdown-bottom dropdown-end w-max">
          <div tabindex="0" role="button" class="btn m-1">Themes</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow w-52">
            <li v-for="theme in daisyui.themes">
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                :aria-label="theme"
                :value="theme"
              />
            </li>
          </ul>
        </div>
      </ul>
      <div class="dropdown dropdown-end lg:hidden">
        <div tabindex="0" role="button" class="btn btn-sm m-1">Menu</div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
          <div v-for="routerPath in routerPaths">
            <li v-if="routerPath.path">
              <NuxtLink :to="routerPath.path">{{ routerPath.name }}</NuxtLink>
            </li>
            <div v-else>
              <details class="dropdown">
                <summary class="btn m-1">{{ routerPath.name }}</summary>
                <ul class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                  <li v-for="childPath in routerPath.children">
                    <NuxtLink :to="childPath.path">{{ childPath.name }}</NuxtLink>
                  </li>
                </ul>
              </details>
            </div>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>
