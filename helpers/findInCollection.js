'use strict';

// FIND ITEM FROM COLLECTION
module.exports.findInCollection = (searchTerm, collection, property) => {
    let results = [];
    
    for (let i = 0; i < collection.length; i++) {
        const item = collection[i]
        // const words = item.name.split(" ")

        // for (let j = 0; j < words.length; j++) {
        //     if (words[j].toLowerCase().startsWith(searchTerm.toLowerCase())) {
        //         results.push(item)
        //         break;
        //     }
        // }
        if (item[property].toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(item);
        }
    }
    results = results.sort((a, b) => a[property].localeCompare(b[property], 'en', { 'sensitivity': 'base' }));
    return results;
}
