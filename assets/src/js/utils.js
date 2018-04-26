// For things that must only happen once
export function loader(promiseCreator) {
    let promise
    
    return (...args) => {
        if (!promise) {
            promise = promiseCreator(...args)
        }

        return promise
    }
}

export function copyToClipboard(text){
    var dummy = document.createElement("input")
    document.body.appendChild(dummy)
    dummy.setAttribute('value', text)
    dummy.select()
    console.log('Browser allowed copying:', document.execCommand("copy"))
    document.body.removeChild(dummy)
}
