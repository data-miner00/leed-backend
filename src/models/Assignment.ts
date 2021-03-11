export default class Assignment {
  #title: string;
  #id: string;
  #subjectCode: string;
  #assignNo: number;
  #language: string;
  #description: string;

  constructor(
    title: string,
    id: string,
    subjectCode: string,
    assignNo: number,
    language: string,
    description: string
  ) {
    this.#title = title;
    this.#id = id;
    this.#subjectCode = subjectCode;
    this.#assignNo = assignNo;
    this.#language = language;
    this.#description = description;
  }
}
