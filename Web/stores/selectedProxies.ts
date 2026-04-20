export const useSelectedProxiesStore = defineStore("selectedProxies", () => {
  const selectedProxiesCookie = useCookie("selected-proxies");
  const selectedProxies = ref<string[]>([]);

  // Check stored cookies
  if (selectedProxiesCookie.value) {
    try {
      selectedProxies.value = atob(selectedProxiesCookie.value).split(",");
    } catch (e: any) {
      console.error(e.message);
    }
  }

  // Getters
  const getSelectedProxies = computed(() => selectedProxies.value);

  // Setters
  function toggleSelectedProxies(id: string) {
    if (selectedProxies.value.includes(id)) {
      selectedProxies.value.splice(selectedProxies.value.indexOf(id), 1);
    } else {
      selectedProxies.value.push(id);
    }

    selectedProxiesCookie.value = btoa(selectedProxies.value.toString());
  }

  return { selectedProxies, getSelectedProxies, toggleSelectedProxies };
});
