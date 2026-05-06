export const useAdminInfiniteScroll = (
  target: Ref<HTMLElement | null>,
  onReachEnd: () => void | Promise<void>,
  enabled: Ref<boolean>,
) => {
  let observer: IntersectionObserver | null = null

  const cleanup = () => {
    observer?.disconnect()
    observer = null
  }

  onMounted(() => {
    watch(
      [target, enabled],
      ([element, canObserve]) => {
        cleanup()
        if (!element || !canObserve) {
          return
        }

        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              void onReachEnd()
            }
          },
          {
            rootMargin: '280px 0px',
          },
        )
        observer.observe(element)
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(cleanup)
}
