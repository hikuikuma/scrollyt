class SytAnim {
    #element = null
    #type = null
    #start = {}
    #startAnim = undefined
    #stop = {}
    #stopAnim = undefined
    #percents = {}
    #units = {}

    /**
     * Allows to create a SytAnim on the defined element
     * @param {string} element
     * @param {string} type
     * @param {string} start
     * @param {string} stop
     */
    constructor(element,type,start,stop) {
        const DOMElement = document.getElementById(element)

        // Checking that the DOM element exists
        if (DOMElement === null) throw new Error(`No element with ID ${element} were found`)
        // Check that a starting and ending value is declared and that there are as many values at the start as at the end
        let startArray = []
        let stopArray = []
        if (typeof start === "undefined" || typeof stop === "undefined") throw new Error(`Animation start or stop value is not defined`)
        else {
            // Decomposition of start and stop values
            startArray = start.replaceAll(' ', '').split(',')
            stopArray = stop.replaceAll(' ', '').split(',')
            if (startArray.length !== stopArray.length) throw new Error('The number of parameters is not equal between start and stop')
            else {
                switch (startArray.length) {
                    case 1:
                        start = {x: startArray[0]}
                        stop = {x: stopArray[0]}
                        break
                    case 2:
                        start = {x: startArray[0], y: startArray[1]}
                        stop = {x: stopArray[0], y: stopArray[1]}
                        break
                    case 3:
                        start = {x: startArray[0], y: startArray[1], z: startArray[2]}
                        stop = {x: stopArray[0], y: stopArray[1], z: stopArray[2]}
                        break
                    default:
                        throw new Error(`Number of animations values is not between 1 and 3`)
                }
            }
        }

        // Checking the units
        switch (startArray.length) {
            case 1:
                this.#units = {x: this.#checkUnits(start.x, stop.x)}
                break
            case 2:
                this.#units = {x: this.#checkUnits(start.x, stop.x), y: this.#checkUnits(start.y, stop.y)}
                break
            case 3:
                this.#units = {x: this.#checkUnits(start.x, stop.x), y: this.#checkUnits(start.y, stop.y), z: this.#checkUnits(start.z, stop.z)}
                break
            default:
                throw new Error(`Unit processing error, number of values is not between 1 and 3`)
        }
        // Checking that the animation is managed and that it has all the information necessary for its operation
        switch (type) {
            case 'translate3d':
                if (startArray.length !== 3) throw new Error(`There are not enough values declared for this animation type`)
                else {
                    this.#type = type
                    this.#startAnim = `translate3d(${start.x},${start.y},${start.z})`
                    this.#stopAnim = `translate3d(${stop.x},${stop.y},${stop.z})`
                }
                break;
            default:
                throw new Error(`The animation type is wrong or not processed`)
        }

        // All tests are good, we can assign all our variables
        switch (startArray.length) {
            case 1:
                this.#start = {x: this.#clearUnits(start.x, this.#units.x)}
                this.#stop = {x: this.#clearUnits(stop.x, this.#units.x)}
                this.#percents = {x: this.#percent(this.#start.x,this.#stop.x)}
                break
            case 2:
                this.#start = {x: this.#clearUnits(start.x, this.#units.x), y: this.#clearUnits(start.y, this.#units.y)}
                this.#stop = {x: this.#clearUnits(stop.x, this.#units.x), y: this.#clearUnits(stop.y, this.#units.y)}
                this.#percents = {x: this.#percent(this.#start.x,this.#stop.x), y: this.#percent(this.#start.y,this.#stop.y)}
                break
            case 3:
                this.#start = {x: this.#clearUnits(start.x, this.#units.x), y: this.#clearUnits(start.y, this.#units.y), z: this.#clearUnits(start.z, this.#units.z)}
                this.#stop = {x: this.#clearUnits(stop.x, this.#units.x), y: this.#clearUnits(stop.y, this.#units.y), z: this.#clearUnits(stop.z, this.#units.z)}
                this.#percents = {x: this.#percent(this.#start.x,this.#stop.x), y: this.#percent(this.#start.y,this.#stop.y), z: this.#percent(this.#start.y,this.#stop.y)}
                break
        }

        this.#element = DOMElement
    }

    /**
     *
     * @param {string|number} valueStart
     * @param {string|number} valueStop
     * @return {string}
     */
    #checkUnits = (valueStart, valueStop) => {
        let ret = 'error'
        const test = ['px','em','%',null]
        if (valueStart === null && valueStop === null) ret = ''
        else if (valueStart === '0' && valueStop === '0') ret = ''
        else {
            test.forEach(function (unit) {
                if(
                    valueStart.toString().includes(unit) && (valueStop.toString().includes(unit) || valueStop === '0')
                    || valueStop.toString().includes(unit) && (valueStart.toString().includes(unit) || valueStart === '0')
                ) ret = unit
            })
        }
        if (ret === 'error') throw new Error(`The units are not the same between start (${valueStart}) and stop (${valueStop})`)
        else return ret
    }

    /**
     *
     * @param {string|number} value
     * @param {string} unit
     * @return {number}
     */
    #clearUnits = (value, unit) => {
        if (value === 0) return 0
        else if (value === null) return null
        else return parseInt(value.replace(unit,''),10)
    }

    /**
     *
     * @param {number} startValue
     * @param {number} stopValue
     * @return {number}
     */
    #percent = (startValue, stopValue) => {return (stopValue - startValue) / 100}

    /**
     * Allows the element to be animated based on the specified scroll percentage
     * @param {number} scrollPercent
     */
    animPercent = (scrollPercent) => {
        switch (this.#type){
            case 'translate3d':
                const x = scrollPercent * this.#percents.x+''+this.#units.x
                const y = scrollPercent * this.#percents.y+''+this.#units.y
                const z = scrollPercent * this.#percents.z+''+this.#units.z
                const transform = `${this.#type}(${x},${y},${z})`
                this.#element.style.transform = transform
                break
        }
    }
    /**
     * Returns the starting value of the animation
     */
    animStart = () => {
        this.#element.style.transform = this.#startAnim
    }
    /**
     * Returns the end value of the animation
     */
    animStop = () => {
        this.#element.style.transform = this.#stopAnim
    }
}

class Scrollyt {
    #scrollPosition = 0
    #viewHeight = 0
    #onView = this.#viewHeight

    /**
     * @typedef point
     * @type {string}
     * @property top - Top of the item or view
     * @property middle - Vertical middle of the element or view
     * @property bottom - Bottom of the item or view
     */

    constructor() {
        this.#viewHeight = window.innerHeight
        document.addEventListener('scroll', (event) => {
            this.#scrollPosition = window.scrollY
            this.#onView = this.#scrollPosition + this.#viewHeight
        })
    }

    /**
     * Allows you to calculate where the scroll points are relative to an element
     * @function definePoint
     * @param {HTMLElement} element
     * @param {string} point
     * @return {number}
     */
    #definePoint = (element, point) => {
        let offset = null
        let paramsPoint = point.split('-')
        if(paramsPoint.length >= 3) {
            // If 4 parameters exist and the third is empty, it means that we want a negative number
            // We correct this by deleting the 4th parameter and retrieving its negative value in the 3rd
            if(paramsPoint.length === 4 && paramsPoint[2] === "") {
                paramsPoint[2] = -paramsPoint[3]
                paramsPoint.pop()
            }
            offset = parseInt(paramsPoint[2], 10)
        }
        const elementPoint = paramsPoint[0]
        const viewPoint = paramsPoint[1]
        const elementRect = element.getBoundingClientRect()

        let elementPos = null
        let breakPoint = null
        switch(elementPoint) {
            case 'top': elementPos = 0; break
            case 'middle': elementPos = elementRect.height / 2; break
            case 'bottom': elementPos = elementRect.height; break
            default: elementPos = 0
        }
        switch (viewPoint) {
            case 'top': offset === null ? breakPoint = elementPos : breakPoint = elementPos + offset; break
            case 'middle': offset === null ? breakPoint = (this.#viewHeight / 2) - elementPos : breakPoint = (this.#viewHeight / 2) - elementPos + offset; break
            case 'bottom': offset === null ? breakPoint = this.#viewHeight - elementPos : breakPoint = this.#viewHeight - elementPos + offset; break
            default: offset === null ? breakPoint = this.#viewHeight : breakPoint = this.#viewHeight + offset
        }
        return breakPoint
    }

    /**
     * Triggering a css animation on an element by adding a class
     * @function scrollAnimate
     * @param {string} id Identifies by class name the elements to animate
     * @param {string} position Identifier of the initial position of the animation
     * @param {number} offset In pixels, the offset from the initial position of the animation
     * @param {string} [animation=on] CSS modifier class
     */

    scrollAnimate = (id, position, offset = 0, animation = 'on') => {
        const elements = document.getElementsByClassName(id)
        for (let index = 0; index < elements.length; index++) {
            const item = elements[index];
            const topViewport = item.getBoundingClientRect()
            const topElement = topViewport.y

            let start = null
            switch (position) {
                case 'bottom': start = topElement; break;
                case 'middle': start = topElement + (this.#viewHeight / 2); break;
                case 'top': start = topElement + this.#viewHeight; break;
            }

            if (offset !== 0) { start = start - offset }

            document.addEventListener('scroll', (event) => {
                if (this.#onView >= start) item.classList.add(animation)
                if (this.#onView < start) item.classList.remove(animation)
            })
        }
    }

    /**
     * Create an animation between 2 scroll points
     * @function twoPointsTransform
     * @param {string} AnimationElement - ID of the element to animate
     * @param {string} AnimationType - Type of CSS animation desired (translate3d, rotate3d, ...)
     * @param {string} AnimationStartParams - Values of animation at start
     * @param {string} AnimationStopParams - Values of animation at stop
     * @param {string} TriggerElementID - ID of the element that will trigger the animation based on its position
     * @param {string} startPointParams - Position of the TriggerElement where the animation will start
     * @param {string} stopPointParams - Position of the TriggerElement where the animation will stop
     */
    twoPointsTransform = (AnimationElement, AnimationType, AnimationStartParams, AnimationStopParams ,TriggerElementID, startPointParams, stopPointParams) => {
        const animation = new SytAnim(AnimationElement, AnimationType, AnimationStartParams, AnimationStopParams)
        const element = document.getElementById(TriggerElementID)
        if(element === null) throw new Error(`No element with ID ${TriggerElementID} were found`)

        const startPoint = this.#definePoint(element, startPointParams)
        const stopPoint = this.#definePoint(element, stopPointParams)

        // Retrieve the value of a percent of the scroll animation in scroll pixels
        const percent = startPoint > stopPoint ? (startPoint - stopPoint) / 100 : (stopPoint - startPoint) / 100
        const distAnimation = startPoint > stopPoint ? startPoint - stopPoint : stopPoint - startPoint

        document.addEventListener('scroll', () => {
            const elementPosition = element.getBoundingClientRect().y
            const scrollPercent = Math.round((startPoint - elementPosition) / percent )
            if(elementPosition <= startPoint && elementPosition >= stopPoint) {
                animation.animPercent(scrollPercent)
            } else {
                if (elementPosition > startPoint) animation.animStart()
                else animation.animStop()
            }
        })
    }
}