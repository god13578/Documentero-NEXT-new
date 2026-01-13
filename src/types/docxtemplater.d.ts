declare module "docxtemplater" {
  export default class Docxtemplater {
    constructor(zip: any, options?: any);
    getTags(): Record<string, unknown>;
  }
}
