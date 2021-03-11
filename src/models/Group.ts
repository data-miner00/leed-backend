export default class Group {
  #id: string;
  #subjectId: string;
  #leaderId: string;
  #membersId: string[];
  #maxSize: number;
  #ganttId: string;

  constructor(
    id: string,
    subjectId: string,
    leaderId: string,
    maxSize: number,
    membersId: string[],
    ganttId: string
  ) {
    this.#id = id;
    this.#subjectId = subjectId;
    this.#leaderId = leaderId;
    this.#maxSize = maxSize;
    this.#membersId = membersId;
    this.#ganttId = ganttId;
  }

  // getGroupId(): string {
  //   return this.#groupId;
  // }

  // getSubject(): Subject {
  //   return this.#subject;
  // }

  // getLeader(): Student {
  //   return this.#leader;
  // }

  // getMaxSize(): number {
  //   return this.#maxSize;
  // }

  // getMembers(): Student[] {
  //   return this.#members;
  // }

  // setSubject(subject: Subject): void {
  //   this.#subject = subject;
  // }

  // setLeader(student: Student): void {
  //   this.#leader = student;
  // }

  // setMaxSize(maxSize: number): void {
  //   this.#maxSize = maxSize;
  // }

  // addStudent(newStudent: Student): void {
  //   this.#members.push(newStudent);
  // }

  // isFull(): boolean {
  //   return this.#members.length + 1 == this.#maxSize;
  // }
}
