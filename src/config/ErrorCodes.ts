export const errors = {
    GUILD_NOT_FOUND: {
        code: 30,
        description: 'В бд стутсвует информация о сервере'
    },
    CHANNEL_NOT_FOUND: {
        code: 20,
        description: 'В бд отсутсвует информация о канале'
    }
}

export const statuses = {
    0: 'Предупреждение',
    1: 'Ошибка, вызванная неверными действиями пользователя.',
    2: 'Ошибка, вызванная неверной настройкой бота. Может быть исправлена модератором при помощи команд.',
    3: 'Ошибка, требующая вмешательства разработчика.'
}