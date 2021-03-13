/*global gdn*/

(() => {
    "use strict"

    // data model
    const model = (() => {

        const key = "signup-cta"
        const defaults = {
            later: 0,
            never: false,
            scroll: 0,
            discussions: []
        }

        const get = (item) => {
            const data = JSON.parse(localStorage.getItem(key)) || defaults
            if (item !== undefined) {
                return data[item]
            }
            return data
        }

        const set = (item, value) => {
            const data = get()
            data[item] = value
            localStorage.setItem(key, JSON.stringify(data))
        }

        return {
            // Register user activity through scrolling (debounced to 30sec).
            scroll: (() => {
                let timeout = false
                return () => {
                    if (!timeout) {
                        timeout = true
                        setTimeout(() => {
                            timeout = false
                            set("scroll", get("scroll") + 1)
                        }, 30000)
                    }
                }
            })(),

            // Register topics visited.
            discussion: (id) => {
                const ids = get("discussions")
                // Count unique discussions.
                if (ids.indexOf(id) === -1) {
                    ids.push(id)
                    set("discussions", ids)
                }
            },

            // Check if the call to action should be shown.
            ask: () => {
                const data = get()
                return data.scroll > 5 &&
                        data.discussions.length > 2 &&
                        Date.now() - data.later > 86400000 &&
                        !data.never
            },

            // Ask me again (after a day has passed).
            later: () => {
                set("later", Date.now())
            },

            // Never ask me again.
            never: () => {
                set("never", true)
            }
        }

    })()

    ;

    // document.ready
    ((callback) => {
        if (["complete", "interactive"].includes(document.readyState)) {
            setTimeout(callback, 0)
        } else {
            document.addEventListener("DOMContentLoaded", callback)
        }
    })(() => {
        // We only need this for guests.
        if (!gdn.definition("isGuest", false)) {
            // Explicitly check for a valid session.
            /*if (!gdn.definition("isGuest", true) === false) {
                model.never()
            }*/
            return
        }

        const cta = document.querySelector(".signup-cta")
        if (!cta) {
            return
        }

        cta.querySelector("button.later").addEventListener("click", () => {
            model.later()
            cta.classList.add("Hidden")
        })

        if (model.ask()) {
            cta.classList.remove("Hidden")
            cta.dispatchEvent(new Event("signup-cta"))
        } else {
            document.addEventListener("scroll", model.scroll)
            const id = gdn.definition("DiscussionID", false)
            if (id) {
                model.discussion(id)
            }
        }

    })

})()
