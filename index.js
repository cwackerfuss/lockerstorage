var Lockr = require('lockr')

module.exports = () => ({

    data: null,
    loaded: false,

    // initialization function
    getInitialStore: function(config) {

        let initial

        if ( localStorage.length === 0 || !this.persistFlagIsOn(config.development) ) {

            if (config.initialState) {
                initial = config.initialState
                Lockr.set('$', initial)
                this.data = initial
            } else {
                console.error('Initial state not passed to getInitialStore')
            }

        } else {
            initial = Lockr.get('$')
            this.data = initial
        }
        this.loaded = true
        return initial
    },

    // ref
    // Returns a reference to the query's state location
    //

    ref: function(path, set = false) {
        let pathData = this.data,
        create = false,
        keyToCreate

        for (let i = 0; i < path.length; i++) {
            if (set) {
                if (pathData[path[i]] !== undefined) {
                    pathData = pathData[path[i]]
                } else {
                    if (i+1 === path.length) {
                        keyToCreate = path[i]
                        create = true
                    } else {
                        console.error('When using set(), you can only create a branch one level deeper than an already created branch. \nYour path fails because it contains more than one uncreated branch: \n--' + path)
                        break
                    }
                }
            } else {
                pathData = pathData[path[i]]
            }
        }

        if (pathData === undefined) {
            console.error('Tried to update the store in a location that does not exist: \n--' + path)
        }

        return {
            data: pathData !== undefined ? pathData : undefined,
            keyToCreate: keyToCreate !== undefined ? keyToCreate : null,
            create: create !== undefined ? create : null
        }
    },


    // persist
    // Save current store state to LocalStorage with Lockr.
    // Should only need to be used internally by API

    persist: function() {
        Lockr.set('$', this.data)
    },

    // set
    // Write or replace data to a defined path, such as product/meta/prices.
    //

    set: function(path, data) {
        // pass true as second argument to .ref() to indicate this may be referencing a new branch
        let pathData = this.ref(path, true)

        console.log(pathData);

        if (pathData.data === undefined) {
            console.error('Set failed.')
            return false
        } else {
            if (pathData.create) {
                pathData.data[pathData.keyToCreate] = data
            } else {
                if (typeof pathData.data === 'object') {
                    pathData.data = Object.assign(pathData.data, data)
                } else {
                    pathData.data = data
                }

            }
            this.persist()
        }
    },

    // push
    // Add to the end of a list of data. Push can only be used on an array.
    //

    push: function(path, data) {
        let pathData = this.ref(path).data

        if (pathData === undefined) {
            console.error('Push failed.')
            return false
        } else {
            if (Array.isArray(pathData)) {
                pathData.push(data)
                this.persist()
            } else {
                console.error("'Push' can only be used on an array.")
            }
        }
    },


    // unshift
    // Add to beginning of a list of data. Unshift can only be used on an array.
    //

    unshift: function(path, data) {
        let pathData = this.ref(path).data

        if (pathData === undefined) {
            console.error('Unshift failed.')
            return false
        } else {
            if (Array.isArray(pathData)) {
                pathData.unshift(data)
                this.persist()
            } else {
                console.error("'Unshift' can only be used on an array.")
            }
        }
    },


    //
    // remove
    // Remove data from a specific location
    // This is a curried function, so you must pass two sets of ()'s when you call it.
    // The first () contains an argument that is the key which you wish to delete, and the second () contains the path to the parent of that key.
    //

    remove: function(key) {
        return path => {
            let pathData = this.ref(path).data
            if (pathData === undefined) {
                console.error('Remove failed.')
                return false
            } else {
                if (pathData[key] === undefined) {
                    console.error('Remove failed. Key not present in data path.')
                    return false
                } else {
                    if (Array.isArray(pathData)) {
                        pathData.splice(key, 1)
                    } else {
                        delete pathData[key]
                    }
                    this.persist()
                }
            }
        }
    },

    renderClearStorageBtn: function(isOn) {
        // always needed to render the toggle
        var newDiv = document.createElement("div");
        var newButton = document.createElement("button");
        newButton.innerText = 'X';
        newDiv.appendChild(newButton);

        Object.assign(newButton.style, {
            padding: '5px 8px',
            color: 'white',
            display: 'block',
            width: '100%',
            borderWidth: '0',
            opacity: '0.75',
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: '#E32315'
        })
        Object.assign(newDiv.style, {
            left: '100px',
            bottom: '10px',
            position: 'fixed',
            zIndex: '9999',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '30px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        });

        newDiv.addEventListener('click', function() {
            localStorage.clear();
            location.reload();
        })

        document.body.appendChild(newDiv);

    },

    renderPersistToggle: function(isOn) {
        // always needed to render the toggle
        var newDiv = document.createElement("div");
        var newLabel = document.createElement("span");
        var newButton = document.createElement("button");
        newLabel.innerText = 'Persistence is';
        newButton.innerText = isOn ? 'On' : 'Off';
        newDiv.appendChild(newLabel);
        newDiv.appendChild(newButton);
        newButton.style.backgroundColor = isOn ? '#078576' : '#E32315';

        Object.assign(newButton.style, {
            padding: '5px 8px',
            color: 'white',
            display: 'block',
            width: '100%',
            borderWidth: '0',
            opacity: '0.75',
            borderRadius: '5px',
            cursor: 'pointer'
        })
        Object.assign(newLabel.style, {
            marginBottom: '5px',
            fontSize: '0.5rem'
        })
        Object.assign(newDiv.style, {
            left: '10px',
            bottom: '10px',
            position: 'fixed',
            zIndex: '9999',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textAlign: 'center',
            width: '80px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
        });

        newDiv.addEventListener('click', function() {
            let current = Lockr.get('persist_lockr_room');
            Lockr.set('persist_lockr_room', !current);
            newButton.innerText = current ? 'Off' : 'On';
            newButton.style.backgroundColor = current ? '#E32315' : '#078576';
        })

        document.body.appendChild(newDiv);

    },

    persistFlagIsOn: function(devFlag) {

        if (!devFlag) {return false};

        this.renderClearStorageBtn();

        let flag = Lockr.get('persist_lockr_room')

        if (typeof flag === 'boolean') {
            this.renderPersistToggle(flag)
            return flag;
        } else {
            Lockr.set('persist_lockr_room', true)
            this.renderPersistToggle(true)
            return true
        }

    }

})
