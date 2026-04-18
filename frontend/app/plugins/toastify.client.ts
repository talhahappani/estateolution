import Vue3Toastify, { toast, updateGlobalOptions } from "vue3-toastify";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify);

  updateGlobalOptions({
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    theme: "colored",
    hideProgressBar: true,
    closeButton: false,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    toastClassName: "app-toast",
    bodyClassName: "app-toast__body",
    progressClassName: "app-toast__progress",
  });
});
