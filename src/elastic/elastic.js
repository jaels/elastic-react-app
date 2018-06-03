const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'error'
});


var data = require('./shorter_data.json');

const search = function search(index, body) {
    return esClient.search({
        index: index,
        body: body
    });
};

exports.indexing = function() {
    const bulkIndex = function bulkIndex(index, type, data) {
        let bulkBody = [];
        data.forEach(item => {
            bulkBody.push({
                index: {
                    _index: index,
                    _type: type,
                    _id: item.id
                }
            });

            bulkBody.push(item);
        });


        esClient.bulk({
                body: bulkBody
            })
            .then(response => {
                let errorCount = 0;
                response.items.forEach(item => {
                    if (item.index && item.index.error) {
                        console.log(++errorCount, item.index.error);
                    }
                });
                console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
            })
            .catch(console.err);
    };

    bulkIndex('library', 'default', data);
}


// exports.findIndices = function() {
//     const indices = function indices() {
//       return esClient.cat.indices({v: true})
//       .then(console.log)
//       .catch(err => console.error(`Error connecting to the es client: ${err}`));
//     };
//
//     // only for testing purposes
//     // all calls should be initiated through the module
//     let test = function test() {
//       console.log(`elasticsearch indices information:`);
//       indices();
//     };
//
//     test();
//
// }

exports.searchAll = function() {

    // only for testing purposes
    // all calls should be initiated through the module
    let test = function test() {
        let body = {
            size: 20,
            from: 0,
            query: {
                match_all: {}
            }
        };

        console.log(`retrieving all documents (displaying ${body.size} at a time)...`);

        search('library', body)
            .then(results => {
                console.log(results);
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                console.log(`returned article titles:`);
                results.hits.hits.forEach((hit, index) => console.log(`\t${body.from + ++index} - ${hit._source.title}`));
            })
            .catch(console.error);
    };

    test();
}


exports.searchBool = function() {
    let body = {
        size: 20,
        from: 0,
        query: {
            bool: {
                must: [{
                    query_string: {
                        query: '(authors.firstname:D* OR authors.lastname:H*) AND (title:excepteur)'
                    }
                }],
                should: [{
                    match_phrase: {
                        body: 'Elit nisi fugiat dolore amet'
                    }
                }],
                must_not: [{
                    range: {
                        year: {
                            lte: 2000,
                            gte: 1990
                        }
                    }
                }]
            }
        }
    };

    console.log(`retrieving documents with a combined bool query (displaying ${body.size} items at a time)...`);
    search('library', body)
        .then(results => {
            console.log(`found ${results.hits.total} items in ${results.took}ms`);
            if (results.hits.total > 0) console.log(`returned article titles:`);
            results.hits.hits.forEach((hit, index) => console.log(`\t${body.from + ++index} - ${hit._source.title} (score: ${hit._score})`));
        })
        .catch(console.error);
};



exports.searchMatch = function() {
    let body = {
        size: 20,
        from: 0,
        query: {
            match: {
                title: {
                    query: 'Quist',
                    minimum_should_match: 3,
                    fuzziness: 2
                }
            }
        }
    };

    console.log(`retrieving documents whose title matches '${body.query.match.title.query}' (displaying ${body.size} items at a time)...`);
    search('library', body)
        .then(results => {
            console.log(`found ${results.hits.total} items in ${results.took}ms`);
            if (results.hits.total > 0) console.log(`returned article titles:`);
            results.hits.hits.forEach((hit, index) => console.log(`\t${body.from + ++index} - ${hit._source.title} (score: ${hit._score})`));
        })
        .catch(console.error);
};


exports.searchMatchPhrase = function() {
    let body = {
        size: 20,
        from: 0,
        query: {
            match_phrase: {
                title: {
                    query: 'voluptate'
                }
            }
        }
    };

    console.log(`retrieving documents whose title matches phrase (displaying ${body.size} items at a time)...`);
    search('library', body)
        .then(results => {
            console.log(`found ${results.hits.total} items in ${results.took}ms`);
            if (results.hits.total > 0) console.log(`returned article titles:`);
            results.hits.hits.forEach((hit, index) => console.log(`\t${body.from + ++index} - ${hit._source.title} (score: ${hit._score})`));
        })
        .catch(console.error);
};



exports.searchMultiMatch = function(query, fields) {
    let body = {
        size: 20,
        from: 0,
        query: {
            multi_match: {
                query: query,
                fields: fields
            }
        }
    };

    search('library', body)
        .then(results => {
            console.log(`found ${results.hits.total} items in ${results.took}ms`);
            if (results.hits.total > 0) console.log(`returned article titles:`);
            results.hits.hits.forEach((hit, index) => console.log(`\t${body.from + ++index} - ${hit._source.title} (score: ${hit._score})`));
        })
        .catch(console.error);
};


exports.findMinYear = function() {
    return new Promise(function(resolve, reject) {
        let body = {
            size: 0,
            aggs: {
                min_year: {
                    min: {
                        field: "year"
                    }
                }
            }
        }

        search("library", body).then((result) => {
            console.log(result);
            resolve(result);
        });
    });
}


exports.findMaxYear = function() {
    return new Promise(function(resolve, reject) {
        let body = {
            size: 0,
            aggs: {
                max_year: {
                    max: {
                        field: "year"
                    }
                }
            }
        }

        search("library", body).then((result) => {
            console.log(result);
            resolve(result);
        });
    })
}
