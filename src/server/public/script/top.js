const membersContainer = document.querySelector('.main-container')
const guildID = document.querySelector('#guildID').innerText
const ph = document.querySelector('.placeholder')
const memberError = document.querySelector('#members-error')
const memberInfoError = document.querySelector('#member-info-error')

document.addEventListener('DOMContentLoaded', () => updateMembers())

function updateMembers() {
    memberError.style.display = 'none'
    fetch(`/api/${guildID}/top`).then(async res => {
        res = await res.json()
        ph.style.display = 'none'
        if (res.error) {
            memberError.style.display = 'inline-block'
            return
        }
        for (let i = 0; i < res.length; i++) {
            const card = document.createElement('div')
            card.classList.add('card', 'member-card', 'card-dark')
            if (i <= 2) card.classList.add('top3')
            const member = res[i]
            card.style.backgroundImage = `url(${member.imageUrl})`
            card.innerHTML =
                `<div class='pointer'>` +
                `<h2 class='place'>${i + 1} место</h2>` +
                `<div class='member-info'>` +
                `<h2 class='name'>${member.name}</h2>` +
                `<h3 class='points'>${member.points}</h3>` +
                `</nobr>` +
                `</div>` +
                `</div>`
            card.addEventListener('click', () => showPopup(member.id))
            membersContainer.append(card)
            if (i === 2) membersContainer.append(document.createElement('br'))
        }
    })
}

document.querySelector('#refresh').addEventListener('click', () => {
    membersContainer.innerHTML = ''
    ph.style.display = 'inline-block'
    updateMembers()
})

const popup = document.querySelector('#popup')
const container = popup.firstChild.firstChild
const popupName = document.querySelector('#popup #name')
const popupGames = document.querySelector('#popup #games')
const popupWins = document.querySelector('#popup #wins')
const popupPoints = document.querySelector('#popup #points')
const popupPlaceholder = document.querySelector('#popup .placeholder')

function showPopup(id) {
    popup.style.display = 'inline-block'
    memberInfoError.style.display = 'none'
    fetch(`/api/${guildID}/member/${id}`).then(async memberData => {
        popupPlaceholder.style.display = 'none'
        memberData = await memberData.json()
        if (memberData.error) {
            memberInfoError.style.display = 'inline-block'
            return
        }
        container.parentElement.style.backgroundImage = `url(/img/cards/${Math.floor(
            Math.random() * 10
        )}.png)`
        popupName.innerText = memberData.name
        popupGames.innerHTML = 'Сыграл(а) <span>' + memberData.games + '</span> игр'
        popupWins.innerHTML = 'Выиграл(а) <span>' + memberData.wins + '</span> игр'
        popupPoints.innerHTML = 'Всего <span>' + memberData.points + '</span> очк'
        if (memberData.points % 10 === 1) popupPoints.innerHTML += 'о'
        else if (memberData.points % 10 < 5 && memberData.points % 10 > 1)
            popupPoints.innerHTML += 'а'
        else popupPoints.innerHTML += 'ов'
    })
}

function hidePopup() {
    popupPlaceholder.style.display = 'inline-block'
    popup.style.display = 'none'
    popupName.innerText = ''
    popupGames.innerHTML = ''
    popupWins.innerHTML = ''
    popupPoints.innerHTML = ''
}

popup.addEventListener('click', ({ target }) => {
    if (target.closest('*').id === 'popup') hidePopup()
})

document.querySelector('#close').addEventListener('click', () => {
    hidePopup()
})
