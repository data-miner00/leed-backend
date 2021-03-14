export default class Notification {
  #type: string;
  #message: string;
  #receipients: string[];
  #createdAt: string;
  #actor: string;

  constructor(
    type: string,
    message: string,
    receipients: string[],
    createdAt: string,
    actor: string
  ) {
    this.#type = type;
    this.#message = message;
    this.#receipients = receipients;
    this.#createdAt = createdAt;
    this.#actor = actor;
  }
}

export const addNotification = () => {};

export enum NOTIFICATION_TYPE {
  USER_JOIN,
  ASSIGN_SUBMIT,
  ASSIGN_UPDATE,
  DISCUSS_TIME_CONFIRM,
  ASSIGN_DEADLINE,
  COURSE_JOIN,
  GROUP_JOIN,
}
