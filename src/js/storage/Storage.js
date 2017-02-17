import _ from 'lodash';
import {getChromeStorage} from '../util';
let deepAssign = require('deep-assign');

class Storage {
    constructor(local) {
        this.storage = getChromeStorage(local);
    }

    getRoot(key, callback) {
        this.storage.get(key, (data) => {
            data = data ? data[key] : undefined;
            callback(data);
        });
    }

    setRoot(key, data, callback) {
        let syncedData = {};
        syncedData[key] = data;

        this.storage.set(syncedData, () => {
            if (callback) {
                callback();
            }
        });
    }

    setData(key, data, callback) {
        this.getRoot(key, (syncedData) => {
            let newData = {};

            if (!syncedData) {
                newData[key] = data;
            } else {
                newData[key] = deepAssign({}, syncedData, data);
            }

            this.storage.set(newData, () => {
                if (callback) {
                    callback();
                }
            });
        });
    }

    find(key, search, callback) {
        this.getRoot(key, (syncedData) => {
            let result;
            if (syncedData && _.has(syncedData, search)) {
                result = _.get(syncedData, search);
            } else {
                result = undefined;
            }

            if (callback) {
                callback(result);
            }
        });
    }

    delete(key, search, callback) {
        this.getRoot(key, (syncedData) => {
            if (syncedData && _.has(syncedData, search)) {
                let newData = _.omit(syncedData, search);
                this.setData(key, newData, callback);
            }
        });
    }

    clear(callback) {
        this.storage.clear();
        if (callback) {
            callback();
        }
    }
}

export default Storage;
