import { IBotConfiguration } from './ConfigTypes'

export namespace Config {
    export const BotConfig: IBotConfiguration = {
        username: 'test-bot',
        prefix: '!'
    }

    export enum Permissions {
        ADMIN = 'admin',
        ACCEPT_GAME_REPORTS = 'accept_game_reports',
        ACCESS_DASHBOARD = 'access_dashboard',
        MANAGE_CLAN_WARS = 'manage_clan_wars',
        MANAGE_EVENTS = 'manage_events',
    }

    export const channelsNames = {
        applications_channel: 'Канал для заявок',
        tournament_channel: 'Канал для турниров',
        clan_wars_channel: 'Канал для войны кланов',
        game_report_channel: 'Канал для отчётов о рейтинговых играх',
        game_report_images_channel: 'Канал для картинок отчётов',
        logs_channel: 'Канал для логов',
        notifications_channel: 'Канал для уведомлений',
    }
}
