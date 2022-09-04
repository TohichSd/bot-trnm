const guildID = document.querySelector('#guildID').innerText
const oldEventsContainer = document.querySelector('.old-events')
const phOld = document.querySelector('#ph-old-events')
const phNew = document.querySelector('#ph-new-events')
const oldEventsError = document.querySelector('#old-events-error')
const showOldEvents = document.querySelector('#show-old-events')
const h2OldEvents = document.querySelector('h2#old-events')
const popupClose = document.querySelector('#close')
const newEventsContainer = document.querySelector('.events-container')

class Popup {
    constructor(element) {
        this.element = element
    }

    setEventInfo(name, description, datetime, datetimeMs, imageUrl, messageID) {
        this.element.querySelector('#name').innerText = name
        this.element.querySelector('#description').innerText = description
        this.element.querySelector('#datetime').innerText = datetime
        this.element.querySelector('.placeholder').classList.add('d-none')
        this.element.firstChild.style.backgroundImage = `url('${imageUrl}')`
        const urlRepeat = new URL('create/', document.baseURI)
        urlRepeat.searchParams.set('name', encodeURIComponent(name))
        urlRepeat.searchParams.set('description', encodeURIComponent(description))
        urlRepeat.searchParams.set('datetimeMs', encodeURIComponent(datetimeMs))
        urlRepeat.searchParams.set('imageUrl', encodeURIComponent(imageUrl))
        this.element.querySelector('#repeat-link').setAttribute('href', urlRepeat.toString())

        const urlEnd = new URL(`${messageID}/end/`, document.baseURI)
        this.element.querySelector('#end-link').setAttribute('href', urlEnd.toString())
    }

    show() {
        this.element.classList.remove('d-none')
    }

    hide() {
        this.element.classList.add('d-none')
        this.element.querySelector('.placeholder').classList.remove('d-none')
        this.element.querySelector('#name').innerText = '...'
        this.element.querySelector('#description').innerText = '...'
        this.element.querySelector('#datetime').innerText = '...'
        this.element.firstChild.style.backgroundImage = 'none'
    }
}


const popup = new Popup(document.querySelector('#popup'))

popupClose.addEventListener('click', () => popup.hide())

function showPopup(id) {
    popup.show()
    fetch(`/api/${guildID}/events/${id}`).then(async event => {
        event = await event.json()
        popup.setEventInfo(
            event.name,
            event.description,
            event.datetime,
            event.datetimeMs,
            event.imageUrl,
            event.message_id
        )
    })
}

function updateOldEvents() {
    fetch(`/api/${guildID}/events?type=old`).then(async events => {
        events = await events.json()
        phOld.style.display = 'none'
        if (events.error) {
            oldEventsError.style.display = 'inline-block'
            return
        }
        h2OldEvents.style.display = 'inline-block'
        for (let i = 0; i < events.length; i++) {
            const card = document.createElement('div')
            card.classList.add('event', 'pointer')
            const event = events[i]
            card.innerHTML =
                `<h3 class='name'>${event.name}</h3>` +
                `<strong class='datetime'>${event.datetime}</strong>`
            card.addEventListener('click', () => showPopup(event._id))
            oldEventsContainer.append(card)
        }
    })
}

function updateNewEvents() {
    fetch(`/api/${guildID}/events?type=new`).then(async events => {
        events = await events.json()
        phNew.style.display = 'none'
        if (events.error) {
            oldEventsError.style.display = 'inline-block'
            return
        }
        for (let i = 0; i < events.length; i++) {
            const card = document.createElement('div')
            card.classList.add('card', 'event-card', 'card-zoom', 'card-dark', 'pointer')
            const event = events[i]
            card.innerHTML =
                `<div>` +
                `    <strong class='datetime'>${event.datetime}</strong>` +
                `    <h3>${event.name}</h3>` +
                `    <p class='description'>${event.description}</p>` +
                `</div>`
            card.addEventListener('click', () => showPopup(event._id))
            card.style.backgroundImage = `url('${event.imageUrl}')`
            newEventsContainer.append(card)
        }
        if (events.length === 0)
            newEventsContainer.innerHTML = `<strong class='placeholder'>Новых турниров пока нет...</strong>`
    })
}


showOldEvents.addEventListener('click', () => {
    phOld.style.display = 'inline-block'
    showOldEvents.style.display = 'none'
    updateOldEvents()
})

document.addEventListener('DOMContentLoaded', () => updateNewEvents())