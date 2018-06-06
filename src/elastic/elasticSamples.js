// Other examples that are not used in the code

exports.searchAll = function() {
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
