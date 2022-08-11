import { IBotConfiguration } from './ConfigTypes'

export namespace Config {
    export const Bot: IBotConfiguration = {
        username: 'test-bot',
    }

    export enum Permissions {
        ADMIN = 'admin',
        ACCEPT_GAME_REPORTS = 'accept_game_reports',
        ACCESS_DASHBOARD = 'access_dashboard',
        MANAGE_CLAN_WARS = 'manage_clan_wars',
        MANAGE_EVENTS = 'manage_events',
    }
    
    export const POINTS = {
        R_GAME: 10,
        R_GAME_WIN: 30,
        E_GAME: 20,
        E_GAME_WIN: 70
    }
}
