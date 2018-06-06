const elasticsearch = require('elasticsearch');
const esClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    log: 'error'
});



const search = function search(index, body) {
    return esClient.search({
        index: index,
        body: body
    });
};

exports.indexing = function(index, type, data) {
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

    return new Promise(function(resolve, reject) {
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
                resolve("success");
            })
            .catch(console.err);
    })
}

exports.findMinYear = function() {
    let body = {
        aggs: {
            min_year: {
                min: {
                    field: "year"
                }
            }
        }
    }
    return new Promise(function(resolve, reject) {
        search("library", body).then((result) => {
            resolve(result);
        });
    });
}


exports.findMaxYear = function() {
    let body = {
        aggs: {
            max_year: {
                max: {
                    field: "year"
                }
            }
        }
    }
    return new Promise(function(resolve, reject) {
        search("library", body).then((result) => {
            resolve(result);
        });
    })
}


exports.searchMultiMatch = function(searchTerm, fields, fromYear, toYear, from) {
    let body = {
        _source: ["authors", "title", "link"],
        size: 20,
        from: from,
        query: {
            bool: {
                must: {
                    multi_match: {
                        query: searchTerm,
                        fields: fields,
                        operator: "and"
                    }
                },
                filter: {
                    range: {
                        year: {
                            gte: fromYear,
                            lte: toYear
                        }
                    }
                }
            }
        },
        highlight: {
            fields: {
                title: {},
                "authors.lastname": {}
            },
            pre_tags: ["<strong>"],
            post_tags: ["</strong>"]
        }
    };

    return new Promise(function(resolve, reject) {
        search('library', body)
            .then(results => {
                console.log(`found ${results.hits.total} items in ${results.took}ms`);
                if (results.hits.total > 0) console.log(`returned article titles:`);
                console.log(results);
                resolve(results);
            })
            .catch(console.error);
    })
};


exports.getArticle = function (id) {
    let body = {
        _source: ["body"],
        query: {
            terms: {
                _id: [id]
            }
        }
    }

    return new Promise(function(resolve, reject) {
        search('library', body)
            .then(results => {
                resolve(results.hits.hits[0]);
            })
            .catch(console.error);
    })
}
