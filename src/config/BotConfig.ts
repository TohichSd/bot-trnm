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
    
    export const randomEventOptions = [
        {
            name: 'Стиль карты',
            values: [
                'классическая',
                'зеркало(низк.)',
                'зеркало(макс.)',
                'зеркало(случ.)',
            ],
        },
        {
            name: 'Режим ярости',
            values: ['сброс', 'включено'],
        },
        {
            name: 'Длительность игры',
            values: [
                'по умолчанию',
                'долгая',
                'супердолгая',
                'короткая',
                'совсем короткая',
            ],
        },
        {
            name: 'Урон Королю на рассвете',
            values: ['по умолчанию', 'без повреждений от гнили'],
        },
        {
            name: 'Безумный король',
            values: ['по умолчанию', 'разгневанный', 'спокойный'],
        },
        {
            name: 'Стартовый тип карты',
            values: ['по умолчанию', 'вытянуть', 'случайный'],
        },
        {
            name: 'Очки действия героя',
            values: ['по умолчанию', '+1 ОД', '+2 ОД'],
        },
        {
            name: 'Сила героя',
            values: ['по умолчанию', '+1', '+2', '+3'],
        },
        {
            name: 'Интеллект героя',
            values: ['по умолчанию', '+1'],
        },
        {
            name: 'Гниль героя',
            values: ['по умолчанию', 'начать с заражением', 'начать пораженным'],
        },
        {
            name: 'Стартовое снаряение героя',
            values: [
                'по умолчанию',
                'последователь',
                'сокровище',
                'сокровище и последователь',
            ],
        },
        {
            name: 'Тип королевского страника',
            values: ['по умолчанию', 'бронированные'],
        },
        {
            name: 'Тип гада',
            values: ['по умолчанию', 'жуткий'],
        },
        {
            name: 'Незнакомец',
            values: ['посещает', 'отошёл'],
        },
        {
            name: 'Рука мертвого игрока',
            values: ['сброс', 'включено'],
        },
        {
            name: 'Трудность дворцового испытания',
            values: ['классический', 'сложный', 'нет испытаний', 'простой'],
        },
        {
            name: 'Неограниченое кол-во взрывов',
            values: ['вкл', 'выкл'],
        },
    ]
}
