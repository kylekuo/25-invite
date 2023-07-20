// DOM loaded and parsed but sub-resources still loading.
export const ready = async () => {
  return (document.readyState === 'interactive' || document.readyState === 'complete') ?
    await Promise.resolve() :
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', () => { resolve() })
    });
}

// DOM and sub-resources loaded.
export const loaded = async () => {
  return (document.readyState === 'complete') ? 
    await Promise.resolve() :
    await new Promise(resolve => {
      window.addEventListener('load', resolve)
    });
}