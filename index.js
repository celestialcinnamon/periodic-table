
const $ = document.querySelector.bind(document)
    , $$ = document.querySelectorAll.bind(document)
    , table = $('.periodic-table')
    , btnDetails = $('.details .button')
    , bodyBefore = $('.modal')
    , popover = $('.popover')

bodyBefore.addEventListener('click', function (e) {
    toggleElement($('.element.open'))
})

function renderElements() {
    elementsArray.forEach(element => {
        const button = document.createElement('button')
            , category = (element.category).replace(',', '').replace('unknown', '').split(' ')

        button.innerHTML = `<span>${element.symbol}</span>`
        button.classList.add(...category, 'element')

        button.style.setProperty('--group', element.xpos)
        button.style.setProperty('--period', element.ypos)
        button.setAttribute('id', element.name)
        button.setAttribute('data-element', element.symbol)
        table.appendChild(button)

        addEventListeners(button)
    });
}

function moveGradient(element, mouseEvent) {
    const x = mouseEvent.pageX - element.offsetLeft
        , y = mouseEvent.pageY - element.offsetTop

    element.style.setProperty('--x', `${x}px`)
    element.style.setProperty('--y', `${y}px`)
}

function toggleElement(element) {
    element.classList.toggle('open')

    $('body').classList.toggle('open')

    $('.details .loader').classList.remove('done')
    $('.details .contents').innerHTML = ''
}

function updateDetails(symbol) {
    const element = elementsArray.find(element => element.symbol === symbol)

    $('.details h1').innerHTML = element.name
    $('.details .discovered-by').innerHTML = element.discovered_by
    $('.details .named-by').innerHTML = element.named_by
}

function printWiki() {
    const elementInner = $('.element.open').dataset['element']
        , els = elementsArray.find(element => element.symbol === elementInner)
        , src = els.source

    fetchWikipediaPage(els)
        .then(data => data.json())
        .then(data => renderWiki(data.parse.text))
}

function addEventListeners(button) {
    button.addEventListener('mousemove', e => {
        moveGradient(e.target, e)

        if (!button.classList.contains('open')) {
            openPopover(button)
        }
    })

    button.addEventListener('click', function (e) {
        toggleElement(this)
        $('.details').classList.add('open')
        updateDetails(this.dataset['element'])
        printWiki()
    })

    button.addEventListener('mouseleave', e => {
        closePopover(button)
    })
}

function fetchWikipediaPage(element) {
    const path = element.source.split('https://en.wikipedia.org/wiki/')[1]
        , url = `https://en.wikipedia.org/w/api.php?action=parse&page=${path}&format=json&formatversion=2`

    return fetchJsonp(url)
}

function renderWiki(tex) {
    $('.details .loader').classList.add('done')
    $('.details .contents').innerHTML = tex.replace('/wiki', 'https://en.wikipedia.org/wiki')

    $$('.details .contents [style]').forEach(node => node.style = '')
    $$('a').forEach(link => {
        link.setAttribute('data-href', link.getAttribute('href'))
        link.href = ''
    })

    $$('.toc a').forEach(link => {
        link.href = link.dataset['href']
    })

    $$('img').forEach(img => {
        let src = img.getAttribute('src')

        if (!src.includes("https:"))
            img.setAttribute('src', 'https:' + src)
    })

    $$('br').forEach(br => br.parentNode.removeChild(br))
}

function openPopover(button) {
    updatePopover(button.dataset['element'])

    const rect = button.getBoundingClientRect()
        , x = rect.x
        , y = rect.y - (popover.getBoundingClientRect().height)


    popover.style.setProperty('--popover-top', `${y}px`)
    popover.style.setProperty('--popover-left', `${x}px`)

    popover.classList.add('open')

}

function closePopover(button) {
    popover.classList.remove('open')
}

function updatePopover(elementSymbol = null) {
    if (elementSymbol == null) {
        popover.querySelector('.popover__title').innerHTML = ''
        popover.querySelector('.popover__body').innerHTML = ''
        return
    }

    const element = elementsArray.find(element => element.symbol === elementSymbol)

    popover.querySelector('.popover__title').innerHTML = element.name
    popover.querySelector('.popover__body').innerHTML = element.summary
}

renderElements()
