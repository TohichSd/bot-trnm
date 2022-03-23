import { IBotConfiguration } from './ConfigTypes'

export namespace Config {
  export const Bot: IBotConfiguration = {
    username: 'test-bot',
  }

  export enum Permissions {
    ADMIN,
    MODER,
    T_HELPER, // Ппроводящий турниры
    DEFAULT,
  }
}