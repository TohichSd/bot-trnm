const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input#timezone').setAttribute('value', timezone)
})