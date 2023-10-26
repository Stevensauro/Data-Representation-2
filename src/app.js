fetchCountriesData()

async function fetchCountriesData(){
    
    try{
        const res = await fetch('https://restcountries.com/v3.1/all')
        const data = await res.json()
            
        updatePage(data)

    } catch(err){
        console.log(err)
    }
}

function updatePage(data){
    const graphButtons = document.querySelectorAll('#graph-options button')
    const searchBox = document.querySelector('#search-box')
    const countryCountSpan = document.querySelector('#country-count')
    const sortButtons = document.querySelectorAll('#filter-options button')      
    
    graphButtons.forEach(el=>{
        el.addEventListener('click', showSelectedGraphOnly)
    })

    countryCountSpan.textContent = data.length //number of countries updated to the page

    makeCountryCards(data)
    
    const cardsArr = []

    document.querySelectorAll('#card').forEach(card=>cardsArr.push(card))
    
    showResultNumber()

    sortButtons.forEach(el=>(el.hasBeenClicked = false,el.inCurrentUse = false))

    const cards = document.querySelectorAll('#card')

    const [tenCountries,populationObj] = getTenByPopulationAndSort(cards)
    const tenLanguages = getTopTenLanguages(cards)

    const graphData = [[tenCountries,populationObj],[tenLanguages,{totalCountries: cards.length}]]

    searchBox.addEventListener('input', 
    e=>filterCards(e,cardsArr, showResultNumber))

    sortButtons.forEach(el=>{
        el.addEventListener('click', sortCards)
    })

    makeGraphs(graphData)

    window.addEventListener('load', hideSomeContent)
    window.addEventListener('resize', hideSomeContent)

    function showResultNumber(){
        const searchResultSpan = document.querySelector('#search-result')
        const cards = document.querySelectorAll('#card')
        if(cards.length > 1){
            searchResultSpan.innerText = `${cards.length} countries`
        } else if(cards.length === 1){
            searchResultSpan.innerText = `1 country`
        } else{
            searchResultSpan.innerText = 'no result'
        }
    }

}

function makeCountryCards(data){
    const countryCards = document.querySelector('#countries-cards')
    const countryCardsArr = []

    for(const country of data){
        const languagesArr = []
        const card = document.createElement('div')
        const figure = document.createElement('figure')
        const section = document.createElement('section')
        const img = document.createElement('img')
        const languagesObj = country.languages
        const populationString = country.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        card.countryName = country.name.common
        card.countryCapital = country.capital
        card.countryLanguages = languagesObj
        card.populationInt = country.population
        card.populationStr = populationString

        for(const language in country.languages){
            languagesArr.push(country.languages[language])
        }

        img.src = country.flags.svg
        img.alt = country.flags.alt
        card.id = 'card'

        figure.append(img)
        card.append(figure, section)
        
        section.append(
            document.createElement('div'),
            document.createElement('div')
        )

        section.children[0].append(
            document.createElement('h1')
        )

        section.children[1].append(
            document.createElement('p'),
            document.createElement('p'),
            document.createElement('p')
        )

        const pArr = section.children[1].children
        const h1 = section.children[0].querySelector('h1')

        h1.innerText = `${country.name.common}`
        
        if(country.capital===undefined){
            pArr[0].innerHTML = `<strong>No official capital</strong>`
        }
        
        if(country.capital){
            pArr[0].innerHTML = `<strong>Capital:</strong> ${country.capital}`
        }
        
        if(country.languages===undefined){
            pArr[1].innerHTML = `<strong>No official languages</strong>`
        }
        
        if(country.languages){
            pArr[1].innerHTML = `<strong>Languages:</strong> ${languagesArr.join(', ')}`
        }

        
        pArr[2].innerHTML = `<strong>Population:</strong> ${populationString}`
        
        countryCardsArr.push(card)
    }

    countryCardsArr.forEach(card=>countryCards.append(card))

}

function getTenByPopulationAndSort([...cardsArr]){
    const newArr = []
    cardsArr.sort((a,b)=>{
        if(a.populationInt>b.populationInt){
            return -1
        }else if(a.populationInt<b.populationInt){
            return 1
        }else{
            return 0
        }
    })

    function sumPopulation(){
        let total = 0
        for(const card of cardsArr){
            total += card.populationInt
        }

        return total
    }

    const totalPopulationInt = sumPopulation()
    const totalPopulationStr = totalPopulationInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    for(const card of cardsArr.slice(0,10)){
        const {countryName: name, populationInt: population} = card
        populationString = population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        newArr.push({name: name, populationStr: populationString, populationInt: population})
    }
    
    return [newArr, 
        {totalPopulationInt: totalPopulationInt,
         totalPopulationStr: totalPopulationStr}]
}

function getTopTenLanguages([...cardsArr]){

    const newArr = []

    for(const card of cardsArr){
        for(const language in card.countryLanguages){
            const langName = card.countryLanguages[language]
            if(!newArr.find(({name})=> name === langName)){
                newArr.push({name: langName, count: 1})
            } else{
                const i = newArr.indexOf(newArr.find(({name})=> name===langName))
                newArr[i].count += 1
            }
        }
    }

    newArr.sort((a,b)=>{
        if(a.count>b.count){
            return -1
        }else if(a.count<b.count){
            return 1
        }else{
            return 0
        }
    })

    return newArr.slice(0,10)
}

function showSelectedGraphOnly(e){
    const countryTable = document.querySelector('#country-table')
    const languageTable = document.querySelector('#language-table')
    const countryTableSm = document.querySelector('#country-table-sm')
    const languageTableSm = document.querySelector('#language-table-sm')

    if(window.innerWidth > 450){
        if(this.id==='btn-graphPopulation' ){
            countryTable.hidden = false
            languageTable.hidden = true
        } else{
            countryTable.hidden = true
            languageTable.hidden = false
        }
    } else{
        if(this.id==='btn-graphPopulation' ){
            countryTableSm.hidden = false
            languageTableSm.hidden = true
        } else{
            countryTableSm.hidden = true
            languageTableSm.hidden = false
        }
    }


}

function makeGraphs(arr){
    const [countryArr, countryObj] = arr[0]
    const [languageArr, languageObj] = arr[1]
    const graphContainer = document.querySelector('#graph-container')
    
    while(document.querySelectorAll('table').length<4){
        
        const table = document.createElement('table')

        if(document.querySelectorAll('table').length === 0){
            
            const thead = document.createElement('thead')
            const tr = document.createElement('tr')
            const th = document.createElement('th')
    
            th.setAttribute('colspan', '3')
    
            th.innerText = `World Population ${countryObj.totalPopulationStr}`
            table.worldPopulation = countryObj.totalPopulationInt
            tr.append(th)
            thead.append(tr)
    
            for(const country of countryArr){
                const percentage = findPercentage(country.populationInt,countryObj.totalPopulationInt)
    
                const tableRow = document.createElement('tr')
                const td1 = document.createElement('td')
                const td2 = document.createElement('td')
                const td3 = document.createElement('td')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = country.name
                td2.classList.add(`barCell`)
                
                td2.append(svg)

                td3.textContent = country.populationStr
        
                tableRow.append(td1,td2,td3)
                
                table.append(tableRow)
    
            }
    
            table.id = 'country-table'
            table.prepend(thead)
        }
    
        if(document.querySelectorAll('table').length === 1){
            table.hidden = true
            for(const language of languageArr){
                const percentage = findPercentage(language.count,languageObj.totalCountries)

                table.totalCountries = languageObj.totalCountries
    
                const tableRow = document.createElement('tr')
                const td1 = document.createElement('td')
                const td2 = document.createElement('td')
                const td3 = document.createElement('td')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = language.name
                td2.classList.add('barCell')
                
                td2.append(svg)

                td3.textContent = language.count
        
                tableRow.append(td1,td2,td3)

                table.append(tableRow)
            }
            table.id = 'language-table'
        }
    
        if(document.querySelectorAll('table').length === 2){
            table.hidden = true
            table.classList.add('table-sm')

            const thead = document.createElement('thead')
            const tbody = document.createElement('tbody')
            const tr = document.createElement('tr')
            const th = document.createElement('th')
      
            th.innerText = `World Population ${countryObj.totalPopulationStr}`
            table.worldPopulation = countryObj.totalPopulationInt
            tr.append(th)
            thead.append(tr)
            table.append(thead)

            for(const country of countryArr){
                const percentage = findPercentage(country.populationInt,countryObj.totalPopulationInt)
    
                const tr1 = document.createElement('tr')
                const td1 = document.createElement('td')
                const tr2 = document.createElement('tr')
                const td2 = document.createElement('td')
                const span = document.createElement('span')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = country.name
                tr1.append(td1)

                span.textContent = country.populationStr
                
                td2.classList.add(`barCell`)
                td2.append(span,svg)
    
                tr2.append(td2)
                
                tbody.append(tr1, tr2)
                
            }

            table.append(tbody)
            table.id = 'country-table-sm'
            
        }

        if(document.querySelectorAll('table').length === 3){
            table.classList.add('table-sm')

            table.hidden = true

            const tbody = document.createElement('tbody')

            for(const language of languageArr){
                const percentage = findPercentage(language.count,languageObj.totalCountries)

                table.totalCountries = languageObj.totalCountries
    
                const tr1 = document.createElement('tr')
                const td1 = document.createElement('td')
                const tr2 = document.createElement('tr')
                const td2 = document.createElement('td')
                const span = document.createElement('span')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = language.name
                tr1.append(td1)

                span.textContent = language.count

                td2.classList.add('barCell')
                td2.append(span,svg)

                tr2.append(td2)

                tbody.append(tr1, tr2)

            }
            table.append(tbody)
            table.id = 'language-table-sm'
        }

        graphContainer.append(table)
    
    } 

}

function updateGraphs(arr){

    const [countryArr] = arr[0]
    const [languageArr] = arr[1]
    const tables = document.querySelectorAll('table')

    tables.forEach((table, idx)=>{
        const tableRows = table.querySelectorAll('tr')

        tableRows.forEach((el,index)=>{if(!(idx===0&&index===0 || idx===2&&index===0)){el.remove()}})

        if(idx === 0){

            for(const country of countryArr){
                const percentage = findPercentage(country.populationInt,table.worldPopulation)

                const tableRow = document.createElement('tr')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                const td1 = document.createElement('td')
                const td2 = document.createElement('td')
                const td3 = document.createElement('td')
                td1.textContent = country.name
                td2.classList.add(`barCell`)
                td2.append(svg)
                td3.textContent = country.populationStr
        
                tableRow.append(td1,td2,td3)
                
                table.append(tableRow)
            }
        } else if(idx === 1){
            for(const language of languageArr){
                const percentage = findPercentage(language.count, table.totalCountries)
    
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                const tableRow = document.createElement('tr')
                const td1 = document.createElement('td')
                const td2 = document.createElement('td')
                const td3 = document.createElement('td')
                td1.textContent = language.name
                td2.classList.add('barCell')
                td2.append(svg)
                td3.textContent = language.count
        
                tableRow.append(td1,td2,td3)
                table.append(tableRow)
            }
        } else if (idx === 2){
            const tbody = document.createElement('tbody')

            for(const country of countryArr){
                const percentage = findPercentage(country.populationInt,table.worldPopulation)

                const tr1 = document.createElement('tr')
                const tr2 = document.createElement('tr')
                const td1 = document.createElement('td')
                const td2 = document.createElement('td')
                const span = document.createElement('span')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)
    
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = country.name
                tr1.append(td1)

                span.textContent = country.populationStr
                
                td2.classList.add(`barCell`)
                td2.append(span,svg)
    
                tr2.append(td2)
                
                tbody.append(tr1, tr2)
                
            }
            table.append(tbody)
        } else{
            const tbody = document.createElement('tbody')

            for(const language of languageArr){
                const percentage = findPercentage(language.count,table.totalCountries)
    
                const tr1 = document.createElement('tr')
                const td1 = document.createElement('td')
                const tr2 = document.createElement('tr')
                const td2 = document.createElement('td')
                const span = document.createElement('span')
                const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg')
                const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect')
                
                rect.setAttribute('width',`${percentage}%`)
                rect.setAttribute('height','100%')
                rect.setAttribute('fill','blue')

                svg.append(rect)

                td1.textContent = language.name
                tr1.append(td1)

                span.textContent = language.count

                td2.classList.add('barCell')
                td2.append(span,svg)

                tr2.append(td2)

                tbody.append(tr1, tr2)

            }
            table.append(tbody)
        }  
    })   
}

function findPercentage(n1,n2){
    return ((n1 * 100)/n2).toFixed(2)
}

function hideSomeContent(){
    const p = document.querySelector('#filter-options p')
    const searchBox = document.querySelector('input[type=search]')

    if(window.innerWidth < 600){
        if(window.innerWidth < 450){
            document.querySelector("#country-table").hidden = true
            document.querySelector("#language-table").hidden = true
        } else if(window.innerWidth > 480){
            document.querySelector("#country-table-sm").hidden = true
            document.querySelector("#language-table-sm").hidden = true
        }   
        p.classList.remove('hidden')
        searchBox.setAttribute('placeholder', 'Search...')
    }else if(window.innerWidth > 600){
        p.className = 'hidden'
        searchBox.setAttribute('placeholder', 'Search countries by name, city, or languages...')
    } 

}

function filterCards(e, arr, showResultNumber){
 
    const countryCards = document.querySelector('#countries-cards')
    const cardsArr = arr
    const docFragment = document.createDocumentFragment()

    countryCards.innerHTML = ""

    const result = cardsArr.filter(el => {
        const inputValue = e.target.value.toLowerCase()
        const countryName = el.countryName.toLowerCase()
        let countryCapital
        let countryLanguages
        let doesLanguageMatch = false
        let doesCapitalMatch = false

        if(el.countryLanguages === undefined){
            countryLanguages = ['no official languages']
            doesLanguageMatch = countryLanguages.find(el=>el.includes(inputValue))
        }
        
        if(el.countryCapital === undefined){
            countryCapital = ['no official capital']
            doesCapitalMatch = countryCapital.find(el=>el.includes(inputValue))
        }

        if(el.countryLanguages){
            countryLanguages = Object.values(el.countryLanguages)
            countryLanguages.forEach((lang,idx)=>countryLanguages[idx] = lang.toLowerCase())
            doesLanguageMatch = countryLanguages.find(el=>el.includes(inputValue))
        }
        
        if(el.countryCapital){
            countryCapital = el.countryCapital
            countryCapital.forEach((capital,idx)=>countryCapital[idx] = capital.toLowerCase())
            doesCapitalMatch = countryCapital.find(el=>el.includes(inputValue))
        }

        return (
            countryName.includes(inputValue) ||
            doesLanguageMatch ||
            doesCapitalMatch
        )
    })

    result.forEach(element=>docFragment.appendChild(element))

    countryCards.append(docFragment)

    const [tenCountries,populationObj] = getTenByPopulationAndSort(result)
    const tenLanguages = getTopTenLanguages(result)

    const graphData = [[tenCountries,populationObj],[tenLanguages,{totalCountries: cardsArr.length}]]

    updateGraphs(graphData)

    showResultNumber()
}

function sortCards(e){
    const sortButtons = document.querySelectorAll('#filter-options button')
    const currentButton = e.target
    const arrowImgs = document.querySelectorAll('#filter-options button img')
    const currentArrowImg = currentButton.querySelector('img')
    const cardConatiner = document.querySelector('#countries-cards')
    const cardsCollection = document.querySelectorAll('#card')
    const docFragment = document.createDocumentFragment()
    const [...cardsArr] = cardsCollection

    sortButtons.forEach((el,idx)=>{
        if(el===currentButton){
            el.inCurrentUse = true
            arrowImgs[idx].hidden = false
        } else{
            el.inCurrentUse = false
            arrowImgs[idx].hidden = true
        }
    })

    const sortingBy = {
        ascendingName(){
            cardsArr.sort((a,b)=>a.countryName.localeCompare(b.countryName))
        }, 
        descendingName(){
            cardsArr.sort((a,b)=> -(a.countryName.localeCompare(b.countryName)))
        },
        ascendingCapital(){
            cardsArr.sort((a,b)=>{
                if(a.countryCapital === undefined){
                    a.countryCapital = ['ZZZ']
                }
                if(b.countryCapital === undefined){
                    b.countryCapital = ['ZZZ']
                }
                return a.countryCapital[0].localeCompare(b.countryCapital[0])
            })
        }, 
        descendingCapital(){
            cardsArr.sort((a,b)=>{
                if(a.countryCapital === undefined){
                    a.countryCapital = ['ZZZ']
                }
                if(b.countryCapital === undefined){
                    b.countryCapital = ['ZZZ']
                }
                return -(a.countryCapital[0].localeCompare(b.countryCapital[0]))
            })
        },
        ascendingPopulation(){
            cardsArr.sort((a,b)=>a.populationInt - b.populationInt)
        },
        descendingPopulation(){
            cardsArr.sort((a,b)=>b.populationInt - a.populationInt)
        }
    }

    if(this.id === 'btn-name'){ 
        if(!this.hasBeenClicked){
            sortingBy.ascendingName()
            currentArrowImg.src = 'src/resource/arrowUpward.svg'
        }
        
        if(this.hasBeenClicked){
            sortingBy.descendingName()
            currentArrowImg.src = 'src/resource/arrowDownward.svg'
        }

        toggleButtonProperty()

        cardsArr.forEach(card=>docFragment.append(card))
        cardConatiner.replaceChildren(docFragment)

    } else if(this.id === 'btn-capital'){
        if(!this.hasBeenClicked){
            sortingBy.ascendingCapital()
            currentArrowImg.src = 'src/resource/arrowUpward.svg'
        }
        
        if(this.hasBeenClicked){
            sortingBy.descendingCapital()
            currentArrowImg.src = 'src/resource/arrowDownward.svg'
        }

        toggleButtonProperty()

        cardsArr.forEach(card=>docFragment.append(card))
        cardConatiner.replaceChildren(docFragment)
    } else{
        if(!this.hasBeenClicked){
            sortingBy.ascendingPopulation()
            currentArrowImg.src = 'src/resource/arrowUpward.svg'
        }
        
        if(this.hasBeenClicked){
            sortingBy.descendingPopulation()
            currentArrowImg.src = 'src/resource/arrowDownward.svg'
        }

        toggleButtonProperty()

        cardsArr.forEach(card=>docFragment.append(card))
        cardConatiner.replaceChildren(docFragment)
    }

    function toggleButtonProperty(){
        if(!currentButton.hasBeenClicked){
            currentButton.hasBeenClicked = true
        } else{
            currentButton.hasBeenClicked = false
        }
    }

}
