export default class Notification {
  #type: string;
  #message: string;
  #receipients: string[];
  #createdAt: string;

  constructor(
    type: string,
    message: string,
    receipients: string[],
    createdAt: string
  ) {
    this.#type = type;
    this.#message = message;
    this.#receipients = receipients;
    this.#createdAt = createdAt;
  }
}
