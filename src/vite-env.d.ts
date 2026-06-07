/// <reference types="vite/client" />

declare module "3dmol" {
  const value: any;
  export default value;
}

declare module "3dmol/build/3Dmol.es6.js" {
  export const createViewer: any;
  export const SurfaceType: any;
}
