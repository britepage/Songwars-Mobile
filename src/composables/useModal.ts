import { modalController } from '@ionic/vue'

export function useModal() {
  const openModal = async (
    component: any,
    componentProps?: any,
    cssClass?: string | string[]
  ) => {
    const modal = await modalController.create({
      component,
      componentProps,
      cssClass
    })
    
    await modal.present()
    
    const { data, role } = await modal.onWillDismiss()
    
    return { data, role }
  }

  const closeModal = async (data?: any, role?: string) => {
    await modalController.dismiss(data, role)
  }

  const closeAllModals = async () => {
    while (await modalController.getTop()) {
      await modalController.dismiss()
    }
  }

  return {
    openModal,
    closeModal,
    closeAllModals
  }
}

