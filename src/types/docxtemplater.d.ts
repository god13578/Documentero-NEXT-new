declare module "docxtemplater" {
  export default class Docxtemplater {
    constructor(zip: any, options?: any);
    setData(data: any): void;
    render(): void;
    getZip(): any;
    getTags(): Record<string, unknown>;
  }
}
