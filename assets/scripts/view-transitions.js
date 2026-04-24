/* Parser-blocking classic script: registers the pagereveal listener before
 the browser starts revealing the incoming document.

 Awaiting customElements.whenDefined inside the async handler pauses the
 reveal until the critical elements exist in their upgraded form.

 We only need to wait on jm-layout; every other component is defined in the same
 module chain, so it is ready by the time jm-layout resolves.
*/

window.addEventListener('pagereveal', async (e) => {
  // Exit early if view transitions aren't supported or enabled(direct URL entry etc)
  if (!e.viewTransition) return;
  try {
    // pause the reveal until the critical custom elements are defined and upgraded
    await Promise.all([
      customElements.whenDefined('jm-layout'),
      customElements.whenDefined('jm-navigation'),
    ]);
  } catch {
    e.viewTransition.skipTransition();
  }
});
