import React, {Component} from 'react';
import '../style/App.css';
import Results from './Results';
import elastic from '../elastic/elastic.js';
var data = require('../elastic/shorter_data.json');

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromYear: "",
            toYear: "",
            checkedBoxes: [],
            searchTerm: "",
            results: [],
            total: 0,
            numOfPages: 0,
            currentPage: 1,
            from: 0,
            noResults: false
        }
    }

    componentWillMount() {
            // elastic.indexing('library', 'default', data).then(()=>{
                elastic.findMinYear().then(result => {
                    this.setState({fromYear: result.aggregations.min_year.value})
                    elastic.findMaxYear().then(result => {
                        this.setState({toYear: result.aggregations.max_year.value})
                    })
                })
            // });
    }

    handleSubmit() {
        let {searchTerm, fromYear, toYear, checkedBoxes, currentPage, from} = this.state;
        if(checkedBoxes.length === 0) {
            checkedBoxes = ["authors.firstname", "authors.lastname", "title", "body"];
        }
        if(searchTerm.length > 0) {
            elastic.searchMultiMatch(searchTerm, checkedBoxes, fromYear, toYear, from).then((results)=> {
                this.setState({
                results: results,
                total: results.hits.total,
                numOfPages: Math.ceil(results.hits.total/20),
                noResults: results.hits.total === 0 ? true : false
                })
            })
        }
    }

    handleChangeInCheckbox(e) {
        let {checkedBoxes} = this.state;
        let whichBox = e.target.value;
        let checked = e.target.checked;
        checked ? checkedBoxes.push(whichBox) : checkedBoxes.splice(checkedBoxes.indexOf(whichBox), 1);
        this.setState({checkedBoxes});
    }

    handleSearchTermChange(e) {
        this.setState({searchTerm: e.target.value});
    }

    handleFromYaerChange(e) {
        this.setState({fromYear: e.target.value});

    }

    handleToYaerChange(e) {
        this.setState({toYear: e.target.value});
    }

    handleClickOnPrev() {
        this.setState({
            from: this.state.from-=20,
            currentPage: this.state.currentPage-=1
            })
        let {searchTerm, fromYear, toYear, checkedBoxes, currentPage, from} = this.state;
        elastic.searchMultiMatch(searchTerm, checkedBoxes, fromYear, toYear, from).then((results) => {
            this.setState({
                results: results
            })
        })
    }

    handleClickOnNext() {
        this.setState({
            from: this.state.from+=20,
            currentPage: this.state.currentPage+=1
            })
        let {searchTerm, fromYear, toYear, checkedBoxes, currentPage, from} = this.state;
        elastic.searchMultiMatch(searchTerm, checkedBoxes, fromYear, toYear, from).then((results) => {
            this.setState({
                results: results
            })
        })
    }

    render() {
        let {fromYear, toYear, results, total, numOfPages, currentPage, noResults} = this.state;
        return (
            <div className="App">
                <h1>Search For an Artice</h1>
                <div className="input-area">
                    <input className="input-field" placeholder="what do you want to search?" onChange={this.handleSearchTermChange.bind(this)}/>
                    <h3>Search in:</h3>
                    <label className="checkBox">
                        <input type="checkbox" name="firstname" value="authors.firsname" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        {"Author's first name"}
                    </label>
                    <label className="checkBox"><input type="checkbox" name="lastname" value="authors.lastname" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        {"Author's last name"}
                    </label>
                    <label className="checkBox"><input type="checkbox" name="title" value="title" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Title of the article
                    </label>
                    <label className="checkBox"><input type="checkbox" name="body" value="body" onChange={this.handleChangeInCheckbox.bind(this)}/>
                        Body of the article
                    </label>
                    <div>
                    <label className="checkBox"><input type="text" name="fromYear" placeholder={fromYear}
                    onChange={this.handleFromYaerChange.bind(this)}/>
                        From year
                    </label>
                    <label className="checkBox"><input type="text" name="fromYear" placeholder={toYear}
                    onChange={this.handleToYaerChange.bind(this)}/>
                        To year
                    </label>
                    </div>
                    <button id="submit-button" onClick={this.handleSubmit.bind(this)}>
                        Submit
                    </button>
                    {noResults ? <h3> No Results </h3> : ""}
                </div>
                <div>
                {total > 0 ? <Results results={results}/> : ""}
                </div>
                <div className={numOfPages === 0
                    ? "noDisplay"
                    : "pagination"}>
                    <button className={currentPage == 1
                        ? "noDisplay"
                        : "page-button"} onClick={this.handleClickOnPrev.bind(this)}>prev</button>
                    <p style={{
                        display: "inline-block"
                    }}>{currentPage}</p>
                    <button className={currentPage == numOfPages
                        ? "noDisplay"
                        : "page-button"} disables="" onClick={this.handleClickOnNext.bind(this)}>next</button>
                </div>
            </div>
        );
    }
}

export default App;
