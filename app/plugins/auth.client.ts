export default defineNuxtPlugin(async () => {
  const { accessToken, fetchMe } = useAuth()

  if (accessToken.value) {
    await fetchMe().catch(() => undefined)
  }
})
