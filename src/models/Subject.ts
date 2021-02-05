export default class Subject {
  #code: string;
  #name: string;
  #description: string;
  #lecturerId: string;
  #studentsId: string[];

  constructor(
    code: string,
    name: string,
    description: string,
    lecturerId: string,
    studentsId: string[]
  ) {
    this.#code = code;
    this.#name = name;
    this.#description = description;
    this.#lecturerId = lecturerId;
    this.#studentsId = studentsId;
  }

  // addStudent(student: Student) {
  //   this.#students.push(student);
  // }

  // addStudents(students: Student[]): number {
  //   this.#students = [...this.#students, ...students];
  //   return this.#students.length;
  // }
}
