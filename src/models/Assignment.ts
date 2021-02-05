export default class Assignment {
  #name: string;
  #id: string;
  #assignNo: number;
  #language: string;
  #description: string;

  constructor(
    name: string,
    id: string,
    assignNo: number,
    language: string,
    description: string
  ) {
    this.#name = name;
    this.#id = id;
    this.#assignNo = assignNo;
    this.#language = language;
    this.#description = description;
  }
}
