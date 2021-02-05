export default class Lecturer {
  #staffId: string;
  #name: string;
  #email: string;
  #phoneNo: string;
  #faculty: string;
  #subjectsId: string[];

  constructor(
    staffId: string,
    name: string,
    email: string,
    phoneNo: string,
    faculty: string,
    subjectsId: string[]
  ) {
    this.#staffId = staffId;
    this.#name = name;
    this.#email = email;
    this.#phoneNo = phoneNo;
    this.#faculty = faculty;
    this.#subjectsId = subjectsId;
  }
}
