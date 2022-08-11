const imageUrlInput = document.querySelector('#imageUrl')
const preview = document.querySelector('#image-preview')

function updateImagePreview() {
    preview.classList.remove('d-none')
    preview.setAttribute('src', imageUrlInput.value)
}

imageUrlInput.addEventListener('input', () => updateImagePreview())
imageUrlInput.addEventListener('paste', () => updateImagePreview())