export default class Student {
  #name: string;
  #id: string;
  #email: string;
  #subjectsId: string[];
  #groupsId: string[];

  constructor(
    name: string,
    id: string,
    subjectsId: string[],
    groupsId: string[],
    email?: string
  ) {
    this.#name = name;
    this.#id = id;
    this.#email = email || "";
    this.#subjectsId = subjectsId;
    this.#groupsId = groupsId;
  }

  // Getters and Setters
  // getName(): string {
  //   return this.#name;
  // }

  // getStudentId(): string {
  //   return this.#studentId;
  // }

  // getEmail(): string {
  //   return this.#email;
  // }

  // getSubjects(): Subject[] {
  //   return this.#subjects;
  // }

  // getGroups(): Group[] {
  //   return this.#groups;
  // }

  // setEmail(email: string): void {
  //   this.#email = email;
  // }

  // addSubject(subject: Subject): void {
  //   this.#subjects.push(subject);
  // }

  // addGroup(group: Group): void {
  //   this.#groups.push(group);
  // }
}
