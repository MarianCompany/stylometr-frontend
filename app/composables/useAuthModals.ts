export const useAuthModals = () => {
  const loginOpen = useState<boolean>('modals.login', () => false)
  const registerOpen = useState<boolean>('modals.register', () => false)

  const openLogin = () => {
    registerOpen.value = false
    loginOpen.value = true
  }

  const openRegister = () => {
    loginOpen.value = false
    registerOpen.value = true
  }

  const closeAll = () => {
    loginOpen.value = false
    registerOpen.value = false
  }

  return {
    loginOpen,
    registerOpen,
    openLogin,
    openRegister,
    closeAll,
  }
}
